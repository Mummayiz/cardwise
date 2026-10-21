"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { ArrowRight, ContactRound, Plus, Search, UsersRound } from "lucide-react"
import api from "@/lib/api"
import { BusinessCard } from "@/types"
import { useAuthStore } from "@/store/authStore"
import Navbar from "@/components/layout/Navbar"
import ExportActions from "@/components/exports/ExportActions"

export default function CardsPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) { router.replace("/login"); return }
    api.get<BusinessCard[]>("/cards/").then(({ data }) => setCards(data))
      .catch(() => toast.error("Couldn’t load your contacts. Please try again."))
      .finally(() => setLoading(false))
  }, [token, router])

  const filtered = useMemo(() => cards.filter((card) =>
    [card.full_name, card.company, card.job_title, card.email, card.phone, card.website]
      .some((value) => value?.toLowerCase().includes(search.trim().toLowerCase()))
  ), [cards, search])

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="page-heading">
          <div><p className="eyebrow">YOUR ADDRESS BOOK</p><h1 className="page-title">Contacts</h1><p className="page-subtitle">Every connection you’ve collected, easy to find.</p></div>
          <div className="page-heading-actions"><ExportActions compact/><Link href="/cards/new" className="button button-primary"><Plus size={17}/> Add a contact</Link></div>
        </div>
        <section className="surface" style={{padding:20}}>
          <div className="section-row" style={{alignItems:"center",marginBottom:18}}>
            <div><h2 className="section-title">All contacts <span style={{color:"#909b93",fontWeight:500}}>({loading ? "…" : filtered.length})</span></h2><p className="section-note">Search by name, company, email, or phone.</p></div>
            <div className="search-wrap"><Search size={17}/><input className="search-field" aria-label="Search contacts" placeholder="Search your contacts" value={search} onChange={(event) => setSearch(event.target.value)}/></div>
          </div>
          {loading ? <div className="recent-grid">{[0,1,2].map((item) => <div key={item} className="surface contact-card" style={{height:148,background:"#fbfcfa"}} />)}</div> : filtered.length ? (
            <div className="recent-grid">{filtered.map((card) => <ContactTile key={card.id} card={card}/>)}</div>
          ) : search ? (
            <div className="empty-state"><span className="empty-icon"><Search size={22}/></span><h3>No matches found</h3><p>Try another name, company, email, or phone number.</p><button className="button button-secondary" onClick={() => setSearch("")}>Clear search</button></div>
          ) : (
            <div className="empty-state"><span className="empty-icon"><UsersRound size={22}/></span><h3>No contacts yet</h3><p>Scan a business card to start building your professional network.</p><Link href="/cards/new" className="button button-primary"><ContactRound size={16}/> Scan a business card</Link></div>
          )}
        </section>
      </main>
    </>
  )
}

function ContactTile({ card }: { card: BusinessCard }) {
  const initials = (card.full_name || "?").split(/\s+/).slice(0,2).map((word) => word[0]).join("").toUpperCase()
  return <Link href={`/cards/${card.id}`} className="surface contact-card">
    <div className="contact-card-top"><span className="contact-avatar">{initials}</span><div style={{minWidth:0}}><h3 className="contact-name">{card.full_name || "Unnamed contact"}</h3><p className="contact-role">{card.job_title || "Contact"}</p></div><ArrowRight size={16} style={{marginLeft:"auto",color:"#9aa59d"}}/></div>
    <p className="contact-company">{card.company || "Company not listed"}</p>
    {card.email && <div className="contact-meta"><span>{card.email}</span></div>}
    {card.phone && <div className="contact-meta"><span>{card.phone}</span></div>}
  </Link>
}
