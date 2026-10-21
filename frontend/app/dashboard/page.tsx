"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { ArrowRight, Building2, Check, ContactRound, Mail, ScanLine, Sparkles, UsersRound } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { BusinessCard } from "@/types"
import Navbar from "@/components/layout/Navbar"
import ExportActions from "@/components/exports/ExportActions"

export default function DashboardPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { router.replace("/login"); return }
    api.get<BusinessCard[]>("/cards/")
      .then(({ data }) => setCards(data))
      .catch(() => toast.error("Couldn’t load your contacts. Please try again."))
      .finally(() => setLoading(false))
  }, [token, router])

  const recent = [...cards].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
  const withEmail = cards.filter((card) => card.email).length
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there"

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="welcome-kicker"><Sparkles size={15} /> YOUR NETWORK, IN ONE PLACE</span>
            <h1 className="welcome-title">Good to see you, {firstName}.</h1>
            <p className="welcome-desc">Turn the business cards on your desk into a searchable, always-ready contact list.</p>
            <div className="welcome-actions">
              <Link href="/cards/new" className="button button-primary"><ScanLine size={17} /> Scan a business card</Link>
              <Link href="/cards" className="button button-secondary">Browse contacts <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="card-illustration"><div className="card-line"/><div className="card-line short"/><div className="card-line tiny"/></div>
          </div>
        </section>

        <section className="stat-grid" aria-label="Contact statistics">
          <article className="surface stat-card">
            <span className="stat-icon"><ContactRound size={20} /></span>
            <div><p className="stat-label">All contacts</p><p className="stat-value">{loading ? "—" : cards.length}</p><p className="stat-caption">Saved in your directory</p></div>
          </article>
          <article className="surface stat-card">
            <span className="stat-icon"><Mail size={19} /></span>
            <div><p className="stat-label">Email addresses</p><p className="stat-value">{loading ? "—" : withEmail}</p><p className="stat-caption">Ready when you need them</p></div>
          </article>
          <article className="surface stat-card">
            <span className="stat-icon"><Building2 size={19} /></span>
            <div><p className="stat-label">Companies</p><p className="stat-value">{loading ? "—" : new Set(cards.map((card) => card.company?.trim().toLowerCase()).filter(Boolean)).size}</p><p className="stat-caption">Across your connections</p></div>
          </article>
        </section>

        <section className="surface export-panel" aria-labelledby="export-title">
          <div className="export-panel-copy"><span className="stat-icon"><Building2 size={19}/></span><div><h2 id="export-title" className="section-title">Your master contact register</h2><p className="section-note">Always generated from your latest saved contacts.</p></div></div>
          <ExportActions compact />
        </section>

        <section>
          <div className="section-row">
            <div><h2 className="section-title">Recently added</h2><p className="section-note">Your latest connections, all in one place.</p></div>
            {cards.length > 0 && <Link href="/cards" className="text-link">View all <ArrowRight size={15} /></Link>}
          </div>
          {loading ? (
            <div className="recent-grid" aria-label="Loading contacts">{[0,1,2].map((item) => <div key={item} className="surface contact-card" style={{height:148,background:"#fbfcfa"}} />)}</div>
          ) : recent.length ? (
            <div className="recent-grid">
              {recent.map((card) => <ContactTile key={card.id} card={card} />)}
            </div>
          ) : (
            <div className="surface empty-state">
              <span className="empty-icon"><UsersRound size={23} /></span>
              <h3>Your network starts here</h3>
              <p>Scan your first card and we’ll add it to your searchable contacts.</p>
              <Link href="/cards/new" className="button button-primary"><ScanLine size={16} /> Scan your first card</Link>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function ContactTile({ card }: { card: BusinessCard }) {
  const initials = (card.full_name || "?").split(/\s+/).slice(0,2).map((word) => word[0]).join("").toUpperCase()
  return (
    <Link href={`/cards/${card.id}`} className="surface contact-card">
      <div className="contact-card-top">
        <span className="contact-avatar">{initials}</span>
        <div style={{minWidth:0}}><h3 className="contact-name">{card.full_name || "Unnamed contact"}</h3><p className="contact-role">{card.job_title || "Contact"}</p></div>
        {card.ocr_confidence && <span title="OCR information available" style={{marginLeft:"auto",color:"#64836f"}}><Check size={16}/></span>}
      </div>
      <p className="contact-company">{card.company || "Company not listed"}</p>
      {card.email && <div className="contact-meta"><Mail size={14}/><span>{card.email}</span></div>}
    </Link>
  )
}
