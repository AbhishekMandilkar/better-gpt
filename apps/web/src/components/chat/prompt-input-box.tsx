"use client";

import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { cn } from "@/lib/utils";

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
				<div className="relative overflow-hidden rounded-2xl bg-[#1F2023] shadow-2xl">
					{/* biome-ignore lint/performance/noImgElement: blob URLs cannot be optimized by next/image */}
					<img
						src={imageUrl}
						alt="Full preview"
						className="max-h-[80vh] w-full rounded-2xl object-contain"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// Main PromptInputBox Component
interface PromptInputBoxProps {
	onSend?: (message: string, files?: File[]) => void;
	isLoading?: boolean;
	placeholder?: string;
	className?: string;
}

export const PromptInputBox = React.forwardRef<
	HTMLDivElement,
	PromptInputBoxProps
>((props, ref) => {
	const {
		onSend = () => {},
		isLoading = false,
		placeholder = "Type your message here...",
		className,
	} = props;

	const [input, setInput] = React.useState("");
	const [files, setFiles] = React.useState<File[]>([]);
	const [filePreviews, setFilePreviews] = React.useState<{
		[key: string]: string;
	}>({});
	const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
	const uploadInputRef = React.useRef<HTMLInputElement>(null);

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
			onSend(input, files);
			setInput("");
			setFiles([]);
			setFilePreviews({});
		}
	};

	const hasContent = input.trim() !== "" || files.length > 0;

	return (
		<>
			<PromptInput
				ref={ref}
				value={input}
				onValueChange={setInput}
				isLoading={isLoading}
				onSubmit={handleSubmit}
				disabled={isLoading}
				className={cn(
					"relative z-10 w-full rounded-3xl border border-border bg-primary-foreground p-0 pt-1 shadow-xs",
					className,
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<div className="flex flex-col">
					{/* Image previews */}
					{files.length > 0 && (
						<div className="flex flex-wrap gap-2 px-4 pt-3">
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

					<PromptInputTextarea
						placeholder={placeholder}
						className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
					/>

					<PromptInputActions className="mt-2 flex w-full items-center justify-between gap-2 px-3 pb-3">
						<div className="flex items-center gap-1">
							<PromptInputAction tooltip="Upload image">
								<button
									type="button"
									onClick={() => uploadInputRef.current?.click()}
									className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									<Paperclip className="h-5 w-5" />
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
						</div>

						<button
							type="button"
							disabled={!hasContent || isLoading}
							onClick={handleSubmit}
							className={cn(
								"flex size-8 items-center justify-center rounded-full transition-all duration-200",
								hasContent
									? "bg-foreground text-background hover:bg-foreground/80"
									: "bg-muted text-muted-foreground",
							)}
						>
							{isLoading ? (
								<Square className="h-4 w-4 animate-pulse fill-current" />
							) : (
								<ArrowUp className="h-4 w-4" />
							)}
						</button>
					</PromptInputActions>
				</div>
			</PromptInput>

			<ImageViewDialog
				imageUrl={selectedImage}
				onClose={() => setSelectedImage(null)}
			/>
		</>
	);
});
PromptInputBox.displayName = "PromptInputBox";
