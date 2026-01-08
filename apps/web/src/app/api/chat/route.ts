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
	getMessagesByChatId,
	saveChat,
	saveMessages,
	updateChatTitleById,
} from "@/lib/db/queries";
import { createGuestUser, GUEST_COOKIE_NAME, getGuestId } from "@/lib/guest";
import openRouterProvider from "@/lib/openrouter";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { convertToUIMessages } from "@/lib/utils";

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
			messages: incomingMessages,
			model = "xiaomi/mimo-v2-flash:free",
		} = body;

		if (!chatId || !incomingMessages || incomingMessages.length === 0) {
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
		let userId = session?.user?.id;
		let newGuestId: string | undefined;

		// Handle guest users
		if (!userId) {
			userId = await getGuestId();
			if (!userId) {
				userId = await createGuestUser();
				newGuestId = userId;
			}
		}

		// Rate limit unauthenticated users (real users who are not logged in)
		if (!isAuthenticated) {
			const clientIp = getClientIp(request);
			const rateLimit = checkRateLimit(clientIp);

			if (!rateLimit.allowed) {
				return new Response(
					JSON.stringify({
						error: "Daily limit reached",
						message:
							"You’ve used all free requests for today. Sign in to continue without limits.",
						resetAt: rateLimit.resetAt,
						action: "sign-in",
					}),
					{
						status: 429,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
		}

		// Get the last user message
		const lastUserMessage = incomingMessages.findLast((m) => m.role === "user");

		// Check if chat exists and fetch previous messages
		let _shouldGenerateTitle = false;
		let titlePromise: Promise<string> | null = null;
		let messagesFromDb: UIMessage[] = [];

		if (userId) {
			const existingChat = await getChatById({ id: chatId });

			if (existingChat) {
				// Verify ownership
				if (existingChat.userId !== userId) {
					console.log(
						`Forbidden access attempt: Chat User ID ${existingChat.userId} !== Request User ID ${userId}`,
					);
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}
				// Fetch existing messages
				const dbMessages = await getMessagesByChatId({ id: chatId });
				messagesFromDb = convertToUIMessages(dbMessages);
			} else {
				// Create new chat
				await saveChat({
					id: chatId,
					userId,
					title: "New chat",
					visibility: "private",
				});
				_shouldGenerateTitle = true;

				// Start title generation in parallel (don't await)
				if (lastUserMessage) {
					titlePromise = generateTitleFromUserMessage({
						message: { content: getMessageContent(lastUserMessage) },
					});
				}
			}

			// Save the user message
			if (lastUserMessage) {
				// The AI SDK generates "temporary" IDs for messages (e.g. random strings like 'ewYEAtYLXrHWvslY')
				// But our DB schema enforces standard UUIDs.
				// We must generate a real UUID if the incoming ID is not one.
				const messageId = isValidUUID(lastUserMessage.id)
					? lastUserMessage.id
					: generateUUID();

				await saveMessages({
					messages: [
						{
							id: messageId,
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

		// Combine DB messages with new message
		const uiMessages = lastUserMessage
			? [...messagesFromDb, lastUserMessage]
			: messagesFromDb;

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
				// Save assistant messages for authenticated users and guests
				if (userId && finishedMessages.length > 0) {
					await saveMessages({
						messages: finishedMessages.map((msg) => ({
							id: isValidUUID(msg.id) ? msg.id : generateUUID(),
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

		const responseHeaders = new Headers({
			"Content-Type": "application/json",
		});

		if (newGuestId) {
			responseHeaders.append(
				"Set-Cookie",
				`${GUEST_COOKIE_NAME}=${newGuestId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
			);
		}

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
			headers: responseHeaders,
		});
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

function isValidUUID(uuid: string) {
	const regex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return regex.test(uuid);
}
