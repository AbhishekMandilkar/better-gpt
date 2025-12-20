import { auth } from "@better-gpt/auth";
import db, { desc, eq } from "@better-gpt/db";
import { chat } from "@better-gpt/db/schema/chat";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	// const session = await auth.api.getSession({
	// 	headers: await headers(),
	// });

	// if (!session?.user) {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	const chats = await db
		.select()
		.from(chat)
		.where(eq(chat.userId, "asdf1234"))
		.orderBy(desc(chat.createdAt));

	return NextResponse.json(chats);
}
