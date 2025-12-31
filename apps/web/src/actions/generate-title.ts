"use server";

import { generateText } from "ai";
import openRouterProvider from "@/lib/openrouter";

export async function generateTitleFromUserMessage({
	message,
}: {
	message: { content: string };
}): Promise<string> {
	const { text: title } = await generateText({
		model: openRouterProvider("xiaomi/mimo-v2-flash:free"),
		system: `
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons`,
		prompt: JSON.stringify(message),
	});

	return title.trim();
}
