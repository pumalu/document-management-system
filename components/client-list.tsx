"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Eye, FileText, Loader2, MoreHorizontal, Pencil, Trash, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteClient } from "@/lib/api"

interface ClientListProps {
  clients: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    documentsCount: number
    createdAt: string
  }[]
  loading: boolean
}

export function ClientList({ clients, loading }: ClientListProps) {
  const { toast } = useToast()
  const [selectedClient, setSelectedClient] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleDelete = async () => {
    if (!selectedClient) return

    setIsDeleting(true)
    try {
      await deleteClient(selectedClient.id)
      toast({
        title: "Client deleted",
        description: `${selectedClient.name} has been deleted.`,
      })
      // Would refresh clients list here in a real app
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the client. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setSelectedClient(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 flex-col items-center justify-center gap-2">
          <User className="h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No clients found.</p>
          <Button variant="outline" onClick={() => {}}>
            Add Client
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-5 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Name</div>
            <div>Email</div>
            <div>Documents</div>
            <div>Created</div>
          </div>
          <div className="space-y-2">
            {clients.map((client) => (
              <div key={client.id} className="grid grid-cols-5 items-center gap-4 rounded-lg border p-3">
                <div className="col-span-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{client.name}</span>
                </div>
                <div>{client.email}</div>
                <div>{client.documentsCount}</div>
                <div className="flex items-center justify-between">
                  <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              setSelectedClient(client)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Client Details</DialogTitle>
                            <DialogDescription>Detailed information about {selectedClient?.name}</DialogDescription>
                          </DialogHeader>
                          {selectedClient && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <div className="col-span-3">{selectedClient.name}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <div className="col-span-3">{selectedClient.email}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Phone</Label>
                                <div className="col-span-3">{selectedClient.phone}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Address</Label>
                                <div className="col-span-3">{selectedClient.address}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Documents</Label>
                                <div className="col-span-3">{selectedClient.documentsCount}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Created</Label>
                                <div className="col-span-3">
                                  {new Date(selectedClient.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault()
                              setSelectedClient(client)
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
                              This will permanently delete the client and all associated documents. This action cannot
                              be undone.
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

const Label = ({ className, children }) => <div className={`text-sm font-medium ${className}`}>{children}</div>

