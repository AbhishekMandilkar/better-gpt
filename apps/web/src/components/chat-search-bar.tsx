import { Search } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarInput,
} from "@/components/ui/sidebar";

interface ChatSearchBarProps extends React.ComponentProps<"form"> {
	value: string;
	onValueChange: (value: string) => void;
}

export function ChatSearchBar({
	value,
	onValueChange,
	...props
}: ChatSearchBarProps) {
	return (
		<form {...props} onSubmit={(e) => e.preventDefault()}>
			<SidebarGroup className="px-0 py-0">
				<SidebarGroupContent className="relative">
					<Label htmlFor="search" className="sr-only">
						Search
					</Label>
					<SidebarInput
						id="search"
						placeholder="Search chats..."
						className="pl-8"
						autoComplete="off"
						value={value}
						onChange={(e) => onValueChange(e.target.value)}
					/>
					<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none opacity-50" />
				</SidebarGroupContent>
			</SidebarGroup>
		</form>
	);
}
