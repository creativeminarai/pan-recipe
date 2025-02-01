import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import { Home, ClipboardList, Wheat, Book } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bakery Management System",
  description: "Manage your bakery flour blends and recipes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4 text-sm">
            <li>
              <a href="/" className="flex items-center">
                <Home className="w-5 h-5 mr-1" />
                <span>一覧</span>
              </a>
            </li>
            <li>
              <a href="/register" className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-1" />
                <span>登録</span>
              </a>
            </li>
            <li>
              <a href="/recipe" className="flex items-center">
                <Book className="w-5 h-5 mr-1" />
                <span>レシピ</span>
              </a>
            </li>
            <li>
              <a href="/wheat-info" className="flex items-center">
                <Wheat className="w-5 h-5 mr-1" />
                <span>小麦</span>
              </a>
            </li>
          </ul>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}

