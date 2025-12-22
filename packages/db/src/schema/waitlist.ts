import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const waitlist = pgTable(
	"waitlist",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull().unique(),
		status: text("status").default("pending").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("waitlist_email_idx").on(table.email)],
);
