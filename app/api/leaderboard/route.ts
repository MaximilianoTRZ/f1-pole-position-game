import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = "mongodb+srv://maximilianoriverozuin:AUWCsdH7Y5BzRsoK@f1-pole-position-game.qs6p8w3.mongodb.net/"
const DB_NAME = "f1-pole-position"
const COLLECTION_NAME = "lap-times"

let client: MongoClient | null = null

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client.db(DB_NAME)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const circuit = searchParams.get("circuit")

    if (!circuit) {
      return NextResponse.json({ error: "Circuit parameter is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection(COLLECTION_NAME)

    // Get top 20 times for the circuit, sorted by lap time (fastest first)
    const times = await collection.find({ circuit }).sort({ lapTime: 1 }).limit(20).toArray()

    // Convert MongoDB _id to string id for frontend compatibility
    const formattedTimes = times.map((time) => ({
      id: time._id.toString(),
      driverName: time.driverName,
      constructor: time.constructor,
      circuit: time.circuit,
      lapTime: time.lapTime,
      timestamp: time.timestamp,
      teamColor: time.teamColor,
    }))

    return NextResponse.json({ times: formattedTimes })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverName, constructor, circuit, lapTime, timestamp, teamColor } = body

    if (!driverName || !constructor || !circuit || !lapTime || !timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection(COLLECTION_NAME)

    // Insert the new lap time
    const result = await collection.insertOne({
      driverName,
      constructor,
      circuit,
      lapTime,
      timestamp,
      teamColor: teamColor || "#DC143C", // Default to Ferrari red
      createdAt: new Date(),
    })

    // Clean up: keep only top 50 times per circuit to prevent database bloat
    const allTimes = await collection.find({ circuit }).sort({ lapTime: 1 }).toArray()

    if (allTimes.length > 50) {
      const timesToDelete = allTimes.slice(50)
      const idsToDelete = timesToDelete.map((time) => time._id)
      await collection.deleteMany({ _id: { $in: idsToDelete } })
    }

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving lap time:", error)
    return NextResponse.json({ error: "Failed to save lap time" }, { status: 500 })
  }
}
