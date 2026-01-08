import type { DBMessage } from "@better-gpt/db/schema/chat";
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai";
import { type ClassValue, clsx } from "clsx";
import { formatISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function convertToUIMessages(messages: DBMessage[]): UIMessage[] {
	return messages.map((message) => ({
		id: message.id,
		role: message.role as "user" | "assistant" | "system",
		parts: message.parts as UIMessagePart<UIDataTypes, UITools>[],
		metadata: {
			createdAt: formatISO(message.createdAt),
		},
	}));
}
