import type { Chat } from "@better-gpt/db/schema/chat";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchChats(search?: string): Promise<Chat[]> {
	const params = search?.trim() ? { search: search.trim() } : undefined;
	const { data } = await axios.get<Chat[]>("/api/chats", { params });
	return data;
}

export function useChats(search?: string) {
	return useQuery({
		queryKey: ["chats", search ?? ""],
		queryFn: () => fetchChats(search),
	});
}
