"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { ContactRound, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import api, { apiErrorMessage } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("")
  const [showPassword,setShowPassword]=useState(false); const [loading,setLoading]=useState(false)
  const handleSubmit=async(event:FormEvent)=>{
    event.preventDefault();setLoading(true)
    try { await api.post("/auth/register",{full_name:name,email,password});toast.success("Your account is ready. Sign in to continue.");router.push("/login") }
    catch (error) { toast.error(apiErrorMessage(error, "We couldn’t create your account. Please try again.")) }
    finally {setLoading(false)}
  }
  return <main className="auth-page">
    <aside className="auth-aside"><Link href="/register" className="brand"><span className="brand-mark"><ContactRound size={20}/></span><span>cardwise<span className="brand-period">.</span></span></Link><div className="auth-message"><p className="eyebrow">MAKE EVERY INTRODUCTION COUNT</p><h1>Your next great connection starts here.</h1><p>Build a thoughtful, searchable directory from the business cards you collect.</p></div><p className="auth-foot">A calmer way to keep in touch.</p></aside>
    <section className="auth-main"><div className="auth-form-wrap"><p className="eyebrow">GET STARTED</p><h2>Create your account</h2><p>Your contacts stay private to your account.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div><label className="field-label" htmlFor="name">Your name</label><div style={{position:"relative"}}><UserRound size={17} style={{position:"absolute",left:14,top:14,color:"#87928b"}}/><input className="field" id="name" autoComplete="name" required value={name} onChange={(event)=>setName(event.target.value)} placeholder="Alex Morgan" style={{paddingLeft:42}}/></div></div>
        <div><label className="field-label" htmlFor="email">Email address</label><div style={{position:"relative"}}><Mail size={17} style={{position:"absolute",left:14,top:14,color:"#87928b"}}/><input className="field" id="email" type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="you@company.com" style={{paddingLeft:42}}/></div></div>
        <div><label className="field-label" htmlFor="password">Password</label><div className="password-wrap"><LockKeyhole size={17} style={{position:"absolute",left:14,top:14,color:"#87928b"}}/><input className="field" id="password" type={showPassword?"text":"password"} autoComplete="new-password" minLength={8} required value={password} onChange={(event)=>setPassword(event.target.value)} placeholder="At least 8 characters" style={{paddingLeft:42}}/><button type="button" className="password-toggle" onClick={()=>setShowPassword((show)=>!show)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>
        <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading?"Creating your account…":"Create account"}</button>
      </form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
    </div></section>
  </main>
}
