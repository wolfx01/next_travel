import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import FloatingPlannerButton from "@/components/FloatingPlannerButton";
import ScrollToTop from "@/components/ScrollToTop";
import "./styles/globals.css";
import "./styles/home.css";
import "./styles/Footer.css";
import "./styles/countries.css";
import "./styles/places.css";
import "./styles/form.css";
import "./styles/chat.css";
import "./styles/Navbar.css";
import "./styles/details.css";
import "./styles/profile.css";
import "./styles/social.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Travel - Discover the Best Destinations in Morocco',
  description: 'Your smart guide to travel and explore tourist attractions using AI.',
  keywords: 'travel, tourism, Morocco, destinations, AI',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use a client component wrapper or just check params if possible, 
  // but since this is a Server Component layout, we can't use usePathname directly here nicely without making it client or using headers.
  // Converting RootLayout to client is not ideal for metadata.
  // Better approach: Make Footer a client component that checks pathname itself.
  
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Navbar />
        {children}
        <Analytics />
        <FooterWrapper />
        <Chatbot />
        <FloatingPlannerButton />
        <ScrollToTop />
      </body>
    </html>
  );
}

import FooterWrapper from "@/components/FooterWrapper";
