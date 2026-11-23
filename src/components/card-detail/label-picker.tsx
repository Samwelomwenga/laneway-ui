"use client"

import type { BoardLabel } from "@/components/label-chip"
import { useId } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { FieldLabel } from "@/components/ui/field"
import { LABEL_COLOR_NAMES } from "@/lib/label-colors"
import { cn } from "@/lib/utils"

function labelName(label: BoardLabel) {
  return label.name ?? LABEL_COLOR_NAMES[label.color]
}

function colorName(label: BoardLabel) {
  return label.color && LABEL_COLOR_NAMES[label.color]
}

function sameLabel(item: BoardLabel, value: BoardLabel) {
  return item.id === value.id
}

export function LabelPicker({
  labels,
  picked,
  onChange,
}: Readonly<{
  labels: BoardLabel[]
  picked: BoardLabel[]
  onChange: (labels: BoardLabel[]) => void
}>) {
  const inputId = useId()
  const anchor = useComboboxAnchor()

  return (
    <div className="flex flex-col gap-field-gap">
      <Combobox
        multiple
        items={labels}
        value={picked}
        onValueChange={(value, details) => {
          // Base UI clears every pick on Escape while the list is closed. Here Escape closes the dialog instead.
          if (details.reason === "escape-key") {
            details.allowPropagation()
            return
          }
          onChange(value)
        }}
        itemToStringLabel={labelName}
        isItemEqualToValue={sameLabel}
      >
        <FieldLabel htmlFor={inputId} className="text-heading">Labels</FieldLabel>
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(value: BoardLabel[]) => (
              <>
                {value.map(label => (
                  <ComboboxChip
                    key={label.id}
                    data-color={label.color}
                    removeLabel={`Remove ${labelName(label)}`}
                    aria-description="Press Backspace or Delete to remove"
                    className={cn(
                      label.name !== undefined && label.color
                        ? "bg-label-tint text-label-text"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {label.name === undefined && <Swatch label={label} className="me-1.5" />}
                    {labelName(label)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={inputId}
                  placeholder={value.length > 0
                    ? undefined
                    : "Pick labels"}
                  aria-description={value.length > 0
                    ? `${value.length} picked. From the start of the field, press Left Arrow to reach them.`
                    : undefined}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No labels match.</ComboboxEmpty>
          <ComboboxList>
            {(label: BoardLabel) => (
              <ComboboxItem key={label.id} value={label}>
                <Swatch label={label} />
                <span className="min-w-0 truncate">{labelName(label)}</span>
                {label.name !== undefined && label.color && (
                  <span className="ms-auto shrink-0 text-meta text-muted-foreground">{colorName(label)}</span>
                )}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

function Swatch({ label, className }: Readonly<{ label: BoardLabel, className?: string }>) {
  return (
    <span
      aria-hidden
      data-color={label.color}
      className={cn(
        "inline-block h-3 w-6 shrink-0 rounded-chip",
        label.color
          ? "bg-label-strong ring-1 ring-label-ring ring-inset"
          : "border border-input",
        className,
      )}
    />
  )
}
