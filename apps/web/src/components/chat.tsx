"use client";

import type React from "react";
import { PromptInputBox } from "@/components/chat/prompt-input-box";

interface ChatProps {
	onSendMessage?: (message: string, files?: File[]) => void;
	isLoading?: boolean;
}

const Chat: React.FC<ChatProps> = ({ onSendMessage, isLoading = false }) => {
	const handleSendMessage = (message: string, files?: File[]) => {
		console.log("Message:", message);
		console.log("Files:", files);
		onSendMessage?.(message, files);
	};

	return (
		<div className="flex w-full flex-col items-center justify-end p-4">
			<div className="w-full max-w-2xl">
				<PromptInputBox onSend={handleSendMessage} isLoading={isLoading} />
			</div>
		</div>
	);
};

export default Chat;
