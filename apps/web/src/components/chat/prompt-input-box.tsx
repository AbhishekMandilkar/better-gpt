"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowUp,
	FolderCode,
	Mic,
	Paperclip,
	Square,
	StopCircle,
	X,
} from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GithubDark } from "../ui/svgs/githubDark";
import { Stackoverflow } from "../ui/svgs/stackoverflow";

// Textarea Component
interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => (
		<textarea
			className={cn(
				"scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-transparent hover:scrollbar-thumb-[#555555] flex min-h-[44px] w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			ref={ref}
			rows={1}
			{...props}
		/>
	),
);
Textarea.displayName = "Textarea";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
}
const PromptButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => {
		const variantClasses = {
			default: "bg-white hover:bg-white/80 text-black",
			outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
			ghost: "bg-transparent hover:bg-[#3A3A40]",
		};
		const sizeClasses = {
			default: "h-10 px-4 py-2",
			sm: "h-8 px-3 text-sm",
			lg: "h-12 px-6",
			icon: "h-8 w-8 rounded-full aspect-[1/1]",
		};
		return (
			<button
				className={cn(
					"inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
					variantClasses[variant],
					sizeClasses[size],
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
PromptButton.displayName = "PromptButton";

// VoiceRecorder Component
interface VoiceRecorderProps {
	isRecording: boolean;
	onStartRecording: () => void;
	onStopRecording: (duration: number) => void;
	visualizerBars?: number;
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
	isRecording,
	onStartRecording,
	onStopRecording,
	visualizerBars = 32,
}) => {
	const [time, setTime] = React.useState(0);
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);

	React.useEffect(() => {
		if (isRecording) {
			onStartRecording();
			timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			onStopRecording(time);
			setTime(0);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isRecording, time, onStartRecording, onStopRecording]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div
			className={cn(
				"flex w-full flex-col items-center justify-center py-3 transition-all duration-300",
				isRecording ? "opacity-100" : "h-0 opacity-0",
			)}
		>
			<div className="mb-3 flex items-center gap-2">
				<div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
				<span className="font-mono text-sm text-white/80">
					{formatTime(time)}
				</span>
			</div>
			<div className="flex h-10 w-full items-center justify-center gap-0.5 px-4">
				{[...Array(visualizerBars)].map((_, i) => (
					<div
						key={"bar"}
						className="w-0.5 animate-pulse rounded-full bg-white/50"
						style={{
							height: `${Math.max(15, Math.random() * 100)}%`,
							animationDelay: `${i * 0.05}s`,
							animationDuration: `${0.5 + Math.random() * 0.5}s`,
						}}
					/>
				))}
			</div>
		</div>
	);
};

// ImageViewDialog Component
interface ImageViewDialogProps {
	imageUrl: string | null;
	onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({
	imageUrl,
	onClose,
}) => {
	if (!imageUrl) return null;
	return (
		<Dialog open={!!imageUrl} onOpenChange={onClose}>
			<DialogContent
				className="max-w-[90vw] border-none bg-transparent p-0 shadow-none md:max-w-[800px]"
				showCloseButton={true}
			>
				<DialogTitle className="sr-only">Image Preview</DialogTitle>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className="relative overflow-hidden rounded-2xl bg-[#1F2023] shadow-2xl"
				>
					{/* biome-ignore lint/performance/noImgElement: blob URLs cannot be optimized by next/image */}
					<img
						src={imageUrl}
						alt="Full preview"
						className="max-h-[80vh] w-full rounded-2xl object-contain"
					/>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
};

// PromptInput Context and Components
interface PromptInputContextType {
	isLoading: boolean;
	value: string;
	setValue: (value: string) => void;
	maxHeight: number | string;
	onSubmit?: () => void;
	disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
	isLoading: false,
	value: "",
	setValue: () => {},
	maxHeight: 240,
	onSubmit: undefined,
	disabled: false,
});
function usePromptInput() {
	const context = React.useContext(PromptInputContext);
	if (!context)
		throw new Error("usePromptInput must be used within a PromptInput");
	return context;
}

interface PromptInputProps {
	isLoading?: boolean;
	value?: string;
	onValueChange?: (value: string) => void;
	maxHeight?: number | string;
	onSubmit?: () => void;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	onDragOver?: (e: React.DragEvent) => void;
	onDragLeave?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
	(
		{
			className,
			isLoading = false,
			maxHeight = 240,
			value,
			onValueChange,
			onSubmit,
			children,
			disabled = false,
			onDragOver,
			onDragLeave,
			onDrop,
		},
		ref,
	) => {
		const [internalValue, setInternalValue] = React.useState(value || "");
		const handleChange = (newValue: string) => {
			setInternalValue(newValue);
			onValueChange?.(newValue);
		};
		return (
			<TooltipProvider>
				<PromptInputContext.Provider
					value={{
						isLoading,
						value: value ?? internalValue,
						setValue: onValueChange ?? handleChange,
						maxHeight,
						onSubmit,
						disabled,
					}}
				>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: drag-drop doesn't require keyboard alternatives */}
					<div
						ref={ref}
						className={cn(
							"rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
							isLoading && "border-red-500/70",
							className,
						)}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
					>
						{children}
					</div>
				</PromptInputContext.Provider>
			</TooltipProvider>
		);
	},
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps {
	disableAutosize?: boolean;
	placeholder?: string;
}
const PromptInputTextarea: React.FC<
	PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
> = ({
	className,
	onKeyDown,
	disableAutosize = false,
	placeholder,
	...props
}) => {
	const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: value is needed to trigger height recalculation when content changes
	React.useEffect(() => {
		if (disableAutosize || !textareaRef.current) return;
		textareaRef.current.style.height = "auto";
		textareaRef.current.style.height =
			typeof maxHeight === "number"
				? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
				: `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
	}, [value, maxHeight, disableAutosize]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSubmit?.();
		}
		onKeyDown?.(e);
	};

	return (
		<Textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={handleKeyDown}
			className={cn("text-base", className)}
			disabled={disabled}
			placeholder={placeholder}
			{...props}
		/>
	);
};

interface PromptInputActionsProps
	extends React.HTMLAttributes<HTMLDivElement> {}
const PromptInputActions: React.FC<PromptInputActionsProps> = ({
	children,
	className,
	...props
}) => (
	<div className={cn("flex items-center gap-2", className)} {...props}>
		{children}
	</div>
);

interface PromptInputActionProps {
	tooltip: React.ReactNode;
	children: React.ReactNode;
	side?: "top" | "bottom" | "left" | "right";
	className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
	tooltip,
	children,
	className,
	side = "top",
}) => {
	const { disabled } = usePromptInput();
	return (
		<Tooltip>
			<TooltipTrigger asChild disabled={disabled}>
				{children}
			</TooltipTrigger>
			<TooltipContent side={side} className={className}>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);
};

// Custom Divider Component
const CustomDivider: React.FC = () => (
	<div className="relative mx-1 h-6 w-[1.5px]">
		<div
			className="absolute inset-0 bg-white/10"
			style={{
				clipPath:
					"polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)",
			}}
		/>
	</div>
);

// Main PromptInputBox Component
interface PromptInputBoxProps {
	onSend?: (message: string, files?: File[]) => void;
	isLoading?: boolean;
	placeholder?: string;
	className?: string;
	demo?: boolean;
}
export const PromptInputBox = React.forwardRef(
	(props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
		const {
			onSend = () => {},
			isLoading = false,
			placeholder = "Type your message here...",
			className,
			demo = false,
		} = props;
		const [input, setInput] = React.useState("");
		const [files, setFiles] = React.useState<File[]>([]);
		const [filePreviews, setFilePreviews] = React.useState<{
			[key: string]: string;
		}>({});
		const [selectedImage, setSelectedImage] = React.useState<string | null>(
			null,
		);
		const [isRecording, setIsRecording] = React.useState(false);
		const [useGithubSearch, setUseGithubSearch] = React.useState(false);
		const [useStackOverflowSearch, setUseStackOverflowSearch] =
			React.useState(false);
		const [showCanvas, setShowCanvas] = React.useState(false);
		const uploadInputRef = React.useRef<HTMLInputElement>(null);
		const promptBoxRef = React.useRef<HTMLDivElement>(null);

		const handleToggleChange = (value: string) => {
			if (value === "github") {
				setUseGithubSearch((prev) => !prev);
			} else if (value === "stackoverflow") {
				setUseStackOverflowSearch((prev) => !prev);
			}
		};

		const handleCanvasToggle = () => setShowCanvas((prev) => !prev);

		const processFile = React.useCallback((file: File) => {
			if (!file.type.startsWith("image/")) {
				console.log("Only image files are allowed");
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				console.log("File too large (max 10MB)");
				return;
			}
			setFiles([file]);
			const reader = new FileReader();
			reader.onload = (e) =>
				setFilePreviews({ [file.name]: e.target?.result as string });
			reader.readAsDataURL(file);
		}, []);

		const handleDragOver = React.useCallback((e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
		}, []);

		const handleDragLeave = React.useCallback((e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
		}, []);

		const handleDrop = React.useCallback(
			(e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				const droppedFiles = Array.from(e.dataTransfer.files);
				const imageFiles = droppedFiles.filter((file) =>
					file.type.startsWith("image/"),
				);
				if (imageFiles.length > 0) processFile(imageFiles[0]);
			},
			[processFile],
		);

		const handleRemoveFile = (index: number) => {
			const fileToRemove = files[index];
			if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({});
			setFiles([]);
		};

		const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

		const handlePaste = React.useCallback(
			(e: ClipboardEvent) => {
				const items = e.clipboardData?.items;
				if (!items) return;
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.indexOf("image") !== -1) {
						const file = items[i].getAsFile();
						if (file) {
							e.preventDefault();
							processFile(file);
							break;
						}
					}
				}
			},
			[processFile],
		);

		React.useEffect(() => {
			document.addEventListener("paste", handlePaste);
			return () => document.removeEventListener("paste", handlePaste);
		}, [handlePaste]);

		const handleSubmit = () => {
			if (input.trim() || files.length > 0) {
				let messagePrefix = "";
				if (useGithubSearch && useStackOverflowSearch)
					messagePrefix = "[GitHub+StackOverflow: ";
				else if (useGithubSearch) messagePrefix = "[GitHub: ";
				else if (useStackOverflowSearch) messagePrefix = "[StackOverflow: ";
				else if (showCanvas) messagePrefix = "[Canvas: ";
				const formattedInput = messagePrefix
					? `${messagePrefix}${input}]`
					: input;
				onSend(formattedInput, files);
				setInput("");
				setFiles([]);
				setFilePreviews({});
			}
		};

		const handleStartRecording = () => console.log("Started recording");

		const handleStopRecording = (duration: number) => {
			console.log(`Stopped recording after ${duration} seconds`);
			setIsRecording(false);
			onSend(`[Voice message - ${duration} seconds]`, []);
		};

		const hasContent = input.trim() !== "" || files.length > 0;

		// if demo is true, we want to toggle the github and stackoverflow search on/off on regular interval
		React.useEffect(() => {
			if (!demo) return;
			const interval = setInterval(() => {
				handleToggleChange(Math.random() < 0.5 ? "github" : "stackoverflow");
			}, 1000);
			return () => clearInterval(interval);
		}, [demo]);

		return (
			<>
				<PromptInput
					value={input}
					onValueChange={setInput}
					isLoading={isLoading}
					onSubmit={handleSubmit}
					className={cn(
						"w-full border-[#444444] bg-[#1F2023] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
						isRecording && "border-red-500/70",
						className,
					)}
					disabled={isLoading || isRecording}
					ref={ref || promptBoxRef}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					{files.length > 0 && !isRecording && (
						<div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300">
							{files.map((file, index) => (
								<div key={file.name} className="group relative">
									{file.type.startsWith("image/") &&
										filePreviews[file.name] && (
											// biome-ignore lint/a11y/useSemanticElements: can't use button here due to nested button for remove action
											<div
												className="h-16 w-16 cursor-pointer overflow-hidden rounded-xl transition-all duration-300"
												onClick={() => openImageModal(filePreviews[file.name])}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														openImageModal(filePreviews[file.name]);
													}
												}}
												role="button"
												tabIndex={0}
											>
												{/* biome-ignore lint/performance/noImgElement: blob URLs cannot be optimized by next/image */}
												<img
													src={filePreviews[file.name]}
													alt={file.name}
													className="h-full w-full object-cover"
												/>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFile(index);
													}}
													type="button"
													className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
												>
													<X className="h-3 w-3 text-white" />
												</button>
											</div>
										)}
								</div>
							))}
						</div>
					)}

					<div
						className={cn(
							"transition-all duration-300",
							isRecording ? "h-0 overflow-hidden opacity-0" : "opacity-100",
						)}
					>
						<PromptInputTextarea
							placeholder={
								useGithubSearch && useStackOverflowSearch
									? "Search GitHub Issues & StackOverflow..."
									: useGithubSearch
										? "Search GitHub Issues..."
										: useStackOverflowSearch
											? "Search StackOverflow..."
											: showCanvas
												? "Create on canvas..."
												: placeholder
							}
							className="text-base"
						/>
					</div>

					{isRecording && (
						<VoiceRecorder
							isRecording={isRecording}
							onStartRecording={handleStartRecording}
							onStopRecording={handleStopRecording}
						/>
					)}

					<PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
						<div
							className={cn(
								"flex items-center gap-1 transition-opacity duration-300",
								isRecording ? "invisible h-0 opacity-0" : "visible opacity-100",
							)}
						>
							<PromptInputAction tooltip="Upload image">
								<button
									onClick={() => uploadInputRef.current?.click()}
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]"
									disabled={isRecording}
									type="button"
								>
									<Paperclip className="h-5 w-5 transition-colors" />
									<input
										ref={uploadInputRef}
										type="file"
										className="hidden"
										onChange={(e) => {
											if (e.target.files && e.target.files.length > 0)
												processFile(e.target.files[0]);
											if (e.target) e.target.value = "";
										}}
										accept="image/*"
									/>
								</button>
							</PromptInputAction>

							<div className="flex items-center">
								<button
									type="button"
									onClick={() => handleToggleChange("github")}
									className={cn(
										"flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all",
										useGithubSearch
											? "border-[#08872B] bg-[#08872B]/15 text-[#08872B]"
											: "border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]",
									)}
								>
									<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
										<motion.div
											animate={{
												scale: useGithubSearch ? 1.1 : 1,
											}}
											whileHover={{
												scale: 1.1,
												transition: {
													type: "spring",
													stiffness: 300,
													damping: 10,
												},
											}}
											transition={{
												type: "spring",
												stiffness: 260,
												damping: 25,
											}}
										>
											<GithubDark
												className={cn(
													"h-4 w-4",
													useGithubSearch ? "text-[#08872B]" : "text-inherit",
												)}
											/>
										</motion.div>
									</div>
									<AnimatePresence>
										{useGithubSearch && (
											<motion.span
												initial={{ width: 0, opacity: 0 }}
												animate={{ width: "auto", opacity: 1 }}
												exit={{ width: 0, opacity: 0 }}
												transition={{ duration: 0.2 }}
												className="flex-shrink-0 overflow-hidden whitespace-nowrap text-[#08872B] text-xs"
											>
												GitHub Issues
											</motion.span>
										)}
									</AnimatePresence>
								</button>

								<CustomDivider />

								<button
									type="button"
									onClick={() => handleToggleChange("stackoverflow")}
									className={cn(
										"flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all",
										useStackOverflowSearch
											? "border-[#f48024] bg-[#f48024]/15 text-[#f48024]"
											: "border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]",
									)}
								>
									<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
										<motion.div
											animate={{
												scale: useStackOverflowSearch ? 1.1 : 1,
											}}
											whileHover={{
												scale: 1.1,
												transition: {
													type: "spring",
													stiffness: 300,
													damping: 10,
												},
											}}
											transition={{
												type: "spring",
												stiffness: 260,
												damping: 25,
											}}
										>
											<Stackoverflow
												className={cn(
													"h-4 w-4",
													useStackOverflowSearch
														? "text-[#f48024]"
														: "text-inherit",
												)}
											/>
										</motion.div>
									</div>
									<AnimatePresence>
										{useStackOverflowSearch && (
											<motion.span
												initial={{ width: 0, opacity: 0 }}
												animate={{ width: "auto", opacity: 1 }}
												exit={{ width: 0, opacity: 0 }}
												transition={{ duration: 0.2 }}
												className="flex-shrink-0 overflow-hidden whitespace-nowrap text-[#f48024] text-xs"
											>
												StackOverflow
											</motion.span>
										)}
									</AnimatePresence>
								</button>

								<CustomDivider />

								<button
									type="button"
									onClick={handleCanvasToggle}
									className={cn(
										"flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all",
										showCanvas
											? "border-[#F97316] bg-[#F97316]/15 text-[#F97316]"
											: "border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]",
									)}
								>
									<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
										<motion.div
											animate={{
												rotate: showCanvas ? 360 : 0,
												scale: showCanvas ? 1.1 : 1,
											}}
											whileHover={{
												rotate: showCanvas ? 360 : 15,
												scale: 1.1,
												transition: {
													type: "spring",
													stiffness: 300,
													damping: 10,
												},
											}}
											transition={{
												type: "spring",
												stiffness: 260,
												damping: 25,
											}}
										>
											<FolderCode
												className={cn(
													"h-4 w-4",
													showCanvas ? "text-[#F97316]" : "text-inherit",
												)}
											/>
										</motion.div>
									</div>
									<AnimatePresence>
										{showCanvas && (
											<motion.span
												initial={{ width: 0, opacity: 0 }}
												animate={{ width: "auto", opacity: 1 }}
												exit={{ width: 0, opacity: 0 }}
												transition={{ duration: 0.2 }}
												className="flex-shrink-0 overflow-hidden whitespace-nowrap text-[#F97316] text-xs"
											>
												Canvas
											</motion.span>
										)}
									</AnimatePresence>
								</button>
							</div>
						</div>

						<PromptInputAction
							tooltip={
								isLoading
									? "Stop generation"
									: isRecording
										? "Stop recording"
										: hasContent
											? "Send message"
											: "Voice message"
							}
						>
							<PromptButton
								variant="default"
								size="icon"
								className={cn(
									"h-8 w-8 rounded-full transition-all duration-200",
									isRecording
										? "bg-transparent text-red-500 hover:bg-gray-600/30 hover:text-red-400"
										: hasContent
											? "bg-white text-[#1F2023] hover:bg-white/80"
											: "bg-transparent text-[#9CA3AF] hover:bg-gray-600/30 hover:text-[#D1D5DB]",
								)}
								onClick={() => {
									if (isRecording) setIsRecording(false);
									else if (hasContent) handleSubmit();
									else setIsRecording(true);
								}}
								disabled={isLoading && !hasContent}
							>
								{isLoading ? (
									<Square className="h-4 w-4 animate-pulse fill-[#1F2023]" />
								) : isRecording ? (
									<StopCircle className="h-5 w-5 text-red-500" />
								) : hasContent ? (
									<ArrowUp className="h-4 w-4 text-[#1F2023]" />
								) : (
									<Mic className="h-5 w-5 transition-colors" />
								)}
							</PromptButton>
						</PromptInputAction>
					</PromptInputActions>
				</PromptInput>

				<ImageViewDialog
					imageUrl={selectedImage}
					onClose={() => setSelectedImage(null)}
				/>
			</>
		);
	},
);
PromptInputBox.displayName = "PromptInputBox";
