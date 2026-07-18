import {
  Utensils, Home, Car, ShoppingBag, FileText, Film, Heart, BookOpen,
  Briefcase, Gift, Wallet, PiggyBank, Plane, Coffee, Zap, Phone,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  home: Home,
  car: Car,
  "shopping-bag": ShoppingBag,
  "file-text": FileText,
  film: Film,
  heart: Heart,
  book: BookOpen,
  briefcase: Briefcase,
  gift: Gift,
  wallet: Wallet,
  "piggy-bank": PiggyBank,
  plane: Plane,
  coffee: Coffee,
  zap: Zap,
  phone: Phone,
};

/** Renders the lucide icon matching a category's stored icon name. */
export default function CategoryIcon({
  name,
  size = 18,
  className = "",
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Wallet;
  return <Icon size={size} className={className} strokeWidth={2} />;
}

export const ICON_NAMES = Object.keys(ICONS);
