"use client";
import { Calendar, Home, Inbox, Plus, Search, Settings } from "lucide-react";
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

// Menu items.
const items = [
	{
		title: "Home",
		url: "#",
		icon: Home,
	},
	{
		title: "Inbox",
		url: "#",
		icon: Inbox,
	},
	{
		title: "Calendar",
		url: "#",
		icon: Calendar,
	},
	{
		title: "Search",
		url: "#",
		icon: Search,
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings,
	},
];

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
						<SidebarMenuButton
							tooltip="New Chat"
							className="min-w-8 cursor-pointer bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
						>
							<Link href="/chat" className="flex items-center gap-2">
								<Plus />
								<span>New Chat</span>
							</Link>
						</SidebarMenuButton>
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
										<SidebarMenuButton
											asChild={false}
											isActive={isActive(chatId ?? null, chat.id)}
										>
											<Link
												href={`/chat/${chat.id}`}
												className="flex items-center gap-2"
											>
												<span>{chat.title}</span>
											</Link>
										</SidebarMenuButton>
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
