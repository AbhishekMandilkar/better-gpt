"use server";

import db, { count, eq } from "@better-gpt/db";
import { waitlist } from "@better-gpt/db/schema/waitlist";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

type JoinWaitlistResult = {
	success: boolean;
	message: string;
};

export const joinWaitlist = async (
	email: string,
): Promise<JoinWaitlistResult> => {
	const parsed = emailSchema.safeParse(email);

	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message || "Invalid email address",
		};
	}

	const existingEntry = await db.query.waitlist.findFirst({
		where: eq(waitlist.email, parsed.data),
	});

	if (existingEntry) {
		return {
			success: false,
			message: "This email is already on the waitlist",
		};
	}

	await db.insert(waitlist).values({
		id: crypto.randomUUID(),
		email: parsed.data,
	});

	return {
		success: true,
		message: "You've been added to the waitlist!",
	};
};

export const getWaitlistCount = async (): Promise<number> => {
	try {
		const result = await db.select({ count: count() }).from(waitlist);
		return result[0]?.count ?? 0;
	} catch (error) {
		console.error("Failed to fetch waitlist count:", error);
		return 0;
	}
};
