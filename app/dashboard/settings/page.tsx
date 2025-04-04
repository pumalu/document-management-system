"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateProfile, changePassword } from "@/lib/api"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      await updateProfile(profileForm)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
      })
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error changing your password. Please check your current password and try again.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="text-muted-foreground">Manage your account settings and change your password.</p>

      <Tabs defaultValue="profile" className="mt-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="password" className="mt-4">
          <Card>
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is using a secure password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Changing..." : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

