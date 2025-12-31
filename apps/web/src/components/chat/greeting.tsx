import { Sparkles } from "lucide-react";

export const Greeting = () => {
	return (
		<div className="fade-in flex animate-in flex-col items-center justify-center gap-4 py-12 text-center duration-500">
			<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
				<Sparkles className="size-8 text-primary" />
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">
					How can I help you today?
				</h1>
				<p className="max-w-md text-muted-foreground">
					Ask me anything. I'm here to help with questions, ideas, writing,
					coding, and more.
				</p>
			</div>
		</div>
	);
};
