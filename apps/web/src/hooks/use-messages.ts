import { useCallback, useEffect, useRef, useState } from "react";

type ChatStatus = "streaming" | "submitted" | "ready" | "error";

interface UseMessagesOptions {
	status: ChatStatus;
}

export function useMessages({ status }: UseMessagesOptions) {
	const containerRef = useRef<HTMLDivElement>(null);
	const endRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [hasSentMessage, setHasSentMessage] = useState(false);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
		endRef.current?.scrollIntoView({ behavior, block: "end" });
	}, []);

	// Track if user has scrolled away from bottom
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
			setIsAtBottom(distanceFromBottom < 50);
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, []);

	// Auto-scroll when streaming and user is at bottom
	useEffect(() => {
		if (status === "streaming" && isAtBottom) {
			scrollToBottom("instant");
		}
	}, [status, isAtBottom, scrollToBottom]);

	// Track when user sends a message
	useEffect(() => {
		if (status === "submitted") {
			setHasSentMessage(true);
			scrollToBottom("smooth");
		}
	}, [status, scrollToBottom]);

	// Reset hasSentMessage when response is ready
	useEffect(() => {
		if (status === "ready") {
			setHasSentMessage(false);
		}
	}, [status]);

	return {
		containerRef,
		endRef,
		isAtBottom,
		scrollToBottom,
		hasSentMessage,
	};
}
