import { create } from "zustand"
import { BusinessCard } from "@/types"
interface CardState {
  cards: BusinessCard[]
  selectedCard: BusinessCard | null
  searchQuery: string
  setCards: (cards: BusinessCard[]) => void
  addCard: (card: BusinessCard) => void
  updateCard: (card: BusinessCard) => void
  deleteCard: (id: number) => void
  setSelectedCard: (card: BusinessCard | null) => void
  setSearchQuery: (query: string) => void
}
export const useCardStore = create<CardState>((set) => ({
  cards: [],
  selectedCard: null,
  searchQuery: "",
  setCards: (cards) => set({ cards }),
  addCard: (card) => set((state) => ({ cards: [card, ...state.cards] })),
  updateCard: (card) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === card.id ? card : c)),
    })),
  deleteCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    })),
  setSelectedCard: (card) => set({ selectedCard: card }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
