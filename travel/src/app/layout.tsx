import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import SiteChrome from "@/components/SiteChrome";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import FloatingActionButtons from "@/components/FloatingActionButtons";

export const metadata: Metadata = {
  title: "Vansh Travels - Your Trusted Travel Partner",
  description: "Book comfortable and reliable travel services to beautiful destinations across India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
          />
          <SiteChrome>{children}</SiteChrome>
          <VisualEditsMessenger />
          <FloatingActionButtons />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
