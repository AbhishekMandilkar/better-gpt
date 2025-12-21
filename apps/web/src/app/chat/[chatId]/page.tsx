interface ChatPageProps {
	params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatId } = await params;

	return (
		<div>
			<h1>Chat: {chatId}</h1>
		</div>
	);
}
