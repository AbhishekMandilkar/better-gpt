import { auth } from "@better-gpt/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Chat from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { getGuestId } from "@/lib/guest";
import { convertToUIMessages } from "@/lib/utils";

interface ChatPageProps {
	params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatId } = await params;
	const chat = await getChatById({ id: chatId });

	if (!chat) {
		notFound();
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id || (await getGuestId());

	if (chat.visibility === "private" && chat.userId !== userId) {
		notFound();
	}

	const messagesFromDb = await getMessagesByChatId({ id: chatId });
	const initialMessages = convertToUIMessages(messagesFromDb);

	return <Chat chatId={chatId} initialMessages={initialMessages} />;
}
