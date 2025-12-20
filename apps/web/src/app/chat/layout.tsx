import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-svh">
			<AppSidebar />
			{children}
		</div>
	);
}
