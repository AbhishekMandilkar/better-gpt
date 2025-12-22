"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinWaitlist } from "@/hooks/use-join-waitlist";
import { useWaitlistCount } from "@/hooks/use-waitlist-count";

type WaitlistFormProps = {
	initialCount: number;
};

export const WaitlistForm = ({ initialCount }: WaitlistFormProps) => {
	const [email, setEmail] = useState("");
	const mutation = useJoinWaitlist();
	const { data: waitlistCount } = useWaitlistCount({
		initialData: initialCount,
	});

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email.trim()) return;

		mutation.mutate(email, {
			onSuccess: (result) => {
				if (result.success) {
					setEmail("");
				}
			},
		});
	};

	return (
		<div className="mt-6 space-y-2">
			<form
				onSubmit={handleSubmit}
				className="relative z-20 flex w-full max-w-md items-center gap-3 rounded-full"
			>
				<Input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-0 active:ring-0"
					placeholder="Enter your email"
					disabled={mutation.isPending}
					aria-label="Email address for waitlist"
				/>
				<Button
					type="submit"
					className="h-10 rounded-xl"
					disabled={mutation.isPending || !email.trim()}
				>
					{mutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Joining...
						</>
					) : (
						"Join the Waitlist"
					)}
				</Button>
			</form>
			{waitlistCount !== undefined && waitlistCount > 0 && (
				<p className="ml-2 text-muted-foreground text-sm">
					{waitlistCount}+ people on the waitlist
				</p>
			)}
		</div>
	);
};
