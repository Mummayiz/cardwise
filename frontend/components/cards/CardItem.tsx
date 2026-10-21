"use client"
import Link from "next/link"
import { BusinessCard } from "@/types"
export default function CardItem({ card }: { card: BusinessCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{card.full_name || "Unknown"}</h3>
          <p className="text-sm text-gray-500 truncate">{card.job_title || ""}</p>
          <p className="text-sm text-blue-600 truncate">{card.company || ""}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        {card.email && <p className="truncate">? {card.email}</p>}
        {card.phone && <p className="truncate">?? {card.phone}</p>}
        {card.website && <p className="truncate">?? {card.website}</p>}
      </div>
    </Link>
  )
}

