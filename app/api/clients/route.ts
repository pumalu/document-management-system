import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { hash } from "bcryptjs"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("id")

    if (!clientId) {
      // List clients
      const { db } = await connectToDatabase()

      const query = { role: "client" }

      // Search by name or email if specified
      const search = searchParams.get("search")
      if (search) {
        query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
      }

      const clients = await db.collection("users").find(query).sort({ createdAt: -1 }).toArray()

      // Get document counts for each client
      const clientsWithDocumentCounts = await Promise.all(
        clients.map(async (client) => {
          const documentsCount = await db.collection("documents").countDocuments({
            clientId: client._id.toString(),
          })

          return {
            id: client._id.toString(),
            name: client.name,
            email: client.email,
            phone: client.phone || "",
            address: client.address || "",
            documentsCount,
            createdAt: client.createdAt,
          }
        }),
      )

      return NextResponse.json(clientsWithDocumentCounts)
    } else {
      // Get client details
      const { db } = await connectToDatabase()

      const client = await db.collection("users").findOne({ _id: clientId, role: "client" })

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const documentsCount = await db.collection("documents").countDocuments({
        clientId: client._id.toString(),
      })

      return NextResponse.json({
        id: client._id.toString(),
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        documentsCount,
        createdAt: client.createdAt,
      })
    }
  } catch (error) {
    console.error("Error in clients API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, phone, address } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const { db } = await connectToDatabase()

    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create client
    const client = {
      name,
      email,
      password: hashedPassword,
      role: "client",
      phone: phone || "",
      address: address || "",
      createdAt: new Date(),
      createdBy: session.user.id,
    }

    const result = await db.collection("users").insertOne(client)

    return NextResponse.json({
      id: result.insertedId,
      name,
      email,
      role: "client",
      phone: phone || "",
      address: address || "",
      createdAt: client.createdAt,
    })
  } catch (error) {
    console.error("Error in clients create API:", error)
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
    const clientId = searchParams.get("id")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Delete client
    const result = await db.collection("users").deleteOne({ _id: clientId, role: "client" })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Delete all client documents from S3 and database
    // This would be done in a real application

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in clients delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

