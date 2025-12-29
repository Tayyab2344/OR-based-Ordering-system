import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neon Bites - Restaurant Ordering System",
  description: "Order delicious food directly from your table. Experience the fusion of technology and flavors.",
  keywords: ["restaurant", "ordering", "food", "menu", "QR code"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
