"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatError } from "@/components/chat/chat-error";
import { Greeting } from "@/components/chat/greeting";
import { MessageActions } from "@/components/chat/message-actions";
import { MessageReasoning } from "@/components/chat/message-reasoning";
import {
	AVAILABLE_MODELS,
	ModelSelector,
} from "@/components/chat/model-selector";
import { PromptInputBox } from "@/components/chat/prompt-input-box";
import { ThinkingMessage } from "@/components/chat/thinking-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	ChatContainerContent,
	ChatContainerRoot,
	ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageContent } from "@/components/ui/message";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./chat-header";
import { BotMessageSquareIcon } from "./ui/bot-message-square";

interface ChatProps {
	chatId: string;
	initialMessages?: UIMessage[];
}

const Chat: React.FC<ChatProps> = ({ chatId, initialMessages = [] }) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	// Model selection state
	const [currentModelId, setCurrentModelId] = useState(AVAILABLE_MODELS[0].id);
	const currentModelIdRef = useRef(currentModelId);

	useEffect(() => {
		currentModelIdRef.current = currentModelId;
	}, [currentModelId]);

	// Create transport with dynamic model
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
				prepareSendMessagesRequest(request) {
					return {
						body: {
							id: chatId,
							messages: request.messages,
							model: currentModelIdRef.current,
						},
					};
				},
			}),
		[chatId, currentModelIdRef],
	);

	const { messages, sendMessage, regenerate, status, error } = useChat({
		id: chatId,
		transport,
		messages: initialMessages,
		experimental_throttle: 100,
	});
	console.log(error);

	const isLoading = status === "streaming" || status === "submitted";

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			router.refresh();
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [router]);

	// Handle query parameter for initial message
	const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
	const query = searchParams.get("query");

	useEffect(() => {
		if (query && !hasAppendedQuery && messages.length === 0) {
			sendMessage({ text: query });
			setHasAppendedQuery(true);
			window.history.replaceState({}, "", `/chat/${chatId}`);
		}
	}, [query, sendMessage, hasAppendedQuery, chatId, messages.length]);

	const handleSendMessage = (message: string, _files?: File[]) => {
		if (!message.trim()) return;

		// Update URL to include chatId
		window.history.pushState({}, "", `/chat/${chatId}`);

		// Send message using useChat
		sendMessage({ text: message });
	};

	const handleRegenerate = useCallback(() => {
		regenerate();
	}, [regenerate]);

	return (
		<div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
			<ChatHeader chatId={chatId} isReadonly={false}>
				<ModelSelector
					selectedModelId={currentModelId}
					onModelChange={setCurrentModelId}
				/>
			</ChatHeader>

			{/* Messages area with scroll management */}
			<ChatContainerRoot className="relative flex-1">
				<ChatContainerContent className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
					{!session && messages.length > 0 && (
						<Alert variant="default" className="border-none bg-muted/50">
							<Info className="h-4 w-4" />
							<AlertTitle>Guest Mode</AlertTitle>
							<AlertDescription>
								Your messages are not saved. Please sign in to save your chat
								history.
							</AlertDescription>
						</Alert>
					)}
					{messages.length === 0 && <Greeting />}

					{messages.map((message, index) => (
						<MessageBubble
							key={message.id}
							message={message}
							isLoading={
								status === "streaming" && messages.length - 1 === index
							}
							onRegenerate={
								message.role === "assistant" ? handleRegenerate : undefined
							}
						/>
					))}

					{status === "submitted" && <ThinkingMessage />}

					{error && <ChatError error={error} />}
					<ChatContainerScrollAnchor />
				</ChatContainerContent>
			</ChatContainerRoot>

			<div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
				<PromptInputBox onSend={handleSendMessage} isLoading={isLoading} />
			</div>
		</div>
	);
};

interface MessageBubbleProps {
	message: UIMessage;
	isLoading: boolean;
	onRegenerate?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isLoading,
	onRegenerate,
}) => {
	const isUser = message.role === "user";

	// Extract text and reasoning from parts
	const textParts = message.parts.filter((part) => part.type === "text");
	const reasoningParts = message.parts.filter(
		(part) => part.type === "reasoning",
	);

	return (
		<div
			className="group/message fade-in w-full animate-in duration-200"
			data-role={message.role}
		>
			<Message
				className={cn(
					"w-full items-start gap-2 md:gap-3",
					isUser ? "justify-end" : "justify-start",
				)}
			>
				{!isUser && (
					<div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted ring ring-foreground/10">
						<BotMessageSquareIcon className="size-6" />
					</div>
				)}

				<div
					className={cn(
						"flex flex-col gap-2",
						isUser
							? "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]"
							: "w-full",
					)}
				>
					{/* Reasoning section (collapsible) */}
					{reasoningParts.length > 0 && (
						<MessageReasoning
							reasoning={reasoningParts.map((part) => part.text).join("\n")}
							isLoading={isLoading}
						/>
					)}

					{/* Text content */}
					{textParts.map((part, i) => (
						<MessageContent
							// biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for text parts
							key={i}
							markdown
							className={cn(
								"px-4 py-2",
								isUser
									? "bg-primary-foreground text-primary"
									: "bg-transparent px-0 py-0",
							)}
						>
							{part.text}
						</MessageContent>
					))}

					{/* Message actions */}
					<MessageActions
						message={message}
						isLoading={isLoading}
						onRegenerate={onRegenerate}
					/>
				</div>
			</Message>
		</div>
	);
};

export default Chat;
