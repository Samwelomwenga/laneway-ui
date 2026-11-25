"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

export function InlineComposer({
  label,
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
}: Readonly<{
  label: string
  placeholder: string
  submitLabel: string
  onSubmit: (text: string) => void
  onCancel: () => void
}>) {
  const [text, setText] = useState("")

  function submit() {
    const trimmed = text.trim()
    if (trimmed === "")
      return
    onSubmit(trimmed)
    setText("")
  }

  return (
    <form
      className="flex flex-col gap-card-gap"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <textarea
        aria-label={label}
        placeholder={placeholder}
        value={text}
        rows={2}
        ref={focusOnMount}
        onChange={event => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
          }
          else if (event.key === "Escape") {
            event.preventDefault()
            onCancel()
          }
        }}
        className="field-sizing-content min-h-16 w-full resize-none rounded-card bg-card p-(--card-pad) text-card-title text-card-foreground shadow-card outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      />
      <div className="flex items-center gap-1.5">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <Icon icon={Cancel01Icon} />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
    </form>
  )
}

function focusOnMount(element: HTMLTextAreaElement | null) {
  element?.focus()
}
