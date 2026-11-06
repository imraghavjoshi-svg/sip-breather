import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Roboto is used inside the Pixel 9 and Frameless phones.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "SIP Breather",
  description: "Concept: a better Cancel SIP moment",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
