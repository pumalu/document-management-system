"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ClientList } from "@/components/client-list"
import { ClientForm } from "@/components/client-form"
import { useAuth } from "@/lib/auth-context"
import { getClients } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function ClientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    const fetchClients = async () => {
      try {
        const data = await getClients({ search: searchTerm })
        setClients(data)
      } catch (error) {
        console.error("Failed to fetch clients:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load clients. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [isAdmin, router, searchTerm, toast])

  // Mock clients for demo
  const mockClients = [
    {
      id: "1",
      name: "Acme Corp",
      email: "contact@acmecorp.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      documentsCount: 12,
      createdAt: "2023-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Globex Inc",
      email: "info@globexinc.com",
      phone: "555-987-6543",
      address: "456 Tech Blvd, Innovation City, USA",
      documentsCount: 8,
      createdAt: "2023-02-20T14:45:00Z",
    },
    {
      id: "3",
      name: "Initech LLC",
      email: "support@initechllc.com",
      phone: "555-456-7890",
      address: "789 Office Park, Corporate Town, USA",
      documentsCount: 15,
      createdAt: "2023-03-10T09:15:00Z",
    },
    {
      id: "4",
      name: "Umbrella Corp",
      email: "contact@umbrellacorp.com",
      phone: "555-789-0123",
      address: "321 Science Way, Research City, USA",
      documentsCount: 6,
      createdAt: "2023-04-05T16:20:00Z",
    },
    {
      id: "5",
      name: "Stark Industries",
      email: "info@starkindustries.com",
      phone: "555-234-5678",
      address: "1 Stark Tower, New York, USA",
      documentsCount: 10,
      createdAt: "2023-05-01T11:10:00Z",
    },
  ]

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Client Management</h1>
      <p className="text-muted-foreground">Create and manage client accounts for document sharing.</p>

      <Tabs defaultValue="list" className="mt-4">
        <TabsList>
          <TabsTrigger value="list">Client List</TabsTrigger>
          <TabsTrigger value="add">Add Client</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Clients</CardTitle>
              <CardDescription>Find clients by name, email, or other information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="mt-8">Search</Button>
              </div>
            </CardContent>
          </Card>

          <ClientList clients={clients.length > 0 ? clients : mockClients} loading={loading} />
        </TabsContent>
        <TabsContent value="add" className="mt-4">
          <ClientForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

