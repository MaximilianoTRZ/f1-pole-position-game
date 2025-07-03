"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DoorOpenIcon as DialogIcon } from "lucide-react"
import { Trophy, ArrowLeft, ArrowRight, Zap, Settings } from "lucide-react"

// Game constants
const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 700
const CAR_SIZE = 28
const TRACK_WIDTH = 80

// Team configurations
const TEAMS = {
  ferrari: { name: "Ferrari", color: "#DC143C", accent: "#FFFFFF", secondary: "#FFD700" },
  redbull: { name: "Red Bull Racing", color: "#1E1E3F", accent: "#FFC72C", secondary: "#FF6B6B" },
  mercedes: { name: "Mercedes-AMG", color: "#00D2BE", accent: "#C0C0C0", secondary: "#000000" },
  mclaren: { name: "McLaren", color: "#FF8700", accent: "#0078D4", secondary: "#000000" },
}

// Realistic F1 track definitions - Simple closed circuits with checkpoints
const TRACKS = {
  montecarlo: {
    name: "Montecarlo",
    country: "Monaco",
    path: [
      { x: 200, y: 200 }, // Start/Finish
      { x: 350, y: 180 },
      { x: 500, y: 200 },
      { x: 650, y: 250 },
      { x: 750, y: 350 },
      { x: 780, y: 450 },
      { x: 750, y: 550 },
      { x: 650, y: 600 },
      { x: 500, y: 620 },
      { x: 350, y: 600 },
      { x: 200, y: 550 },
      { x: 150, y: 450 },
      { x: 150, y: 350 },
      { x: 170, y: 250 },
    ],
    checkpoints: [
      { x: 500, y: 200, radius: 100 }, // Checkpoint 1 - 25% of track
      { x: 780, y: 450, radius: 100 }, // Checkpoint 2 - 50% of track
      { x: 350, y: 600, radius: 100 }, // Checkpoint 3 - 75% of track
    ],
  },
  silverstone: {
    name: "Silverstone",
    country: "Great Britain",
    path: [
      { x: 200, y: 400 }, // Start/Finish straight
      { x: 300, y: 380 }, // Approaching Copse
      { x: 400, y: 350 }, // Copse corner
      { x: 500, y: 320 }, // Exit Copse
      { x: 600, y: 280 }, // Maggotts approach
      { x: 680, y: 240 }, // Maggotts
      { x: 750, y: 200 }, // Becketts entry
      { x: 800, y: 180 }, // Becketts apex
      { x: 820, y: 220 }, // Becketts exit
      { x: 830, y: 280 }, // Chapel curve
      { x: 820, y: 340 }, // Hangar straight approach
      { x: 800, y: 400 }, // Stowe corner entry
      { x: 760, y: 450 }, // Stowe apex
      { x: 700, y: 480 }, // Stowe exit
      { x: 620, y: 500 }, // Vale approach
      { x: 540, y: 520 }, // Vale corner
      { x: 460, y: 540 }, // Club corner entry
      { x: 380, y: 560 }, // Club corner apex
      { x: 300, y: 550 }, // Club exit
      { x: 220, y: 530 }, // Abbey corner
      { x: 160, y: 490 }, // Farm curve
      { x: 140, y: 450 }, // Village corner
      { x: 150, y: 400 }, // Back to start/finish
    ],
    checkpoints: [
      { x: 750, y: 200, radius: 100 }, // Checkpoint 1 - Becketts complex (25% of track)
      { x: 760, y: 450, radius: 100 }, // Checkpoint 2 - Stowe corner (50% of track)
      { x: 300, y: 550, radius: 100 }, // Checkpoint 3 - Club corner exit (75% of track)
    ],
  },
  suzuka: {
    name: "Suzuka",
    country: "Japan",
    path: [
      // Boot-shaped circuit inspired by Italy's silhouette
      { x: 400, y: 600 }, // Start/Finish - Bottom of the boot (heel area)
      { x: 450, y: 580 }, // Moving up the heel
      { x: 500, y: 550 }, // Ankle area
      { x: 550, y: 500 }, // Lower leg
      { x: 580, y: 450 }, // Mid leg
      { x: 600, y: 400 }, // Upper leg
      { x: 620, y: 350 }, // Knee area
      { x: 640, y: 300 }, // Thigh
      { x: 650, y: 250 }, // Hip area
      { x: 660, y: 200 }, // Waist
      { x: 650, y: 150 }, // Upper torso
      { x: 620, y: 120 }, // Shoulder area
      { x: 580, y: 100 }, // Top of boot
      { x: 520, y: 90 }, // Boot top curve
      { x: 460, y: 100 }, // Boot opening
      { x: 400, y: 120 }, // Inner boot line
      { x: 350, y: 150 }, // Down the inner side
      { x: 320, y: 200 }, // Inner waist
      { x: 300, y: 250 }, // Inner hip
      { x: 290, y: 300 }, // Inner thigh
      { x: 280, y: 350 }, // Inner knee
      { x: 270, y: 400 }, // Inner upper leg
      { x: 260, y: 450 }, // Inner mid leg
      { x: 250, y: 500 }, // Inner lower leg
      { x: 240, y: 550 }, // Inner ankle
      { x: 220, y: 580 }, // Toe area start
      { x: 180, y: 590 }, // Toe tip
      { x: 150, y: 580 }, // Toe curve
      { x: 130, y: 560 }, // Toe bottom
      { x: 120, y: 530 }, // Toe side
      { x: 130, y: 500 }, // Toe back
      { x: 160, y: 480 }, // Foot arch
      { x: 200, y: 470 }, // Foot middle
      { x: 250, y: 480 }, // Foot back to ankle
      { x: 300, y: 520 }, // Back up the leg
      { x: 350, y: 570 }, // Heel connection
      { x: 400, y: 600 }, // Back to start
    ],
    checkpoints: [
      { x: 620, y: 350, radius: 120 }, // Checkpoint 1 - Knee area (25% of track)
      { x: 520, y: 90, radius: 120 }, // Checkpoint 2 - Top of boot (50% of track)
      { x: 150, y: 580, radius: 120 }, // Checkpoint 3 - Toe area (75% of track)
    ],
  },
}

interface GameState {
  isPlaying: boolean
  isPaused: boolean
  startTime: number | null
  currentTime: number
  lapCompleted: boolean
  bestTime: number | null
  hasLeftStart: boolean
  checkpointsReached: boolean[]
}

interface Car {
  x: number
  y: number
  angle: number
  speed: number
  maxSpeed: number
}

interface LeaderboardEntry {
  id: string
  driverName: string
  constructor: string
  circuit: string
  lapTime: number
  timestamp: number
}

export default function F1PolePosition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    startTime: null,
    currentTime: 0,
    lapCompleted: false,
    bestTime: null,
    hasLeftStart: false,
    checkpointsReached: [false, false, false],
  })

  // Player selections
  const [driverName, setDriverName] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<keyof typeof TEAMS>("ferrari")
  const [selectedTrack, setSelectedTrack] = useState<keyof typeof TRACKS>("montecarlo")

  // Car state
  const [car, setCar] = useState<Car>({
    x: 150,
    y: 350,
    angle: 0,
    speed: 0,
    maxSpeed: 4,
  })

  // UI state
  const [showResults, setShowResults] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [keys, setKeys] = useState({ left: false, right: false })

  // Load leaderboard on mount
  useEffect(() => {
    loadLeaderboard()
    loadBestTime()
  }, [selectedTrack])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        setKeys((prev) => ({ ...prev, left: true }))
        e.preventDefault()
      }
      if (e.code === "ArrowRight") {
        setKeys((prev) => ({ ...prev, right: true }))
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        setKeys((prev) => ({ ...prev, left: false }))
      }
      if (e.code === "ArrowRight") {
        setKeys((prev) => ({ ...prev, right: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const loadLeaderboard = async () => {
    try {
      // Try to load from MongoDB first
      const response = await fetch(`/api/leaderboard?circuit=${selectedTrack}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.times || [])
        return
      }
    } catch (error) {
      console.error("Failed to load from MongoDB:", error)
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(`f1-leaderboard-${selectedTrack}`)
      if (saved) {
        const data = JSON.parse(saved) as LeaderboardEntry[]
        const sortedData = data.sort((a, b) => a.lapTime - b.lapTime)
        setLeaderboard(sortedData)
      } else {
        setLeaderboard([])
      }
    } catch (error) {
      console.error("Failed to load local leaderboard:", error)
      setLeaderboard([])
    }
  }

  const submitToLeaderboard = async (lapTime: number) => {
    if (!driverName.trim()) return

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      driverName: driverName.trim(),
      constructor: TEAMS[selectedTeam].name,
      circuit: TRACKS[selectedTrack].name,
      lapTime,
      timestamp: Date.now(),
    }

    try {
      // Try to save to MongoDB first
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverName: newEntry.driverName,
          constructor: newEntry.constructor,
          circuit: newEntry.circuit,
          lapTime: newEntry.lapTime,
          timestamp: newEntry.timestamp,
          teamColor: TEAMS[selectedTeam].color,
        }),
      })

      if (response.ok) {
        // Reload leaderboard from MongoDB
        await loadLeaderboard()
        return
      }
    } catch (error) {
      console.error("Failed to save to MongoDB:", error)
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(`f1-leaderboard-${selectedTrack}`)
      const existingData = saved ? (JSON.parse(saved) as LeaderboardEntry[]) : []
      const updatedData = [...existingData, newEntry].sort((a, b) => a.lapTime - b.lapTime)
      const topTimes = updatedData.slice(0, 20)
      localStorage.setItem(`f1-leaderboard-${selectedTrack}`, JSON.stringify(topTimes))
      setLeaderboard(topTimes)
    } catch (error) {
      console.error("Failed to save to local leaderboard:", error)
    }
  }

  const loadBestTime = () => {
    const saved = localStorage.getItem(`f1-best-${selectedTrack}`)
    if (saved) {
      setGameState((prev) => ({ ...prev, bestTime: Number.parseFloat(saved) }))
    }
  }

  const saveBestTime = (time: number) => {
    const current = gameState.bestTime
    if (!current || time < current) {
      localStorage.setItem(`f1-best-${selectedTrack}`, time.toString())
      setGameState((prev) => ({ ...prev, bestTime: time }))
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const drawTrack = (ctx: CanvasRenderingContext2D) => {
    const track = TRACKS[selectedTrack]

    // Draw grass background with pixelated texture
    ctx.fillStyle = "#4CAF50"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Add pixelated grass texture
    ctx.fillStyle = "#45A049"
    for (let x = 0; x < CANVAS_WIDTH; x += 8) {
      for (let y = 0; y < CANVAS_HEIGHT; y += 8) {
        if (Math.random() > 0.7) {
          ctx.fillRect(x, y, 4, 4)
        }
      }
    }

    // Add some pixelated bushes/trees
    const addPixelatedBush = (x: number, y: number) => {
      ctx.fillStyle = "#2E7D32"
      ctx.fillRect(x, y, 12, 8)
      ctx.fillRect(x + 2, y - 4, 8, 4)
      ctx.fillStyle = "#1B5E20"
      ctx.fillRect(x + 4, y + 8, 4, 6)
    }

    // Add decorative bushes around the track
    addPixelatedBush(50, 100)
    addPixelatedBush(750, 150)
    addPixelatedBush(100, 550)
    addPixelatedBush(700, 500)
    addPixelatedBush(400, 50)
    addPixelatedBush(500, 600)

    // Draw outer curbs (red and white alternating)
    const drawCurbs = (path: Array<{ x: number; y: number }>, isOuter: boolean) => {
      const curbWidth = 12
      const segmentLength = 20

      for (let i = 0; i < path.length; i++) {
        const current = path[i]
        const next = path[(i + 1) % path.length]

        const dx = next.x - current.x
        const dy = next.y - current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const segments = Math.floor(distance / segmentLength)

        for (let j = 0; j < segments; j++) {
          const t = j / segments
          const x = current.x + dx * t
          const y = current.y + dy * t

          // Calculate perpendicular offset for curbs
          const angle = Math.atan2(dy, dx)
          const perpAngle = angle + Math.PI / 2
          const offset = isOuter ? TRACK_WIDTH / 2 + curbWidth / 2 : -(TRACK_WIDTH / 2 + curbWidth / 2)

          const curbX = x + Math.cos(perpAngle) * offset
          const curbY = y + Math.sin(perpAngle) * offset

          // Alternate red and white
          const isRed = Math.floor((i + j) % 2) === 0
          ctx.fillStyle = isRed ? "#FF0000" : "#FFFFFF"
          ctx.fillRect(curbX - curbWidth / 2, curbY - 4, curbWidth, 8)
        }
      }
    }

    // Draw curbs on both sides
    drawCurbs(track.path, true) // Outer curbs
    drawCurbs(track.path, false) // Inner curbs

    // Draw main track surface (medium gray)
    ctx.strokeStyle = "#B0B0B0"
    ctx.lineWidth = TRACK_WIDTH
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.moveTo(track.path[0].x, track.path[0].y)

    for (let i = 1; i < track.path.length; i++) {
      ctx.lineTo(track.path[i].x, track.path[i].y)
    }
    ctx.closePath()
    ctx.stroke()

    // Draw white dashed centerline
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 3
    ctx.setLineDash([12, 8])

    ctx.beginPath()
    ctx.moveTo(track.path[0].x, track.path[0].y)
    for (let i = 1; i < track.path.length; i++) {
      ctx.lineTo(track.path[i].x, track.path[i].y)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])

    // Draw start/finish line with checkered pattern
    const start = track.path[0]
    const next = track.path[1]
    const angle = Math.atan2(next.y - start.y, next.x - start.x)
    const perpAngle = angle + Math.PI / 2

    // Create checkered start/finish line - 50% wider and 10% longer than track width
    const checkeredWidth = TRACK_WIDTH * 1.5 // 50% wider
    const checkeredHeight = TRACK_WIDTH * 0.1 // 10% of track width for length
    const squareSize = 8

    for (let i = 0; i < checkeredWidth; i += squareSize) {
      for (let j = 0; j < checkeredHeight; j += squareSize) {
        const isWhite = (Math.floor(i / squareSize) + Math.floor(j / squareSize)) % 2 === 0
        ctx.fillStyle = isWhite ? "#FFFFFF" : "#000000"

        const offsetX = (i - checkeredWidth / 2) * Math.cos(perpAngle) - (j - checkeredHeight / 2) * Math.sin(perpAngle)
        const offsetY = (i - checkeredWidth / 2) * Math.sin(perpAngle) + (j - checkeredHeight / 2) * Math.cos(perpAngle)

        ctx.fillRect(start.x + offsetX, start.y + offsetY, squareSize, squareSize)
      }
    }

    // Draw checkpoint indicators (only for debugging - normally invisible)
    if (process.env.NODE_ENV === "development") {
      track.checkpoints.forEach((checkpoint, index) => {
        ctx.strokeStyle = gameState.checkpointsReached[index] ? "#00FF00" : "#FF0000"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(checkpoint.x, checkpoint.y, checkpoint.radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw checkpoint number
        ctx.fillStyle = gameState.checkpointsReached[index] ? "#00FF00" : "#FF0000"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`CP${index + 1}`, checkpoint.x, checkpoint.y)
      })
    }

    // Add pixelated track markers
    ctx.fillStyle = "#FFFF00"
    const markerPositions = [0.25, 0.5, 0.75]
    markerPositions.forEach((pos) => {
      const index = Math.floor(pos * track.path.length)
      const point = track.path[index]
      ctx.fillRect(point.x - 3, point.y - 3, 6, 6)
    })
  }

  const drawCar = (ctx: CanvasRenderingContext2D) => {
    const team = TEAMS[selectedTeam]

    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle)

    // Car shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(-CAR_SIZE / 2 + 2, -CAR_SIZE / 6 + 2, CAR_SIZE, CAR_SIZE / 3)

    // Main car body
    ctx.fillStyle = team.color
    ctx.fillRect(-CAR_SIZE / 2, -CAR_SIZE / 6, CAR_SIZE, CAR_SIZE / 3)

    // Car nose
    ctx.beginPath()
    ctx.moveTo(CAR_SIZE / 2, -CAR_SIZE / 8)
    ctx.lineTo(CAR_SIZE / 2 + 10, 0)
    ctx.lineTo(CAR_SIZE / 2, CAR_SIZE / 8)
    ctx.closePath()
    ctx.fill()

    // Rear wing
    ctx.fillRect(-CAR_SIZE / 2 - 6, -CAR_SIZE / 4, 8, CAR_SIZE / 2)

    // Cockpit
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(-CAR_SIZE / 6, -CAR_SIZE / 10, CAR_SIZE / 3, CAR_SIZE / 5)

    // Team accent stripes
    ctx.fillStyle = team.accent
    ctx.fillRect(-CAR_SIZE / 2 + 2, -CAR_SIZE / 8, CAR_SIZE - 4, 2)
    ctx.fillRect(-CAR_SIZE / 2 + 2, CAR_SIZE / 8 - 2, CAR_SIZE - 4, 2)

    // Secondary color details
    ctx.fillStyle = team.secondary
    ctx.fillRect(-CAR_SIZE / 4, -CAR_SIZE / 12, CAR_SIZE / 2, 2)

    // Wheels
    ctx.fillStyle = "#1a1a1a"
    // Front wheels
    ctx.fillRect(CAR_SIZE / 4, -CAR_SIZE / 3, 5, 8)
    ctx.fillRect(CAR_SIZE / 4, CAR_SIZE / 3 - 8, 5, 8)
    // Rear wheels
    ctx.fillRect(-CAR_SIZE / 3, -CAR_SIZE / 3, 5, 8)
    ctx.fillRect(-CAR_SIZE / 3, CAR_SIZE / 3 - 8, 5, 8)

    ctx.restore()
  }

  const checkCollision = (x: number, y: number): boolean => {
    const track = TRACKS[selectedTrack]
    let minDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < track.path.length; i++) {
      const p1 = track.path[i]
      const p2 = track.path[(i + 1) % track.path.length]

      const distance = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y)
      minDistance = Math.min(minDistance, distance)
    }

    return minDistance > TRACK_WIDTH / 2
  }

  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1
    const dy = y2 - y1
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)))
    const projX = x1 + t * dx
    const projY = y1 + t * dy

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
  }

  const checkCheckpoints = (x: number, y: number) => {
    const track = TRACKS[selectedTrack]
    const newCheckpointsReached = [...gameState.checkpointsReached]

    track.checkpoints.forEach((checkpoint, index) => {
      const distance = Math.sqrt((x - checkpoint.x) ** 2 + (y - checkpoint.y) ** 2)
      if (distance <= checkpoint.radius) {
        newCheckpointsReached[index] = true
      }
    })

    setGameState((prev) => ({
      ...prev,
      checkpointsReached: newCheckpointsReached,
    }))
  }

  const checkLapCompletion = (x: number, y: number): boolean => {
    const start = TRACKS[selectedTrack].path[0]
    const distance = Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2)

    if (!gameState.hasLeftStart && distance > 80) {
      setGameState((prev) => ({ ...prev, hasLeftStart: true }))
      return false
    }

    // Check if all checkpoints have been reached
    const allCheckpointsReached = gameState.checkpointsReached.every((reached) => reached)

    return distance < 40 && gameState.startTime !== null && gameState.hasLeftStart && allCheckpointsReached
  }

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return

    setCar((prevCar) => {
      const newCar = { ...prevCar }

      // Auto acceleration
      newCar.speed = Math.min(newCar.speed + 0.06, newCar.maxSpeed)

      // Steering
      if (keys.left) {
        newCar.angle -= 0.09
      }
      if (keys.right) {
        newCar.angle += 0.09
      }

      // Movement
      const newX = newCar.x + Math.cos(newCar.angle) * newCar.speed
      const newY = newCar.y + Math.sin(newCar.angle) * newCar.speed

      // Collision detection
      if (!checkCollision(newX, newY)) {
        newCar.x = newX
        newCar.y = newY

        // Check checkpoints
        checkCheckpoints(newCar.x, newCar.y)
      } else {
        newCar.speed *= 0.4
      }

      // Check lap completion
      if (checkLapCompletion(newCar.x, newCar.y) && !gameState.lapCompleted) {
        const lapTime = performance.now() - (gameState.startTime || 0)

        setGameState((prev) => ({
          ...prev,
          lapCompleted: true,
          isPlaying: false,
          currentTime: lapTime,
        }))

        saveBestTime(lapTime)
        setShowResults(true)
      }

      return newCar
    })

    // Update timer
    if (gameState.startTime) {
      setGameState((prev) => ({
        ...prev,
        currentTime: performance.now() - (gameState.startTime || 0),
      }))
    }
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.startTime,
    gameState.lapCompleted,
    gameState.checkpointsReached,
    gameState.hasLeftStart,
    keys,
  ])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    drawTrack(ctx)

    if (gameState.isPlaying || gameState.lapCompleted) {
      drawCar(ctx)
    }
  }, [gameState.isPlaying, gameState.lapCompleted, gameState.checkpointsReached, selectedTrack, selectedTeam, car])

  useEffect(() => {
    const gameLoop = () => {
      updateGame()
      render()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGame, render])

  const startRace = () => {
    if (!driverName.trim()) {
      alert("Please enter your driver name!")
      return
    }

    const track = TRACKS[selectedTrack]
    setCar({
      x: track.path[0].x,
      y: track.path[0].y,
      angle: Math.atan2(track.path[1].y - track.path[0].y, track.path[1].x - track.path[0].x),
      speed: 0,
      maxSpeed: 4,
    })

    setGameState({
      isPlaying: true,
      isPaused: false,
      startTime: performance.now(),
      currentTime: 0,
      lapCompleted: false,
      bestTime: gameState.bestTime,
      hasLeftStart: false,
      checkpointsReached: [false, false, false],
    })

    setShowResults(false)
  }

  const resetRace = () => {
    setGameState({
      isPlaying: false,
      isPaused: false,
      startTime: null,
      currentTime: 0,
      lapCompleted: false,
      bestTime: gameState.bestTime,
      hasLeftStart: false,
      checkpointsReached: [false, false, false],
    })
    setShowResults(false)
  }

  // Helper function to get team color from constructor name
  const getTeamColorFromConstructor = (constructorName: string): string => {
    const teamEntry = Object.entries(TEAMS).find(([_, team]) => team.name === constructorName)
    return teamEntry ? teamEntry[1].color : "#DC143C" // Default to Ferrari red
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* F1 Header with Timer */}
      <div className="bg-gradient-to-r from-black via-red-900 to-black border-b-2 border-red-500 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white tracking-wider">
                F<span className="text-red-500">1</span>
              </div>
              <div className="text-white font-medium">POLE POSITION</div>
            </div>

            {/* Central Timer Display */}
            <div className="flex-1 flex justify-center">
              <div className="bg-black border-2 border-red-500 rounded-lg px-8 py-3 shadow-lg">
                <div className="text-center">
                  <div className="text-xs text-red-400 font-medium mb-1">LAP TIME</div>
                  <div className="text-3xl font-mono text-white font-bold tracking-wider">
                    {formatTime(gameState.currentTime)}
                  </div>
                  {gameState.bestTime && (
                    <div className="text-xs text-gray-400 mt-1">BEST: {formatTime(gameState.bestTime)}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">QUALIFYING</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-900/50 to-black/50">
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  DRIVER SETUP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">DRIVER NAME</label>
                  <Input
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-black border-red-500/50 text-white placeholder-gray-500 focus:border-red-500"
                    disabled={gameState.isPlaying}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">CONSTRUCTOR</label>
                  <Select
                    value={selectedTeam}
                    onValueChange={(value: keyof typeof TEAMS) => setSelectedTeam(value)}
                    disabled={gameState.isPlaying}
                  >
                    <SelectTrigger className="bg-black border-red-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-red-500/50">
                      {Object.entries(TEAMS).map(([key, team]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-red-900/50">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded border border-gray-600"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="font-medium">{team.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">CIRCUIT</label>
                  <Select
                    value={selectedTrack}
                    onValueChange={(value: keyof typeof TRACKS) => setSelectedTrack(value)}
                    disabled={gameState.isPlaying}
                  >
                    <SelectTrigger className="bg-black border-red-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-red-500/50">
                      {Object.entries(TRACKS).map(([key, track]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-red-900/50">
                          <div className="flex flex-col">
                            <span className="font-medium">{track.name}</span>
                            <span className="text-xs text-gray-400">{track.country}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  {!gameState.isPlaying ? (
                    <Button
                      onClick={startRace}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold border border-red-500"
                    >
                      START QUALIFYING
                    </Button>
                  ) : (
                    <Button
                      onClick={resetRace}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      RESET
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30">
              <CardHeader className="bg-gradient-to-r from-red-900/50 to-black/50">
                <CardTitle className="text-red-400">CONTROLS</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <ArrowLeft className="w-6 h-6 text-red-400" />
                    <span className="text-sm font-medium">TURN LEFT</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <ArrowRight className="w-6 h-6 text-red-400" />
                    <span className="text-sm font-medium">TURN RIGHT</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Car accelerates automatically</p>
              </CardContent>
            </Card>
          </div>

          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-900/50 to-black/50">
                <CardTitle className="text-red-400 text-center">
                  {TRACKS[selectedTrack].name.toUpperCase()} - {TRACKS[selectedTrack].country.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full h-auto border-2 border-red-500/50 rounded-lg shadow-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-900/50 to-black/50">
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {TRACKS[selectedTrack].name.toUpperCase()} TIMES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-80 overflow-y-auto f1-scroll">
                  {leaderboard.slice(0, 10).map((entry, index) => {
                    const teamColor = getTeamColorFromConstructor(entry.constructor)
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-black to-gray-900 rounded-lg border border-red-500/20"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2"
                          style={{
                            backgroundColor: teamColor,
                            borderColor: teamColor,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{entry.driverName}</div>
                          <div className="text-xs truncate font-medium" style={{ color: teamColor }}>
                            {entry.constructor}
                          </div>
                        </div>
                        <div className="text-sm font-mono text-white font-bold">{formatTime(entry.lapTime)}</div>
                      </div>
                    )
                  })}
                  {leaderboard.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No times set yet</p>
                      <p className="text-xs">Be the first!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Dialog */}
      <DialogIcon open={showResults} onOpenChange={setShowResults}>
        {/* Dialog content here */}
      </DialogIcon>
    </div>
  )
}
