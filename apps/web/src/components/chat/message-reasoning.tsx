"use client";

import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import { TextShimmer } from "../ui/text-shimmer";

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
			<ReasoningTrigger className="text-sm">
				{isLoading ? (
					<TextShimmer duration={2} spread={10}>
						Thinking...
					</TextShimmer>
				) : (
					"View reasoning"
				)}
			</ReasoningTrigger>
			<ReasoningContent markdown className="p-2 font-mono text-xs italic">
				{reasoning}
			</ReasoningContent>
		</Reasoning>
	);
};
