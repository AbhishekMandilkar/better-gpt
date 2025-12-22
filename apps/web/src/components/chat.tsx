"use client";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { PromptInputBox } from "@/components/chat/prompt-input-box";
import { ChatHeader } from "./chat-header";

interface ChatProps {
	chatId: string;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
	const activeChatId = useSearchParams().get("chatId");
	const handleSendMessage = (message: string, files?: File[]) => {
		window.history.pushState({}, "", `/chat/${chatId}`);
		// make llm call here
	};

	return (
		<div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
			<ChatHeader chatId={chatId} isReadonly={false} />
			<div className="flex-1 overflow-y-auto p-4">
				<p>chat thread goes here</p>
			</div>
			<div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
				<PromptInputBox onSend={handleSendMessage} isLoading={false} />
			</div>
		</div>
	);
};

export default Chat;
