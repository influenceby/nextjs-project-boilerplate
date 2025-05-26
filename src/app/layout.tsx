import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "netdisk.in - Digital Storage SaaS",
  description: "SaaS Application for Digital Storage with AWS S3 Integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white text-black">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
