import db, { and, desc, eq, ilike } from "@better-gpt/db";
import { chat } from "@better-gpt/db/schema/chat";

import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// const session = await auth.api.getSession({
	// 	headers: await headers(),
	// });

	// if (!session?.user) {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	const searchParams = request.nextUrl.searchParams;
	const search = searchParams.get("search");

	const conditions = [eq(chat.userId, "asdf1234")];
	if (search?.trim()) {
		conditions.push(ilike(chat.title, `%${search.trim()}%`));
	}

	const chats = await db
		.select()
		.from(chat)
		.where(and(...conditions))
		.orderBy(desc(chat.createdAt));

	return NextResponse.json(chats);
}
