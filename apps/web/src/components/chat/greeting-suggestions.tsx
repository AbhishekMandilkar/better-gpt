"use client";
import {
	BrainIcon,
	ChevronLeftIcon,
	SearchIcon,
	TerminalSquareIcon,
} from "lucide-react";
import * as motion from "motion/react-client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { PromptSuggestion } from "../ui/prompt-suggestion";

const GreetingSuggestions = () => {
	const [activeCategory, setActiveCategory] = useState("");

	const handlePromptInputValueChange = (value: string) => {
		// Clear active category when typing something different
		if (value.trim() === "") {
			setActiveCategory("");
		}
	};

	// Get suggestions based on active category
	const activeCategoryData = suggestionGroups.find(
		(group) => group.label === activeCategory,
	);

	// Determine which suggestions to show
	const showCategorySuggestions = activeCategory !== "";
	return (
		<div className="absolute top-0 left-0 h-[70px] w-full">
			{showCategorySuggestions ? (
				<motion.div
					className="flex w-full flex-col space-y-1"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
				>
					<Button
						variant="ghost"
						size="icon"
						className=""
						onClick={() => setActiveCategory("")}
					>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					{activeCategoryData?.items.map((suggestion, index) => (
						<motion.div
							key={suggestion}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.4,
								delay: 0.05 + index * 0.05,
								ease: "easeOut",
							}}
						>
							<PromptSuggestion
								onClick={() => {
									// setInputValue(suggestion)
									// // Optional: auto-send
									// // handleSend()
								}}
								highlight={activeCategoryData.highlight}
								className="p-4"
							>
								{suggestion}
							</PromptSuggestion>
						</motion.div>
					))}
				</motion.div>
			) : (
				<div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
					{suggestionGroups.map((suggestion, index) => (
						<motion.div
							key={suggestion.label}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.4,
								delay: 0.2 + index * 0.08,
								ease: "easeOut",
							}}
						>
							<PromptSuggestion
								onClick={() => {
									setActiveCategory(suggestion.label);
									// setInputValue("") // Clear input when selecting a category
								}}
								className="rounded-md capitalize"
							>
								<suggestion.icon className="mr-2 h-4 w-4" />
								{suggestion.label}
							</PromptSuggestion>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
};

export default GreetingSuggestions;

const suggestionGroups = [
	{
		label: "Summary",
		highlight: "Summarize",
		items: [
			"Summarize this in 3 bullet points",
			"Give me a TL;DR",
			"Summarize a podcast episode",
			"Summarize a Article",
		],
		icon: BrainIcon,
	},
	{
		label: "Code",
		highlight: "Help me",
		items: [
			"Help me build a React component",
			"Help me fix a bug in my code",
			"Help me learn Python from scratch",
			"Help me write and optimize SQL queries",
		],
		icon: TerminalSquareIcon,
	},
	{
		label: "Research",
		highlight: "Research",
		items: [
			"Research SEO strategies that work",
			"Research the best running shoes for daily use",
			"Research must-try restaurants in Paris",
			"Research the most useful AI tools",
		],
		icon: SearchIcon,
	},
];
