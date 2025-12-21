import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<AppSidebar />
			<SidebarInset>{children}</SidebarInset>
		</>
	);
}
