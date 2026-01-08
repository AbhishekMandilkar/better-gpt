"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useChats } from "@/hooks/use-chats";
import { ChatSearchBar } from "./chat-search-bar";
import { ModeToggle } from "./mode-toggle";

const isActive = (urlChatId: string | null, chatId: string) => {
	if (!urlChatId) return false;
	return urlChatId === chatId;
};

export function AppSidebar() {
	const params = useParams();
	const chatId = params.chatId as string | undefined;
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch] = useDebounceValue(searchQuery, 300);

	const { data: chats, isPending } = useChats(debouncedSearch);

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup className="space-y-2">
					<SidebarGroupLabel>Chats</SidebarGroupLabel>
					<ChatSearchBar value={searchQuery} onValueChange={setSearchQuery} />
					<SidebarGroupContent className="space-y-1">
						<Link href="/chat" className="flex items-center gap-2">
							<SidebarMenuButton
								tooltip="New Chat"
								className="min-w-8 cursor-pointer"
							>
								<Plus />
								<span>New Chat</span>
							</SidebarMenuButton>
						</Link>
						{isPending ? (
							<div className="gap-1">
								<SidebarMenuSkeleton />
								<SidebarMenuSkeleton />
								<SidebarMenuSkeleton />
							</div>
						) : (
							<SidebarMenu className="gap-1">
								{chats?.map((chat) => (
									<SidebarMenuItem key={chat.id}>
										<Link
											href={`/chat/${chat.id}`}
											className="flex items-center gap-2"
										>
											<SidebarMenuButton
												asChild={false}
												isActive={isActive(chatId ?? null, chat.id)}
											>
												<span>{chat.title}</span>
											</SidebarMenuButton>
										</Link>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						)}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<ModeToggle />
			</SidebarFooter>
		</Sidebar>
	);
}
