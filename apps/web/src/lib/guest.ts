import db from "@better-gpt/db";
import { user } from "@better-gpt/db/schema/auth";
import { cookies } from "next/headers";

export const GUEST_COOKIE_NAME = "guest-user-id";

export async function getGuestId(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(GUEST_COOKIE_NAME)?.value;
}

export async function createGuestUser(): Promise<string> {
	const id = crypto.randomUUID();
	const email = `guest_${id}@better-gpt.guest`;

	await db.insert(user).values({
		id,
		name: "Guest",
		email,
		emailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return id;
}
