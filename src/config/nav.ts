import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Map, BookOpen, Image as ImageIcon, Settings, Users, IndianRupee, Package as PackageIcon, ClipboardCheck, Search, UserCircle, Layers, Building2 } from 'lucide-react'

export interface NavLink {
  href: string
  label: string
}

export const publicNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Tours' },
  { href: '/packages', label: 'Packages' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
]

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

// Adding a new admin section is a one-line addition here — the sidebar,
// active-state highlighting, and mobile menu all pick it up automatically.
export const adminNavItems: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tours', label: 'Tours', icon: Map },
  { href: '/admin/packages', label: 'Packages', icon: PackageIcon },
  { href: '/admin/registrations', label: 'Registrations', icon: ClipboardCheck },
  { href: '/admin/customers', label: 'Customers', icon: Search },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
  { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { href: '/admin/passengers', label: 'Passengers', icon: Users },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/cms', label: 'Website CMS', icon: Layers },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]
