import type { Chat } from "@better-gpt/db/schema/chat";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchChats(): Promise<Chat[]> {
	const { data } = await axios.get<Chat[]>("/api/chats");
	return data;
}

export function useChats() {
	return useQuery({
		queryKey: ["chats"],
		queryFn: fetchChats,
	});
}
