import { createOpenRouter } from "@openrouter/ai-sdk-provider";

function getOpenRouterProvider() {
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error(
			"OPENROUTER_API_KEY is not set. Please add it to your .env.local file.",
		);
	}

	return createOpenRouter({
		apiKey,
	});
}

// Lazy initialization to avoid throwing during module load
let _provider: ReturnType<typeof createOpenRouter> | null = null;

export function getProvider() {
	if (!_provider) {
		_provider = getOpenRouterProvider();
	}
	return _provider;
}

// For backward compatibility, export a function that returns the model
export default function openRouterProvider(modelId: string) {
	return getProvider()(modelId);
}
