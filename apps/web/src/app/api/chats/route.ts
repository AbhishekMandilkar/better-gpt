import { auth } from "@better-gpt/auth";
import db, { and, desc, eq, ilike } from "@better-gpt/db";
import { chat } from "@better-gpt/db/schema/chat";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getGuestId } from "@/lib/guest";

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id || (await getGuestId());

	if (!userId) {
		return NextResponse.json([]);
	}

	const searchParams = request.nextUrl.searchParams;
	const search = searchParams.get("search");

	const conditions = [eq(chat.userId, userId)];
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
