"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Eye, FileIcon, Loader2, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { downloadDocument, deleteDocument } from "@/lib/api"

interface DocumentListProps {
  documents: {
    id: string
    name: string
    type: string
    size: string
    uploadedAt: string
    client: string
  }[]
  loading: boolean
  isAdmin: boolean
}

export function DocumentList({ documents, loading, isAdmin }: DocumentListProps) {
  const { toast } = useToast()
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleDownload = async (document) => {
    setIsDownloading(true)
    try {
      await downloadDocument(document.id)
      toast({
        title: "Download started",
        description: `${document.name} is being downloaded.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading the document. Please try again.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDocument) return

    setIsDeleting(true)
    try {
      await deleteDocument(selectedDocument.id)
      toast({
        title: "Document deleted",
        description: `${selectedDocument.name} has been deleted.`,
      })
      // Would refresh documents list here in a real app
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the document. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setSelectedDocument(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 flex-col items-center justify-center gap-2">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No documents found.</p>
          {isAdmin && (
            <Button variant="outline" onClick={() => {}}>
              Upload Documents
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          {isAdmin ? "Manage documents for your clients." : "View and download your documents."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Name</div>
            <div>Client</div>
            <div>Date</div>
            <div>Size</div>
          </div>
          <div className="space-y-2">
            {documents.map((document) => (
              <div key={document.id} className="grid grid-cols-5 items-center gap-4 rounded-lg border p-3">
                <div className="col-span-2 flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{document.name}</span>
                </div>
                <div>{document.client}</div>
                <div>{new Date(document.uploadedAt).toLocaleDateString()}</div>
                <div className="flex items-center justify-between">
                  <span>{document.size}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              setSelectedDocument(document)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{selectedDocument?.name}</DialogTitle>
                            <DialogDescription>Document preview</DialogDescription>
                          </DialogHeader>
                          <div className="flex h-[400px] items-center justify-center rounded-md border">
                            <p className="text-center text-muted-foreground">Preview not available in this demo</p>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem onClick={() => handleDownload(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setSelectedDocument(document)
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the document. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

