import Link from "next/link";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface ChatErrorProps {
	error: Error;
}

export function ChatError({ error }: ChatErrorProps) {
	const parsedError = useMemo(() => {
		try {
			const parsed = JSON.parse(error.message);
			return {
				error: parsed.error || "Error",
				message: parsed.message || error.message,
				resetAt: parsed.resetAt,
				action: parsed.action || undefined,
			};
		} catch {
			return {
				error: "Error",
				message: error.message,
			};
		}
	}, [error]);

	if (!error) return null;

	return (
		<div className="w-full py-4">
			<Card className="flex">
				<CardHeader className="flex items-center justify-between">
					<div>
						<CardTitle>{parsedError.error}</CardTitle>
						<CardDescription>{parsedError.message}</CardDescription>
					</div>
					{parsedError.action && <Button variant="outline">Sign In</Button>}
				</CardHeader>
			</Card>
		</div>
	);
}
