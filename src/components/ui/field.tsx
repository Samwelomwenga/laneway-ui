import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function FieldGroup({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-form-gap",
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-field-gap",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal: "flex-row items-center *:data-[slot=field-label]:flex-auto",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: Readonly<React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: Readonly<React.ComponentProps<typeof Label>>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "flex w-fit gap-2 group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: Readonly<React.ComponentProps<"p">>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-meta text-muted-foreground",
        "[&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  )
}

function FieldError({ className, children, ...props }: Readonly<React.ComponentProps<"div">>) {
  if (children == null) {
    return null
  }

  return (
    <div
      data-slot="field-error"
      className={cn("text-meta text-destructive", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
}
