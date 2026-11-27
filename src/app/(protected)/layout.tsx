import { ProtectedProviders } from "@/app/(protected)/protected-providers"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <ProtectedProviders>
      <SidebarProvider>
        <AppSidebar boards={[]} />
        {children}
      </SidebarProvider>
    </ProtectedProviders>
  )
}
