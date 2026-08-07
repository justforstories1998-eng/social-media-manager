import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM dd, yyyy")
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM dd, yyyy 'at' HH:mm")
}

export const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const platforms = [
  { id: "instagram", name: "Instagram", color: "#E1306C", icon: "📷" },
  { id: "facebook", name: "Facebook", color: "#1877F2", icon: "📘" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: "💼" },
  { id: "x", name: "X (Twitter)", color: "#000000", icon: "𝕏" },
  { id: "tiktok", name: "TikTok", color: "#000000", icon: "🎵" },
  { id: "pinterest", name: "Pinterest", color: "#E60023", icon: "📌" },
]

export const postTypes = [
  "Product Promotion", "Educational", "Festival", "Trending", "FAQ", "Story", "Reel", "Carousel"
]