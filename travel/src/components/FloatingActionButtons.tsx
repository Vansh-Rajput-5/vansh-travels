"use client"

import { MessageCircle } from "lucide-react"
import Link from "next/link"

export default function FloatingActionButtons() {
  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/918685997685" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] h-14 w-14 rounded-full bg-[#25D366] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-8 w-8" />
      </a>


    </>
  )
}
