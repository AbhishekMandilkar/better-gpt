import { randomUUID } from "node:crypto";
import Chat from "@/components/chat";

const newChatId = randomUUID();

export default function ChatPage() {
	return <Chat chatId={newChatId} />;
}
