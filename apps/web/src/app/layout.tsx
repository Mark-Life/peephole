import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { Providers } from "@/components/providers";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => (
  <html
    className={cn("font-sans", dmSans.variable, geistHeading.variable)}
    lang="en"
    suppressHydrationWarning
  >
    <body
      className={`${dmSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
