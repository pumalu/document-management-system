"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DocumentList } from "@/components/document-list"
import { DocumentUpload } from "@/components/document-upload"
import { useAuth } from "@/lib/auth-context"
import { getDocuments } from "@/lib/api"

export default function DocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedClient, setSelectedClient] = useState("")

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getDocuments({
          month: selectedMonth,
          year: selectedYear,
          client: selectedClient,
          search: searchTerm,
        })
        setDocuments(data)
      } catch (error) {
        console.error("Failed to fetch documents:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load documents. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [selectedMonth, selectedYear, selectedClient, searchTerm, toast])

  // Mock clients for demo
  const clients = [
    { id: "1", name: "Acme Corp" },
    { id: "2", name: "Globex Inc" },
    { id: "3", name: "Initech LLC" },
    { id: "4", name: "Umbrella Corp" },
    { id: "5", name: "Stark Industries" },
  ]

  // Mock documents for demo
  const mockDocuments = [
    {
      id: "1",
      name: "Financial_Report_Q2.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedAt: "2023-07-15T10:30:00Z",
      client: "Acme Corp",
    },
    {
      id: "2",
      name: "Contract_Renewal.docx",
      type: "docx",
      size: "1.8 MB",
      uploadedAt: "2023-07-12T14:45:00Z",
      client: "Globex Inc",
    },
    {
      id: "3",
      name: "Tax_Documents_2023.pdf",
      type: "pdf",
      size: "3.2 MB",
      uploadedAt: "2023-07-10T09:15:00Z",
      client: "Initech LLC",
    },
    {
      id: "4",
      name: "Meeting_Minutes.pdf",
      type: "pdf",
      size: "0.9 MB",
      uploadedAt: "2023-07-05T16:20:00Z",
      client: "Umbrella Corp",
    },
    {
      id: "5",
      name: "Project_Proposal.pptx",
      type: "pptx",
      size: "5.7 MB",
      uploadedAt: "2023-07-01T11:10:00Z",
      client: "Stark Industries",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Documents</h1>
      <p className="text-muted-foreground">
        {isAdmin ? "Manage and organize documents for your clients." : "View and download your documents."}
      </p>

      <Tabs defaultValue="browse" className="mt-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Documents</TabsTrigger>
          {isAdmin && <TabsTrigger value="upload">Upload Documents</TabsTrigger>}
        </TabsList>
        <TabsContent value="browse" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Documents</CardTitle>
              <CardDescription>Use the filters below to find specific documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString().padStart(2, "0")}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <SelectItem key={i} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <DocumentList
            documents={documents.length > 0 ? documents : mockDocuments}
            loading={loading}
            isAdmin={isAdmin}
          />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="upload" className="mt-4">
            <DocumentUpload clients={clients} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

