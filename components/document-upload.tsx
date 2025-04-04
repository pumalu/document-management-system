"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { uploadDocument } from "@/lib/api"

interface DocumentUploadProps {
  clients: {
    id: string
    name: string
  }[]
}

export function DocumentUpload({ clients }: DocumentUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedClient || !selectedMonth || !selectedYear) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a client, month, year, and file to upload.",
      })
      return
    }

    setIsUploading(true)
    try {
      await uploadDocument({
        file: selectedFile,
        clientId: selectedClient,
        month: selectedMonth,
        year: selectedYear,
      })

      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been uploaded successfully.`,
      })

      // Reset form
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading the document. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload documents for your clients. Files will be securely stored and accessible to the selected client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Document</Label>
          <div className="flex items-center gap-4">
            <Input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} className="flex-1" />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

