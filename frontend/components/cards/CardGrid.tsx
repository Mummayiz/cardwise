"use client"
import { BusinessCard } from "@/types"
import CardItem from "./CardItem"
export default function CardGrid({ cards }: { cards: BusinessCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">??</p>
        <p className="text-lg font-medium">No cards yet</p>
        <p className="text-sm mt-1">Scan your first business card to get started</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => <CardItem key={card.id} card={card} />)}
    </div>
  )
}

