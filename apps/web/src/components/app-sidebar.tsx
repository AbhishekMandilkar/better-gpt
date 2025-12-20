"use client";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import Link from "next/link";

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

export function AppSidebar() {
	const { data: chats, isPending } = useChats();
	console.log(chats, isPending);
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Chats</SidebarGroupLabel>
					<SidebarGroupContent>
						{isPending ? (
							<SidebarMenuSkeleton />
						) : (
							<SidebarMenu>
								{chats?.map((chat) => (
									<SidebarMenuItem key={chat.id}>
										<SidebarMenuButton asChild={false}>
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
