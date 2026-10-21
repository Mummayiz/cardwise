"use client"

import { BusinessCard } from "@/types"
import { Building2, Globe2, Mail, MapPin, Phone, Link2, AtSign } from "lucide-react"

const items = [
  { label: "Email address", key: "email", icon: Mail },
  { label: "Phone number", key: "phone", icon: Phone },
  { label: "Website", key: "website", icon: Globe2 },
  { label: "Address", key: "address", icon: MapPin },
  { label: "LinkedIn", key: "linkedin", icon: Link2 },
  { label: "Twitter / X", key: "twitter", icon: AtSign },
] as const

export default function CardDetail({ card }: { card: BusinessCard }) {
  const initials = (card.full_name || "?").split(/\s+/).slice(0,2).map((word) => word[0]).join("").toUpperCase()
  return <article className="surface" style={{overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",gap:16,padding:24,background:"linear-gradient(120deg,#f3f7f1,#fff)"}}>
      <span className="contact-avatar" style={{width:60,height:60,borderRadius:18,fontSize:19}}>{initials}</span>
      <div style={{minWidth:0}}><h2 className="page-title" style={{fontSize:25}}>{card.full_name || "Unnamed contact"}</h2><p className="page-subtitle" style={{marginTop:4}}>{card.job_title || "Professional contact"}</p></div>
    </div>
    <div style={{padding:24}}>
      {card.company && <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:22,color:"#176b4c",fontSize:14,fontWeight:650}}><Building2 size={17}/>{card.company}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:21}}>
        {items.map(({label,key,icon:Icon}) => {
          const value = card[key]
          if (!value) return null
          return <div key={key} style={{display:"flex",gap:10,minWidth:0}}><span className="empty-icon" style={{width:34,height:34,margin:0,borderRadius:10,flex:"0 0 auto"}}><Icon size={16}/></span><div style={{minWidth:0}}><p className="stat-label">{label}</p><p style={{margin:"3px 0 0",fontSize:13,overflowWrap:"anywhere"}}>{value}</p></div></div>
        })}
      </div>
      {card.notes && <div style={{marginTop:23,paddingTop:18,borderTop:"1px solid #e7ebe6"}}><p className="stat-label">Notes</p><p style={{margin:"6px 0 0",fontSize:13,whiteSpace:"pre-wrap"}}>{card.notes}</p></div>}
      <div style={{marginTop:23,paddingTop:15,borderTop:"1px solid #e7ebe6",color:"#849087",fontSize:11}}>Added {new Date(card.created_at).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
  </article>
}
