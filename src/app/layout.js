'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { FaBars } from "react-icons/fa";

const inter = Inter({ subsets: ["latin"] });

// We can't use metadata in a 'use client' file, but we can set the title in the component.

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthPage = pathname === '/login';

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>Sanad ERP System</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-center" />
          <div className="flex h-screen bg-gray-100">
            {!isAuthPage && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!isAuthPage && (
                <header className="bg-white shadow-md md:hidden">
                  <div className="px-4 py-2 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">نظام سند</h1>
                    <button onClick={() => setIsSidebarOpen(true)}><FaBars className="h-6 w-6" /></button>
                  </div>
                </header>
              )}
              <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
