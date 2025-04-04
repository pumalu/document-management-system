import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { connectToDatabase } from "@/lib/mongodb"
import { randomBytes } from "crypto"
import { createCipheriv, createDecipheriv } from "crypto"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Helper function to encrypt file
const encryptFile = (buffer, key, iv) => {
  const cipher = createCipheriv("aes-256-cbc", key, iv)
  return Buffer.concat([cipher.update(buffer), cipher.final()])
}

// Helper function to decrypt file
const decryptFile = (buffer, key, iv) => {
  const decipher = createDecipheriv("aes-256-cbc", key, iv)
  return Buffer.concat([decipher.update(buffer), decipher.final()])
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")

    if (!documentId) {
      // List documents
      const { db } = await connectToDatabase()

      const query = {}

      // If client user, only show their documents
      if (session.user.role === "client") {
        query.clientId = session.user.id
      } else {
        // For admin, filter by client if specified
        const clientId = searchParams.get("client")
        if (clientId) {
          query.clientId = clientId
        }
      }

      // Filter by month and year if specified
      const month = searchParams.get("month")
      const year = searchParams.get("year")

      if (month) {
        query.month = month
      }

      if (year) {
        query.year = year
      }

      // Search by name if specified
      const search = searchParams.get("search")
      if (search) {
        query.name = { $regex: search, $options: "i" }
      }

      const documents = await db.collection("documents").find(query).sort({ uploadedAt: -1 }).toArray()

      return NextResponse.json(documents)
    } else {
      // Get document download URL
      const { db } = await connectToDatabase()

      const document = await db.collection("documents").findOne({ _id: documentId })

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      // Check if user has access to this document
      if (session.user.role !== "admin" && document.clientId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Generate signed URL for download
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: document.path,
      })

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

      return NextResponse.json({ url: signedUrl })
    }
  } catch (error) {
    console.error("Error in documents API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const clientId = formData.get("clientId")
    const month = formData.get("month")
    const year = formData.get("year")

    if (!file || !clientId || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate encryption key and IV
    const encryptionKey = randomBytes(32)
    const iv = randomBytes(16)

    // Read file as buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Encrypt file
    const encryptedBuffer = encryptFile(fileBuffer, encryptionKey, iv)

    // Generate unique file name
    const fileName = `${clientId}/${year}/${month}/${Date.now()}-${file.name}`

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: encryptedBuffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Save metadata to database
    const { db } = await connectToDatabase()

    const document = {
      name: file.name,
      type: file.type,
      size: file.size,
      path: fileName,
      clientId,
      month,
      year,
      uploadedAt: new Date(),
      encryptionKey: encryptionKey.toString("hex"),
      iv: iv.toString("hex"),
      uploadedBy: session.user.id,
    }

    const result = await db.collection("documents").insertOne(document)

    return NextResponse.json({
      id: result.insertedId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: document.uploadedAt,
    })
  } catch (error) {
    console.error("Error in documents upload API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Get document from database
    const { db } = await connectToDatabase()

    const document = await db.collection("documents").findOne({ _id: documentId })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: document.path,
    })

    await s3Client.send(command)

    // Delete from database
    await db.collection("documents").deleteOne({ _id: documentId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in documents delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

