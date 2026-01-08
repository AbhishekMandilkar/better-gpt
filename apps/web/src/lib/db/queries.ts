import db, { asc, eq } from "@better-gpt/db";
import {
	type Chat,
	chat,
	type DBMessage,
	message,
} from "@better-gpt/db/schema/chat";

export async function saveChat({
	id,
	userId,
	title,
	visibility = "private",
}: {
	id: string;
	userId: string;
	title: string;
	visibility?: "public" | "private";
}): Promise<Chat> {
	const [newChat] = await db
		.insert(chat)
		.values({
			id,
			userId,
			title,
			visibility,
			createdAt: new Date(),
		})
		.returning();

	return newChat;
}

export async function getChatById({
	id,
}: {
	id: string;
}): Promise<Chat | undefined> {
	const [result] = await db.select().from(chat).where(eq(chat.id, id)).limit(1);
	return result;
}

export async function saveMessages({
	messages,
}: {
	messages: Array<{
		id: string;
		chatId: string;
		role: string;
		parts: unknown;
		attachments: unknown[];
		createdAt: Date;
	}>;
}): Promise<DBMessage[]> {
	if (messages.length === 0) return [];
	console.log("saving messages", messages);
	const result = await db.insert(message).values(messages).returning();
	return result;
}

export async function getMessagesByChatId({
	id,
}: {
	id: string;
}): Promise<DBMessage[]> {
	return db
		.select()
		.from(message)
		.where(eq(message.chatId, id))
		.orderBy(asc(message.createdAt));
}

export async function updateChatTitleById({
	chatId,
	title,
}: {
	chatId: string;
	title: string;
}): Promise<void> {
	await db.update(chat).set({ title }).where(eq(chat.id, chatId));
}

export async function deleteChatById({
	id,
}: {
	id: string;
}): Promise<Chat | undefined> {
	// First delete all messages
	await db.delete(message).where(eq(message.chatId, id));
	// Then delete the chat
	const [deletedChat] = await db
		.delete(chat)
		.where(eq(chat.id, id))
		.returning();
	return deletedChat;
}
