"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { Menu01Icon, MenuCollapseIcon } from "@hugeicons/core-free-icons"
import { createContext, use, useState } from "react"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type SidebarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = use(SidebarContext)
  if (!context)
    throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

function SidebarProvider({ className, children, ...props }: Readonly<React.ComponentProps<"div">>) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(true)
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <SidebarContext value={{
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
    }}
    >
      <div
        data-slot="sidebar-wrapper"
        className={cn("flex h-dvh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext>
  )
}

function Sidebar({ label, children }: Readonly<{ label: string, children: React.ReactNode }>) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" data-slot="sidebar" className="w-64 bg-sidebar text-sidebar-foreground">
          <SheetTitle className="sr-only">{label}</SheetTitle>
          <nav aria-label={label} className="flex h-full flex-col">{children}</nav>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      className="group/sidebar hidden w-64 shrink-0 overflow-hidden transition-[width] duration-(--duration-base) ease-enter data-[state=collapsed]:w-0 motion-reduce:transition-none lg:block"
    >
      <nav
        aria-label={label}
        inert={!open}
        className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground"
      >
        {children}
      </nav>
    </div>
  )
}

function SidebarTrigger({ label, className }: Readonly<{ label: string, className?: string }>) {
  const { isMobile, open, setOpen, openMobile, setOpenMobile } = useSidebar()
  const expanded = isMobile ? openMobile : open

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-expanded={expanded}
      className={className}
      onClick={() => isMobile
        ? setOpenMobile(!openMobile)
        : setOpen(!open)}
    >
      <Icon icon={Menu01Icon} className="lg:hidden" />
      <Icon icon={MenuCollapseIcon} className={cn("max-lg:hidden", !open && "-scale-x-100")} />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

function SidebarInset({ className, ...props }: Readonly<React.ComponentProps<"main">>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex min-w-0 flex-1 flex-col bg-background", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return <div data-slot="sidebar-header" className={cn("flex items-center gap-2 p-3", className)} {...props} />
}

function SidebarContent({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return <div data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)} {...props} />
}

function SidebarFooter({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return <div data-slot="sidebar-footer" className={cn("flex items-center gap-2 p-3", className)} {...props} />
}

function SidebarGroup({ className, ...props }: Readonly<React.ComponentProps<"section">>) {
  return <section data-slot="sidebar-group" className={cn("flex flex-col gap-1 px-3 py-2", className)} {...props} />
}

function SidebarGroupLabel({ className, children, ...props }: Readonly<React.ComponentProps<"h2">>) {
  return <h2 data-slot="sidebar-group-label" className={cn("px-2.5 py-1 text-meta text-muted-foreground", className)} {...props}>{children}</h2>
}

function SidebarMenu({ className, ...props }: Readonly<React.ComponentProps<"ul">>) {
  return <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-0.5", className)} {...props} />
}

function SidebarMenuItem(props: Readonly<React.ComponentProps<"li">>) {
  return <li data-slot="sidebar-menu-item" {...props} />
}

function SidebarMenuButton({
  render,
  isActive = false,
  className,
  ...props
}: Readonly<useRender.ComponentProps<"button"> & { isActive?: boolean }>) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "flex h-control w-full items-center gap-2.5 rounded-control px-2.5 text-start text-card-title outline-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&>span]:truncate",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "sidebar-menu-button", active: isActive },
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
