import type { Metadata } from "next"
import { Add01Icon, Delete02Icon, MoreHorizontalIcon, Share08Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const metadata: Metadata = {
  title: "Specimen · Laneway",
}

const TYPE_ROLES = [
  { name: "Display", className: "text-display", sample: "Nothing here yet" },
  { name: "Title", className: "text-title", sample: "Card details" },
  { name: "Heading", className: "text-heading", sample: "In progress" },
  { name: "Card", className: "text-card-title", sample: "Fix the login redirect loop" },
  { name: "Body", className: "max-w-[68ch] text-body", sample: "Descriptions and comments use the body role. It caps at 68 characters a line so long notes stay easy to read." },
  { name: "Meta", className: "text-meta text-muted-foreground", sample: "Nov 18 · 3/12 · 4 comments" },
] as const

const COLOR_GROUPS = [
  {
    name: "Surfaces",
    tokens: [
      "background",
      "list",
      "card",
      "popover",
      "secondary",
      "muted",
      "sidebar",
    ],
  },
  {
    name: "Text",
    tokens: [
      "foreground",
      "card-foreground",
      "popover-foreground",
      "secondary-foreground",
      "muted-foreground",
      "sidebar-foreground",
    ],
  },
  {
    name: "Accent",
    tokens: [
      "primary",
      "primary-foreground",
      "accent",
      "accent-foreground",
      "selection",
      "sidebar-accent",
      "sidebar-accent-foreground",
    ],
  },
  {
    name: "Edges",
    tokens: ["border", "input", "ring"],
  },
  {
    name: "Status",
    tokens: [
      "destructive",
      "destructive-foreground",
      "success",
      "success-foreground",
      "warning",
      "warning-foreground",
      "info",
      "info-foreground",
    ],
  },
] as const

const SHADOWS = [
  { name: "card", className: "shadow-card" },
  { name: "card-hover", className: "shadow-card-hover" },
  { name: "lift", className: "shadow-lift" },
  { name: "popover", className: "shadow-popover" },
  { name: "dialog", className: "shadow-dialog" },
] as const

export default function SpecimenPage() {
  return (
    <main className="@container mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-title">Specimen</h1>
        <ModeToggle />
      </header>
      <TypeScale />
      <Colors />
      <Shadows />
      <Buttons />
      <Chips />
      <Fields />
    </main>
  )
}

function Section({ title, children }: Readonly<{ title: string, children: React.ReactNode }>) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

function TypeScale() {
  return (
    <Section title="Type">
      <dl className="flex flex-col gap-5">
        {TYPE_ROLES.map(role => (
          <div key={role.name} className="flex flex-col gap-1">
            <dt className="text-meta text-muted-foreground">{role.name}</dt>
            <dd className={role.className}>{role.sample}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function Colors() {
  return (
    <Section title="Color">
      {COLOR_GROUPS.map(group => (
        <div key={group.name} className="flex flex-col gap-2">
          <h3 className="text-meta text-muted-foreground">{group.name}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
            {group.tokens.map(token => (
              <li key={token} className="flex flex-col gap-1.5">
                <span
                  className="h-12 rounded-card border"
                  style={{ backgroundColor: `var(--${token})` }}
                />
                <span className="text-meta break-all">{token}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}

function Shadows() {
  return (
    <Section title="Shadow">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-6">
        {SHADOWS.map(shadow => (
          <li
            key={shadow.name}
            className={`flex h-20 items-end rounded-card bg-card p-3 text-meta ${shadow.className}`}
          >
            {shadow.name}
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Buttons() {
  return (
    <Section title="Buttons">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Create board</Button>
        <Button variant="secondary">
          <Icon icon={Share08Icon} />
          Share
        </Button>
        <Button variant="ghost">
          <Icon icon={Add01Icon} />
          Add a card
        </Button>
        <Button variant="ghost" size="icon">
          <Icon icon={MoreHorizontalIcon} />
          <span className="sr-only">Card actions</span>
        </Button>
        <Button disabled>Disabled</Button>
        <Button variant="ghost" size="icon" disabled>
          <Icon icon={Delete02Icon} />
          <span className="sr-only">Archive</span>
        </Button>
      </div>
    </Section>
  )
}

function Chips() {
  return (
    <Section title="Chips">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>+2</Badge>
        <Badge>3 of 12</Badge>
        <Badge variant="outline" title="Not a member of this workspace">Guest</Badge>
      </div>
    </Section>
  )
}

function Fields() {
  return (
    <Section title="Fields">
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="specimen-normal">Board name</FieldLabel>
          <Input id="specimen-normal" placeholder="Product roadmap" />
        </Field>
        <Field>
          <FieldLabel htmlFor="specimen-focus">Focus</FieldLabel>
          <Input id="specimen-focus" defaultValue="Shown as focused" className="border-ring ring-1 ring-ring" />
          <FieldDescription>Drawn with the focus style so both themes show it at once.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="specimen-error">Email</FieldLabel>
          <Input id="specimen-error" type="email" defaultValue="sam@" aria-invalid aria-describedby="specimen-error-message" />
          <FieldError id="specimen-error-message">Enter a full email address, like sam@example.com.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="specimen-textarea">Description</FieldLabel>
          <Textarea id="specimen-textarea" placeholder="Add more detail" />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="specimen-textarea-error">Comment</FieldLabel>
          <Textarea id="specimen-textarea-error" aria-invalid aria-describedby="specimen-textarea-error-message" />
          <FieldError id="specimen-textarea-error-message">Write something before you post.</FieldError>
        </Field>
      </FieldGroup>
    </Section>
  )
}
