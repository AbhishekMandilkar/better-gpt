import Link from "next/link";
import { getWaitlistCount } from "@/actions/waitlist";
import { PromptInputBox } from "@/components/chat/prompt-input-box";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "./ui/button";

const isLocal = process.env.NODE_ENV === "development";

const Hero = async () => {
	const waitlistCount = await getWaitlistCount();

	return (
		<div className="flex min-h-screen min-w-screen items-center justify-center">
			<div className="mx-auto grid w-full max-w-(--breakpoint-xl) gap-12 px-6 py-12 lg:grid-cols-2">
				<div>
					<h1 className="mt-6 max-w-[17ch] font-semibold text-4xl leading-[1.2]! tracking-[-0.035em] md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem]">
						Stop guessing. Start fixing bugs with real GitHub & Stack Overflow
						answers.
					</h1>
					<p className="mt-6 max-w-[60ch] font-mono text-foreground/80 sm:text-lg">
						A developer-first LLM chatbot that reads actual issues and threads
						to solve your errors with proven fixes, not generic replies.
					</p>
					<WaitlistForm initialCount={waitlistCount} />
					{isLocal && (
						<Link href="/chat">
							<Button>Go to Chat</Button>
						</Link>
					)}
				</div>
				<div className="display-flex my-auto w-full rounded-xl">
					<PromptInputBox demo />
				</div>
			</div>
		</div>
	);
};

export default Hero;
