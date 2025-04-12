import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";
import {systemConfigService} from "@/lib/services/system-config";
import {SystemConfigKey} from "@/lib/types/models/system-config";
import {dbService} from "@/lib/db/service";
import {Toaster} from "sonner";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  await dbService.connect();
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName);
  const description = await systemConfigService.get<string>(SystemConfigKey.OrgDesc);

  return {
    title,
    description,
  }
}


export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="en">
    <body
      className={`${interFont.variable} antialiased`}
    >
    {children}
    <Toaster position="top-right"/>
    </body>
    </html>
  );
}
