import { SidebarCloseIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";

export function SidebarToggle() {
	const { toggleSidebar } = useSidebar();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					data-testid="sidebar-toggle-button"
					onClick={toggleSidebar}
					variant="ghost"
					size="icon"
				>
					<SidebarCloseIcon size={16} />
				</Button>
			</TooltipTrigger>
			<TooltipContent align="start" className="hidden md:block">
				Toggle Sidebar
			</TooltipContent>
		</Tooltip>
	);
}
