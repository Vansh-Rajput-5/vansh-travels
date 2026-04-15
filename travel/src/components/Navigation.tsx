"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, LogOut, Heart, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AuthModal from './AuthModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, logout } = useAuth()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#destinations', label: 'Destinations' },
    { href: '/booking', label: 'Book Now' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <>
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight text-blue-600">Vansh Travels</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100 ring-offset-2 transition-all hover:ring-blue-200">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-slate-200 p-2">
                  <DropdownMenuLabel className="font-semibold text-slate-900 px-3 py-2">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-slate-500">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                  <DropdownMenuItem asChild className="rounded-lg focus:bg-blue-50 focus:text-blue-600 cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2">
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg focus:bg-pink-50 focus:text-pink-600 cursor-pointer">
                    <div className="flex items-center gap-3 px-3 py-2 w-full">
                      <Heart size={18} />
                      <span>Favorites</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="rounded-lg focus:bg-red-50 focus:text-red-600 cursor-pointer text-red-500"
                  >
                    <div className="flex items-center gap-3 px-3 py-2 w-full">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-[#AC2424] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#8A1D1D] hover:shadow-lg focus:outline-none"
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {user && (
               <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <button
              className="text-slate-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#AC2424] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#8A1D1D]"
                >
                  <LogIn size={18} />
                  Login
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="mt-4 w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
