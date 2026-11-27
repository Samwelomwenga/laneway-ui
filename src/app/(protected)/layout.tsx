import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar boards={[]} />
      {children}
    </SidebarProvider>
  )
}
