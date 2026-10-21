"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { ContactRound, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import api, { apiErrorMessage } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
  const router = useRouter()
  const setToken = useAuthStore((state) => state.setToken)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true)
    try {
      const form = new URLSearchParams(); form.append("username", email); form.append("password", password)
      const { data } = await api.post("/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
      setToken(data.access_token); toast.success("Welcome back"); router.push("/dashboard")
    } catch (error) { toast.error(apiErrorMessage(error, "We couldn’t sign you in. Check your email and password.")) }
    finally { setLoading(false) }
  }
  return <main className="auth-page">
    <aside className="auth-aside"><Link href="/login" className="brand"><span className="brand-mark"><ContactRound size={20}/></span><span>cardwise<span className="brand-period">.</span></span></Link><div className="auth-message"><p className="eyebrow">YOUR PROFESSIONAL NETWORK</p><h1>Good connections deserve to be remembered.</h1><p>Keep every introduction close. Scan a card today, find that connection whenever you need it.</p></div><p className="auth-foot">Your contacts, organized around you.</p></aside>
    <section className="auth-main"><div className="auth-form-wrap"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to Cardwise</h2><p>Pick up right where your network is.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div><label className="field-label" htmlFor="email">Email address</label><div style={{position:"relative"}}><Mail size={17} style={{position:"absolute",left:14,top:14,color:"#87928b"}}/><input className="field" id="email" type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="you@company.com" style={{paddingLeft:42}}/></div></div>
        <div><label className="field-label" htmlFor="password">Password</label><div className="password-wrap"><LockKeyhole size={17} style={{position:"absolute",left:14,top:14,color:"#87928b"}}/><input className="field" id="password" type={showPassword?"text":"password"} autoComplete="current-password" required value={password} onChange={(event)=>setPassword(event.target.value)} placeholder="Enter your password" style={{paddingLeft:42}}/><button type="button" className="password-toggle" onClick={()=>setShowPassword((show)=>!show)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>
        <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading?"Signing you in…":"Sign in"}</button>
      </form><p className="auth-switch">New to Cardwise? <Link href="/register">Create an account</Link></p>
    </div></section>
  </main>
}
