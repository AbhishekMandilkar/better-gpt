"use client";

import { MoreVertical, PlusIcon, ShareIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { SidebarToggle } from "./sidebar-toggle";
import { useSidebar } from "./ui/sidebar";

function PureChatHeader({
	chatId,
	isReadonly,
	children,
}: {
	chatId: string;
	isReadonly: boolean;
	children?: React.ReactNode;
}) {
	const router = useRouter();
	const { open } = useSidebar();

	const { width: windowWidth } = useWindowSize();

	return (
		<header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
			<SidebarToggle />

			{(!open || windowWidth < 768) && (
				<Button
					onClick={() => {
						router.push("/chat");
						router.refresh();
					}}
					variant="ghost"
					size="icon"
				>
					<PlusIcon />
					<span className="md:sr-only">New Chat</span>
				</Button>
			)}

			{children}
			<div className="flex-1" />
			<Button variant="ghost" size="icon">
				<ShareIcon size={16} />
			</Button>
			<Button variant="ghost" size="icon">
				<MoreVertical size={16} />
			</Button>
		</header>
	);
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
	return (
		prevProps.chatId === nextProps.chatId &&
		prevProps.isReadonly === nextProps.isReadonly
	);
});
