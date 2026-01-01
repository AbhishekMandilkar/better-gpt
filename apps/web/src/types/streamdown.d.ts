declare module "streamdown" {
	import type { ComponentProps, FC } from "react";

	export interface StreamdownProps extends ComponentProps<"div"> {
		children?: string;
	}

	export const Streamdown: FC<StreamdownProps>;
}
