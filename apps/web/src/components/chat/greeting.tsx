"use client";

import * as motion from "motion/react-client";
import GreetingSuggestions from "./greeting-suggestions";

export const Greeting = () => {
	return (
		<motion.div
			className="flex flex-col gap-4 py-12 text-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			<div className="flex flex-col gap-2 text-left">
				<motion.h1
					className="font-semibold text-3xl text-foreground tracking-tight md:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
				>
					A better multi-modal chatbot for developers.
				</motion.h1>
				<motion.p
					className="max-w-lg font-mono text-muted-foreground tracking-tight sm:text-lg"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
				>
					Ask me anything — I'm here to assist with your coding, writing,
					creative ideas, troubleshooting, and more.
				</motion.p>
			</div>
			<motion.div
				className="relative flex w-full flex-col items-center justify-center space-y-2"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
			>
				<GreetingSuggestions />
			</motion.div>
		</motion.div>
	);
};
