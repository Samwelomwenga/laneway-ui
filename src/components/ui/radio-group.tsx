"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/lib/utils"

function RadioGroup<Value>({ className, ...props }: Readonly<RadioGroupPrimitive.Props<Value>>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: Readonly<RadioPrimitive.Root.Props>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "relative flex size-4.5 shrink-0 items-center justify-center rounded-chip border border-input bg-card outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-primary-foreground data-checked:bg-primary dark:data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2 rounded-chip bg-primary-foreground"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
