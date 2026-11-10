import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Laneway",
  description: "The web client for Laneway.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
