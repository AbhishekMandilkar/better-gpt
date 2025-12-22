import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const API_KEY = process.env.OPENROUTER_API_KEY!;

if (!API_KEY) {
	throw new Error("OPENROUTER_API_KEY is not set");
}

const openRouterProvider = createOpenRouter({
	apiKey: API_KEY,
});

export default openRouterProvider;
