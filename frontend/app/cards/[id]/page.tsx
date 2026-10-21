"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import api from "@/lib/api"
import { BusinessCard } from "@/types"
import { useAuthStore } from "@/store/authStore"
import Navbar from "@/components/layout/Navbar"
import CardDetail from "@/components/cards/CardDetail"
import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
export default function CardPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [card, setCard] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) { router.push("/login"); return }
    api.get(`/cards/${id}`).then((res) => setCard(res.data))
      .catch(() => toast.error("Card not found"))
      .finally(() => setLoading(false))
  }, [id, token, router])
  const handleDelete = async () => {
    if (!confirm("Delete this card?")) return
    try {
      await api.delete(`/cards/${id}`)
      toast.success("Contact deleted")
      router.push("/cards")
    } catch { toast.error("Couldn’t delete this contact. Please try again.") }
  }
  return (
    <>
      <Navbar />
      <main className="page-shell" style={{maxWidth:900}}>
        <Link href="/cards" className="text-link" style={{marginBottom:22}}><ArrowLeft size={16}/> Back to contacts</Link>
        <div className="page-heading" style={{marginTop:14}}><div><p className="eyebrow">CONTACT PROFILE</p><h1 className="page-title">Contact details</h1></div></div>
        {loading ? <div className="surface empty-state"><p>Loading contact…</p></div> : card ? (
          <>
            <CardDetail card={card} />
            <button onClick={handleDelete} className="button button-secondary" style={{marginTop:15,color:"#b94b48"}}>
              <Trash2 size={16}/> Delete contact
            </button>
          </>
        ) : <p className="text-gray-400">Card not found.</p>}
      </main>
    </>
  )
}
