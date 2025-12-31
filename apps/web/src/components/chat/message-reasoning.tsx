"use client";

import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MessageReasoningProps {
	reasoning: string;
	isLoading?: boolean;
}

export const MessageReasoning = ({
	reasoning,
	isLoading = false,
}: MessageReasoningProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!reasoning?.trim()) return null;

	return (
		<div className="rounded-lg border bg-muted/50">
			<button
				type="button"
				className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<Brain className="size-4 text-muted-foreground" />
				<span className="flex-1 font-medium text-muted-foreground">
					{isLoading ? (
						<span className="inline-flex items-center gap-1">
							<span className="animate-pulse">Thinking</span>
							<span className="inline-flex">
								<span className="animate-bounce [animation-delay:0ms]">.</span>
								<span className="animate-bounce [animation-delay:150ms]">
									.
								</span>
								<span className="animate-bounce [animation-delay:300ms]">
									.
								</span>
							</span>
						</span>
					) : (
						"View reasoning"
					)}
				</span>
				{isExpanded ? (
					<ChevronDown className="size-4 text-muted-foreground" />
				) : (
					<ChevronRight className="size-4 text-muted-foreground" />
				)}
			</button>
			<div
				className={cn(
					"overflow-hidden transition-all duration-200",
					isExpanded ? "max-h-96" : "max-h-0",
				)}
			>
				<div className="border-t px-3 py-2">
					<p className="whitespace-pre-wrap text-muted-foreground text-sm italic">
						{reasoning}
					</p>
				</div>
			</div>
		</div>
	);
};
