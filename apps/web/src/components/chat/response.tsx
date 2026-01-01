"use client";

import { type ComponentProps, memo } from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
	({ className, ...props }: ResponseProps) => (
		<Streamdown
			remarkPlugins={[
				[remarkGfm, {}],
				[remarkMath, { singleDollarTextMath: false }],
			]}
			shikiTheme={["github-light-default", "github-dark-default"]}
			className={cn(
				"[&_code]:wrap-break-word size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:overflow-x-auto",
				className,
			)}
			rehypePlugins={[[rehypeKatex, { errorColor: "#dc2626" }]]}
			{...props}
		/>
	),
	(prevProps, nextProps) => prevProps.children === nextProps.children,
);
