"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { X, Mail, Lock, User, Phone, LogIn } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin ? { email, password } : { name, email, phone, password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        login(data.user)
        toast.success(isLogin ? "Login Successful" : "Registration Successful")
        onClose()
      } else {
        toast.error(data.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-2xl relative w-full max-w-[480px] overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-full border border-red-100">
                    <LogIn className="w-5 h-5 text-[#AC2424]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isLogin ? "Login Or Register" : "Create Account"}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:border-[#AC2424] focus:ring-1 focus:ring-[#AC2424] outline-none transition-all placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:border-[#AC2424] focus:ring-1 focus:ring-[#AC2424] outline-none transition-all placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:border-[#AC2424] focus:ring-1 focus:ring-[#AC2424] outline-none transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:border-[#AC2424] focus:ring-1 focus:ring-[#AC2424] outline-none transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between py-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#AC2424] focus:ring-[#AC2424]"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                      </label>
                      <button type="button" className="text-sm font-semibold text-gray-900 hover:text-[#AC2424] transition-colors">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#AC2424] hover:bg-[#8A1D1D] text-white py-3.5 rounded-md font-bold text-lg transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Please wait..." : isLogin ? "Login" : "Register Now"}
                  </button>
                </form>

                {/* Switch Login/Register */}
                <div className="mt-8 text-center border-t border-gray-50 pt-6">
                  <p className="text-gray-600">
                    {isLogin ? (
                      <>
                        Don't have an account?{" "}
                        <button 
                          onClick={() => setIsLogin(false)}
                          className="text-[#AC2424] font-bold hover:underline ml-1"
                        >
                          Register now!
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button 
                          onClick={() => setIsLogin(true)}
                          className="text-[#AC2424] font-bold hover:underline ml-1"
                        >
                          Login here
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
