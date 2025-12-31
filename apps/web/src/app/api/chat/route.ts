import { auth } from "@better-gpt/auth";
import {
	convertToModelMessages,
	createUIMessageStream,
	JsonToSseTransformStream,
	smoothStream,
	streamText,
	type UIMessage,
} from "ai";
import { headers } from "next/headers";
import { generateTitleFromUserMessage } from "@/actions/generate-title";
import {
	getChatById,
	saveChat,
	saveMessages,
	updateChatTitleById,
} from "@/lib/db/queries";
import openRouterProvider from "@/lib/openrouter";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export const maxDuration = 60;

interface ChatRequestBody {
	id: string;
	messages: UIMessage[];
	model?: string;
}

function generateUUID(): string {
	return crypto.randomUUID();
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as ChatRequestBody;
		const {
			id: chatId,
			messages: uiMessages,
			model = "xiaomi/mimo-v2-flash:free",
		} = body;

		if (!chatId || !uiMessages || uiMessages.length === 0) {
			return new Response(JSON.stringify({ error: "Invalid request body" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Get session (optional - allow unauthenticated users)
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		const isAuthenticated = !!session?.user;
		const userId = session?.user?.id;

		// Rate limit unauthenticated users
		if (!isAuthenticated) {
			const clientIp = getClientIp(request);
			const rateLimit = checkRateLimit(clientIp);

			if (!rateLimit.allowed) {
				return new Response(
					JSON.stringify({
						error: "Rate limit exceeded",
						message:
							"You have reached your daily limit. Please sign in for unlimited access.",
						resetAt: rateLimit.resetAt,
					}),
					{
						status: 429,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
		}

		// Get the last user message for title generation
		const lastUserMessage = uiMessages.findLast((m) => m.role === "user");

		// Check if chat exists (for authenticated users)
		let shouldGenerateTitle = false;
		let titlePromise: Promise<string> | null = null;

		if (isAuthenticated && userId) {
			const existingChat = await getChatById({ id: chatId });

			if (existingChat) {
				// Verify ownership
				if (existingChat.userId !== userId) {
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}
			} else {
				// Create new chat
				await saveChat({
					id: chatId,
					userId,
					title: "New chat",
					visibility: "private",
				});
				shouldGenerateTitle = true;

				// Start title generation in parallel (don't await)
				if (lastUserMessage) {
					titlePromise = generateTitleFromUserMessage({
						message: { content: getMessageContent(lastUserMessage) },
					});
				}
			}

			// Save the user message
			if (lastUserMessage) {
				await saveMessages({
					messages: [
						{
							id: lastUserMessage.id,
							chatId,
							role: "user",
							parts: lastUserMessage.parts,
							attachments: [],
							createdAt: new Date(),
						},
					],
				});
			}
		}

		// Determine if this is a reasoning model
		const isReasoningModel =
			model.includes("reasoning") ||
			model.includes("thinking") ||
			model.includes("o1") ||
			model.includes("o3") ||
			model.includes("deepseek-r1");

		// Create the UI message stream
		const stream = createUIMessageStream({
			execute: async ({ writer: dataStream }) => {
				// Handle title generation in parallel
				if (titlePromise) {
					titlePromise.then((title) => {
						updateChatTitleById({ chatId, title });
						dataStream.write({ type: "data-chat-title", data: title });
					});
				}

				const result = streamText({
					model: openRouterProvider(model),
					messages: await convertToModelMessages(uiMessages),
					experimental_transform: isReasoningModel
						? undefined
						: smoothStream({ chunking: "word" }),
					providerOptions: isReasoningModel
						? {
								anthropic: {
									thinking: { type: "enabled", budgetTokens: 10_000 },
								},
							}
						: undefined,
				});

				result.consumeStream();

				dataStream.merge(
					result.toUIMessageStream({
						sendReasoning: true,
					}),
				);
			},
			generateId: generateUUID,
			onFinish: async ({ messages: finishedMessages }) => {
				// Save assistant messages for authenticated users
				if (isAuthenticated && userId && finishedMessages.length > 0) {
					await saveMessages({
						messages: finishedMessages.map((msg) => ({
							id: msg.id,
							chatId,
							role: msg.role,
							parts: msg.parts,
							attachments: [],
							createdAt: new Date(),
						})),
					});
				}
			},
			onError: () => {
				return "Oops, an error occurred!";
			},
		});

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
	} catch (error) {
		console.error("Chat API error:", error);

		// Handle missing API key error
		if (
			error instanceof Error &&
			error.message.includes("OPENROUTER_API_KEY")
		) {
			return new Response(
				JSON.stringify({
					error: "Configuration error",
					message:
						"OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

function getMessageContent(message: UIMessage): string {
	// Handle parts-based content
	if (message.parts) {
		return message.parts
			.filter(
				(part): part is { type: "text"; text: string } => part.type === "text",
			)
			.map((part) => part.text)
			.join("\n");
	}
	return "";
}
