"use client";

import { Check, ChevronDown, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Model {
	id: string;
	name: string;
	description?: string;
	isFree?: boolean;
	isReasoning?: boolean;
}

export const AVAILABLE_MODELS: Model[] = [
	{
		id: "openai/gpt-4o",
		name: "GPT-4o",
		description: "Most capable",
	},
	{
		id: "anthropic/claude-3.5-sonnet",
		name: "Claude 3.5 Sonnet",
		description: "Excellent for coding",
	},
	{
		id: "deepseek/deepseek-chat",
		name: "DeepSeek V3",
		description: "Strong open model",
	},
	{
		id: "google/gemini-pro-1.5",
		name: "Gemini 1.5 Pro",
		description: "Large context window",
	},
	{
		id: "meta-llama/llama-3.3-70b-instruct",
		name: "Llama 3.3 70B",
		description: "Leading open source",
	},
	{
		id: "deepseek/deepseek-r1",
		name: "DeepSeek R1",
		description: "Reasoning model",
		isReasoning: true,
	},
	{
		id: "qwen/qwen-2.5-72b-instruct",
		name: "Qwen 2.5 72B",
		description: "Strong performance",
	},
	{
		id: "anthropic/claude-3.5-haiku",
		name: "Claude 3.5 Haiku",
		description: "Fast and affordable",
	},
	{
		id: "openai/gpt-4o-mini",
		name: "GPT-4o Mini",
		description: "Fast and capable",
	},
	{
		id: "mistralai/mistral-large-2411",
		name: "Mistral Large 2",
		description: "Strong performance",
	},
];

interface ModelSelectorProps {
	selectedModelId: string;
	onModelChange: (modelId: string) => void;
	className?: string;
}

export const ModelSelector = ({
	selectedModelId,
	onModelChange,
	className,
}: ModelSelectorProps) => {
	const [open, setOpen] = useState(false);

	const selectedModel =
		AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ||
		AVAILABLE_MODELS[0];

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn("gap-1 text-muted-foreground", className)}
				>
					{selectedModel?.isReasoning ? (
						<Sparkles className="size-3.5" />
					) : (
						<Zap className="size-3.5" />
					)}
					<span className="max-w-[120px] truncate">
						{selectedModel?.name || "Select Model"}
					</span>
					<ChevronDown className="size-3.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="max-h-[300px] w-64 overflow-y-auto"
			>
				{AVAILABLE_MODELS.map((model) => (
					<DropdownMenuItem
						key={model.id}
						onSelect={() => {
							onModelChange(model.id);
							setOpen(false);
						}}
						className="flex items-center justify-between"
					>
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<span className="font-medium">{model.name}</span>
								{model.isFree && (
									<span className="rounded bg-green-500/10 px-1.5 py-0.5 font-medium text-[10px] text-green-600">
										FREE
									</span>
								)}
								{model.isReasoning && (
									<span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-medium text-[10px] text-purple-600">
										REASONING
									</span>
								)}
							</div>
							{model.description && (
								<span className="text-muted-foreground text-xs">
									{model.description}
								</span>
							)}
						</div>
						{selectedModelId === model.id && (
							<Check className="size-4 text-primary" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
