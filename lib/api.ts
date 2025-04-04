// This is a mock API implementation for the demo
// In a real application, these functions would make actual API calls

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createHash } from "crypto"

// Mock user data
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
    phone: "555-123-4567",
  },
  {
    id: "2",
    name: "Client User",
    email: "client@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "client",
    phone: "555-987-6543",
  },
]

// Mock JWT token handling
let currentUser = null

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-access-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret-key",
  },
})

// Helper function to simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication APIs
export const loginUser = async (email: string, password: string) => {
  await delay()

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // In a real app, we would generate and return a JWT token
  // For this demo, we'll just store the user in memory
  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  }

  return currentUser
}

export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  await delay()

  // Check if user already exists
  if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error("User with this email already exists")
  }

  // In a real app, we would save this to a database
  const newUser = {
    id: (users.length + 1).toString(),
    name: userData.name,
    email: userData.email,
    password: userData.password, // In a real app, this would be hashed
    role: "client", // New registrations are always clients
    phone: "",
  }

  users.push(newUser)

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  }
}

export const logoutUser = async () => {
  await delay()
  currentUser = null
}

export const getCurrentUser = async () => {
  await delay()
  return currentUser
}

// User profile APIs
export const updateProfile = async (profileData: { name: string; email: string; phone: string }) => {
  await delay()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // Update the user in the users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    }

    // Update current user
    currentUser = {
      ...currentUser,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    }
  }

  return currentUser
}

export const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
  await delay()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // Find the user and verify current password
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex === -1 || users[userIndex].password !== passwordData.currentPassword) {
    throw new Error("Current password is incorrect")
  }

  // Update password
  users[userIndex].password = passwordData.newPassword

  return { success: true }
}

// Document APIs
export const getDocuments = async (filters: { month?: string; year?: string; client?: string; search?: string }) => {
  await delay()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // In a real app, we would fetch documents from a database
  // For this demo, we'll return an empty array
  return []
}

export const uploadDocument = async (data: { file: File; clientId: string; month: string; year: string }) => {
  await delay()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // In a real app, we would:
  // 1. Generate a unique file name
  // 2. Encrypt the file
  // 3. Upload to S3
  // 4. Save metadata to database

  try {
    const fileName = `${data.clientId}/${data.year}/${data.month}/${Date.now()}-${data.file.name}`

    // Create a hash of the file for encryption (in a real app)
    const fileHash = createHash("sha256")
      .update(data.file.name + Date.now())
      .digest("hex")

    // In a real app, we would encrypt the file here

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "mock-bucket",
      Key: fileName,
      Body: data.file,
      ContentType: data.file.type,
      Metadata: {
        clientId: data.clientId,
        month: data.month,
        year: data.year,
        encryptionKey: fileHash, // In a real app, this would be a proper encryption key
      },
    })

    // This would actually execute in a real app
    // await s3Client.send(command)

    return {
      id: fileHash.substring(0, 8),
      name: data.file.name,
      path: fileName,
      size: data.file.size,
      type: data.file.type,
      uploadedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
  }
}

export const downloadDocument = async (documentId: string) => {
  await delay()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // In a real app, we would:
  // 1. Get document metadata from database
  // 2. Check if user has access to this document
  // 3. Generate a signed URL for download
  // 4. Return the URL

  try {
    // Get signed URL from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "mock-bucket",
      Key: `mock-path/${documentId}`,
    })

    // This would actually execute in a real app
    // const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const signedUrl = `https://example.com/download/${documentId}`

    return { url: signedUrl }
  } catch (error) {
    console.error("Error generating download URL:", error)
    throw new Error("Failed to generate download URL")
  }
}

export const deleteDocument = async (documentId: string) => {
  await delay()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // In a real app, we would:
  // 1. Get document metadata from database
  // 2. Delete from S3
  // 3. Delete metadata from database

  try {
    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "mock-bucket",
      Key: `mock-path/${documentId}`,
    })

    // This would actually execute in a real app
    // await s3Client.send(command)

    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

// Client APIs
export const getClients = async (filters: { search?: string }) => {
  await delay()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // In a real app, we would fetch clients from a database
  // For this demo, we'll return an empty array
  return []
}

export const createClient = async (clientData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
}) => {
  await delay()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }
  throw new Error("Unauthorized")

  // In a real app, we would save this to a database

  const newClient = {
    id: Date.now().toString(),
    name: clientData.name,
    email: clientData.email,
    password: clientData.password, // In a real app, this would be hashed
    phone: clientData.phone || "",
    address: clientData.address || "",
    documentsCount: 0,
    createdAt: new Date().toISOString(),
  }

  return newClient
}

export const deleteClient = async (clientId: string) => {
  await delay()

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // In a real app, we would:
  // 1. Delete client from database
  // 2. Delete all associated documents

  return { success: true }
}

// Dashboard APIs
export const getDashboardStats = async () => {
  await delay()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // In a real app, we would fetch stats from a database
  // For this demo, we'll return mock data
  return {
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
}

