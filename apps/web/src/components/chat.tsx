"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowDown, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Greeting } from "@/components/chat/greeting";
import { MessageActions } from "@/components/chat/message-actions";
import { MessageReasoning } from "@/components/chat/message-reasoning";
import {
	AVAILABLE_MODELS,
	ModelSelector,
} from "@/components/chat/model-selector";
import { PromptInputBox } from "@/components/chat/prompt-input-box";
import { ThinkingMessage } from "@/components/chat/thinking-message";
import { useMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./chat-header";

interface ChatProps {
	chatId: string;
	initialMessages?: UIMessage[];
}

const Chat: React.FC<ChatProps> = ({ chatId, initialMessages = [] }) => {
	const router = useRouter();
	const searchParams = useSearchParams();

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
				body: {
					id: chatId,
				},
				prepareSendMessagesRequest(request) {
					const lastMessage = request.messages.at(-1);
					return {
						body: {
							id: chatId,
							messages: request.messages,
							model: currentModelIdRef.current,
							...request.body,
						},
					};
				},
			}),
		[chatId],
	);

	const { messages, setMessages, sendMessage, regenerate, status, error } =
		useChat({
			id: chatId,
			transport,
			messages: initialMessages,
			experimental_throttle: 100,
		});

	// Scroll management
	const { containerRef, endRef, isAtBottom, scrollToBottom, hasSentMessage } =
		useMessages({ status });

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

	const handleSendMessage = (message: string, files?: File[]) => {
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
			<div className="relative flex-1">
				<div
					className="absolute inset-0 touch-pan-y overflow-y-auto"
					ref={containerRef}
				>
					<div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
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
								requiresScrollPadding={
									hasSentMessage && index === messages.length - 1
								}
							/>
						))}

						{status === "submitted" && <ThinkingMessage />}

						{error && (
							<div className="rounded-lg bg-destructive/10 p-4 text-destructive">
								<p>Error: {error.message}</p>
							</div>
						)}

						<div className="min-h-[24px] min-w-[24px] shrink-0" ref={endRef} />
					</div>
				</div>

				{/* Scroll to bottom button */}
				<button
					aria-label="Scroll to bottom"
					className={cn(
						"absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted",
						isAtBottom
							? "pointer-events-none scale-0 opacity-0"
							: "pointer-events-auto scale-100 opacity-100",
					)}
					onClick={() => scrollToBottom("smooth")}
					type="button"
				>
					<ArrowDown className="size-4" />
				</button>
			</div>

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
	requiresScrollPadding?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isLoading,
	onRegenerate,
	requiresScrollPadding,
}) => {
	const isUser = message.role === "user";

	// Extract text and reasoning from parts
	const textParts = message.parts.filter((part) => part.type === "text");
	const reasoningParts = message.parts.filter(
		(part) => part.type === "reasoning",
	);

	return (
		<div
			className={cn(
				"group/message fade-in w-full animate-in duration-200",
				requiresScrollPadding && "scroll-mt-24",
			)}
			data-role={message.role}
		>
			<div
				className={cn(
					"flex w-full items-start gap-2 md:gap-3",
					isUser ? "justify-end" : "justify-start",
				)}
			>
				{!isUser && (
					<div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
						<Sparkles className="size-4" />
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
						<div
							key={part.text}
							className={cn(
								"rounded-2xl px-4 py-3",
								isUser
									? "bg-primary text-primary-foreground"
									: "bg-transparent px-0 py-0",
							)}
						>
							<div className="whitespace-pre-wrap">{part.text}</div>
						</div>
					))}

					{/* Message actions */}
					<MessageActions
						message={message}
						isLoading={isLoading}
						onRegenerate={onRegenerate}
					/>
				</div>
			</div>
		</div>
	);
};

export default Chat;
