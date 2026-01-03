"use client";

import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";

interface MessageReasoningProps {
	reasoning: string;
	isLoading?: boolean;
}

export const MessageReasoning = ({
	reasoning,
	isLoading = false,
}: MessageReasoningProps) => {
	if (!reasoning?.trim()) return null;

	return (
		<Reasoning isStreaming={isLoading}>
			<ReasoningTrigger className="text-sm italic">
				{isLoading ? "Thinking..." : "View reasoning"}
			</ReasoningTrigger>
			<ReasoningContent
				markdown
				className="ml-2 border-l-2 border-l-foreground-muted px-2 pb-1 font-mono text-xs italic"
			>
				{reasoning}
			</ReasoningContent>
		</Reasoning>
	);
};
