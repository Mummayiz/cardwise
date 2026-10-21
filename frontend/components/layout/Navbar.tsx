"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { ContactRound, LayoutDashboard, LogOut, ScanLine } from "lucide-react"
import toast from "react-hot-toast"

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/cards", label: "Contacts", icon: ContactRound },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const initials = (user?.full_name || user?.email || "U").slice(0, 1).toUpperCase()

  const handleLogout = () => {
    logout()
    toast.success("You’ve been signed out")
    router.push("/login")
  }

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link href="/dashboard" className="brand" aria-label="Cardwise home">
            <span className="brand-mark"><ContactRound size={20} strokeWidth={2.2} /></span>
            <span>cardwise<span className="brand-period">.</span></span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`}>
                <Icon size={17} aria-hidden="true" />{label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/cards/new" className="button button-primary header-scan"><ScanLine size={17} /> <span>Scan a card</span></Link>
            <div className="profile-pill" title={user?.email || "Account"}>
              <span className="avatar">{initials}</span>
              <span className="profile-name">{user?.full_name || user?.email || "My account"}</span>
            </div>
            <button className="icon-button logout-button" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`mobile-tab ${pathname === href ? "active" : ""}`}>
            <Icon size={20} aria-hidden="true" /><span>{label}</span>
          </Link>
        ))}
        <Link href="/cards/new" className={`mobile-tab ${pathname === "/cards/new" ? "active" : ""}`}>
          <ScanLine size={20} aria-hidden="true" /><span>Scan</span>
        </Link>
        <button className="mobile-tab" onClick={handleLogout}><LogOut size={20} aria-hidden="true" /><span>Sign out</span></button>
      </nav>
    </>
  )
}
