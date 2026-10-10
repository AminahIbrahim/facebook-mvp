import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facebook MVP",
  description: "Connect with friends and the world around you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}