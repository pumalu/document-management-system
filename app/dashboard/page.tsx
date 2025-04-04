"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, FolderIcon, UsersIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getDashboardStats } from "@/lib/api"

interface DashboardStats {
  totalDocuments: number
  totalClients: number
  recentDocuments: {
    id: string
    name: string
    uploadedAt: string
    size: string
  }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Fallback data if API call fails
  const fallbackStats: DashboardStats = {
    totalDocuments: 24,
    totalClients: 5,
    recentDocuments: [
      {
        id: "1",
        name: "Financial_Report_Q2.pdf",
        uploadedAt: "2023-07-15T10:30:00Z",
        size: "2.4 MB",
      },
      {
        id: "2",
        name: "Contract_Renewal.docx",
        uploadedAt: "2023-07-12T14:45:00Z",
        size: "1.8 MB",
      },
      {
        id: "3",
        name: "Tax_Documents_2023.pdf",
        uploadedAt: "2023-07-10T09:15:00Z",
        size: "3.2 MB",
      },
      {
        id: "4",
        name: "Meeting_Minutes.pdf",
        uploadedAt: "2023-07-05T16:20:00Z",
        size: "0.9 MB",
      },
    ],
  }

  const displayStats = stats || fallbackStats

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.name}! Here&apos;s an overview of your document management system.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 10) + 1} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 3) + 1} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128.5 MB</div>
            <p className="text-xs text-muted-foreground">of 5 GB (2.57%)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="mt-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Documents</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Recently uploaded or modified documents in your system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
                  <div>Name</div>
                  <div>Date</div>
                  <div>Size</div>
                </div>
                <div className="space-y-2">
                  {displayStats.recentDocuments.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-3 items-center gap-4 rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <div>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      <div>{doc.size}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent actions performed in your document management system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {[
                    {
                      action: "Document uploaded",
                      user: "You",
                      document: "Financial_Report_Q2.pdf",
                      time: "2 hours ago",
                    },
                    {
                      action: "Client added",
                      user: "You",
                      document: "Acme Corp",
                      time: "1 day ago",
                    },
                    {
                      action: "Document downloaded",
                      user: "Client: John Smith",
                      document: "Tax_Documents_2023.pdf",
                      time: "2 days ago",
                    },
                    {
                      action: "Document shared",
                      user: "You",
                      document: "Contract_Renewal.docx",
                      time: "3 days ago",
                    },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{activity.action}</p>
                        <div className="text-sm text-muted-foreground">
                          <span>{activity.user}</span> • <span>{activity.document}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

