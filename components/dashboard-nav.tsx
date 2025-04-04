"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Home, Settings, Users } from "lucide-react"

interface DashboardNavProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const isAdmin = user?.role === "admin"

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/documents",
      label: "Documents",
      icon: <FileText className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard/documents",
    },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/clients",
            label: "Clients",
            icon: <Users className="mr-2 h-4 w-4" />,
            active: pathname === "/dashboard/clients",
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <nav className="grid items-start gap-2 p-4">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={route.active ? "secondary" : "ghost"}
            className={cn("w-full justify-start", route.active ? "font-semibold" : "font-normal")}
          >
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  )
}

