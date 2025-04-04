import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Lock, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5" />
            <span>DocManager</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Secure Document Management for Your Business
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Safely store, organize, and share documents with your clients. Our platform provides secure access and
                  easy management for all your important files.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-lg border bg-card p-8 shadow-sm">
                  <div className="grid gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Document Organization</h3>
                        <p className="text-sm text-muted-foreground">
                          Organize documents by client and month for easy access
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Secure Access</h3>
                        <p className="text-sm text-muted-foreground">
                          Role-based permissions and encrypted file storage
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Client Management</h3>
                        <p className="text-sm text-muted-foreground">Create and manage client accounts with ease</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>DocManager</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DocManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

