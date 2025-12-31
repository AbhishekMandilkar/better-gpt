"use client";

import type { UIMessage } from "ai";
import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
	message: UIMessage;
	isLoading: boolean;
	onEdit?: () => void;
	onRegenerate?: () => void;
}

export const MessageActions = ({
	message,
	isLoading,
	onEdit,
	onRegenerate,
}: MessageActionsProps) => {
	const [hasCopied, setHasCopied] = useState(false);

	const getMessageText = () => {
		return message.parts
			.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("\n");
	};

	const handleCopy = async () => {
		const text = getMessageText();
		await navigator.clipboard.writeText(text);
		setHasCopied(true);
		setTimeout(() => setHasCopied(false), 2000);
	};

	if (isLoading) return null;

	const isUser = message.role === "user";

	return (
		<TooltipProvider>
			<div
				className={cn(
					"flex items-center gap-1 opacity-0 transition-opacity group-hover/message:opacity-100",
					isUser ? "justify-end" : "justify-start",
				)}
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={handleCopy}
						>
							{hasCopied ? (
								<Check className="size-3.5 text-green-500" />
							) : (
								<Copy className="size-3.5" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{hasCopied ? "Copied!" : "Copy message"}
					</TooltipContent>
				</Tooltip>

				{isUser && onEdit && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-7"
								onClick={onEdit}
							>
								<Pencil className="size-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Edit message</TooltipContent>
					</Tooltip>
				)}

				{!isUser && onRegenerate && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-7"
								onClick={onRegenerate}
							>
								<RefreshCw className="size-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Regenerate response</TooltipContent>
					</Tooltip>
				)}
			</div>
		</TooltipProvider>
	);
};
