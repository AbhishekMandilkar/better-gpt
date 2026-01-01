import { randomUUID } from "node:crypto";
import { Suspense } from "react";
import Chat from "@/components/chat";
import Loader from "@/components/loader";

export default function ChatPage() {
	const newChatId = randomUUID();
	return (
		<Suspense fallback={<Loader />}>
			<Chat chatId={newChatId} />
		</Suspense>
	);
}
