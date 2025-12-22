import Chat from "@/components/chat";

interface ChatPageProps {
	params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatId } = await params;

	return <Chat chatId={chatId} />;
}
