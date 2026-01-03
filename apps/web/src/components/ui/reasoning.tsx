"use client"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Markdown } from "./markdown"

type ReasoningContextType = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(
  undefined
)

function useReasoningContext() {
  const context = useContext(ReasoningContext)
  if (!context) {
    throw new Error(
      "useReasoningContext must be used within a Reasoning provider"
    )
  }
  return context
}

export type ReasoningProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}

function Reasoning({
  children,
  className,
  open,
  onOpenChange,
  isStreaming,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [wasAutoOpened, setWasAutoOpened] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  useEffect(() => {
    if (isStreaming && !wasAutoOpened) {
      if (!isControlled) setInternalOpen(true)
      setWasAutoOpened(true)
    }

    if (!isStreaming && wasAutoOpened) {
      if (!isControlled) setInternalOpen(false)
      setWasAutoOpened(false)
    }
  }, [isStreaming, wasAutoOpened, isControlled])

  return (
    <ReasoningContext.Provider
      value={{
        isOpen,
        onOpenChange: handleOpenChange,
      }}
    >
      <div className={className}>{children}</div>
    </ReasoningContext.Provider>
  )
}

export type ReasoningTriggerProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLButtonElement>

function ReasoningTrigger({
  children,
  className,
  ...props
}: ReasoningTriggerProps) {
  const { isOpen, onOpenChange } = useReasoningContext()

  return (
    <button
      type="button"
      className={cn("flex cursor-pointer items-center gap-2", className)}
      onClick={() => onOpenChange(!isOpen)}
      {...props}
    >
      <span className="text-muted-foreground">{children}</span>
      <div
        className={cn(
          "transform transition-transform text-muted-foreground",
          isOpen ? "rotate-180" : ""
        )}
      >
        <ChevronDownIcon className="size-4" />
      </div>
    </button>
  )
}

export type ReasoningContentProps = {
  children: React.ReactNode
  className?: string
  markdown?: boolean
  contentClassName?: string
} & React.HTMLAttributes<HTMLDivElement>

function ReasoningContent({
  children,
  className,
  contentClassName,
  markdown = false,
  ...props
}: ReasoningContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const { isOpen } = useReasoningContext()
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!innerRef.current) return

    const observer = new ResizeObserver(() => {
      if (innerRef.current) {
        setHeight(innerRef.current.scrollHeight)
      }
    })

    observer.observe(innerRef.current)
    setHeight(innerRef.current.scrollHeight)

    return () => observer.disconnect()
  }, [children])

  const content = markdown ? (
    <Markdown>{children as string}</Markdown>
  ) : (
    children
  )

  return (
    <div
      ref={contentRef}
      className={cn(
        "grid transition-[grid-template-rows] duration-150 ease-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div
          ref={innerRef}
          className={cn(
            "text-muted-foreground prose prose-sm dark:prose-invert",
            className,
            contentClassName
          )}
        >
          {content}
        </div>
      </div>
    </div>
  )
}

export { Reasoning, ReasoningTrigger, ReasoningContent }
