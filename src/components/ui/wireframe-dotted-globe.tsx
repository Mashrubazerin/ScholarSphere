"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Feature, FeatureCollection } from "geojson"

export interface GlobeDestination {
  name: string
  flag: string
  lat: number
  lng: number
  scholarships: string[]
}

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  destinations?: GlobeDestination[]
}

const DEFAULT_DESTINATIONS: GlobeDestination[] = [
  { name: "Japan", flag: "🇯🇵", lat: 36.2048, lng: 138.2529, scholarships: ["MEXT", "JASSO", "University Scholarships"] },
  { name: "Germany", flag: "🇩🇪", lat: 51.1657, lng: 10.4515, scholarships: ["DAAD", "Deutschlandstipendium", "Erasmus+"] },
  { name: "Canada", flag: "🇨🇦", lat: 56.1304, lng: -106.3468, scholarships: ["Vanier CGS", "Trudeau Foundation", "University Awards"] },
  { name: "USA", flag: "🇺🇸", lat: 37.0902, lng: -95.7129, scholarships: ["Fulbright", "Gates Cambridge", "Ivy League Scholarships"] },
]

interface MarkerPosition {
  x: number
  y: number
  visible: boolean
}

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
  destinations = DEFAULT_DESTINATIONS,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: Feature): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: Feature, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
          }
        }
      }

      return dots
    }

    interface DotData {
      lng: number
      lat: number
    }

    const allDots: DotData[] = []
    let landFeatures: FeatureCollection | undefined

    // Marker (destination) screen positions, recomputed every render — used for hover hit-testing
    const markerPositions: MarkerPosition[] = destinations.map(() => ({ x: 0, y: 0, visible: false }))
    let hoveredMarker: number | null = null

    const isPointVisible = (point: [number, number]) => {
      const center = projection.invert?.([containerWidth / 2, containerHeight / 2])
      if (!center) return false
      return d3.geoDistance(point, center) < Math.PI / 2
    }

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background) — a purple-lit radial gradient instead
      // of a flat fill, so the globe reads as aqua + purple rather than just
      // dark navy with cyan accents.
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      const oceanGradient = context.createRadialGradient(
        containerWidth / 2,
        containerHeight / 2,
        0,
        containerWidth / 2,
        containerHeight / 2,
        currentScale,
      )
      oceanGradient.addColorStop(0, "#1E1240")
      oceanGradient.addColorStop(0.6, "#140B2E")
      oceanGradient.addColorStop(1, "#0B0A1A")
      context.fillStyle = oceanGradient
      context.fill()
      context.strokeStyle = "#06B6D4"
      context.globalAlpha = 0.6
      context.lineWidth = 2 * scaleFactor
      context.stroke()
      context.globalAlpha = 1

      if (landFeatures) {
        // Draw graticule — purple, so the grid and the land outlines below read as two distinct tones instead of one flat cyan.
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#A78BFA"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.18
        context.stroke()
        context.globalAlpha = 1

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: Feature) => {
          path(feature)
        })
        context.strokeStyle = "#06B6D4"
        context.globalAlpha = 0.5
        context.lineWidth = 1 * scaleFactor
        context.stroke()
        context.globalAlpha = 1

        // Draw halftone dots — alternating aqua/purple instead of plain gray, for a richer two-tone land texture.
        allDots.forEach((dot, i) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = i % 2 === 0 ? "rgba(6, 182, 212, 0.5)" : "rgba(167, 139, 250, 0.5)"
            context.fill()
          }
        })
      }

      // Draw destination markers (country flag + scholarship pins)
      const now = performance.now()
      destinations.forEach((dest, i) => {
        const point: [number, number] = [dest.lng, dest.lat]
        const visible = isPointVisible(point)
        const projected = projection(point)

        if (!visible || !projected) {
          markerPositions[i] = { x: 0, y: 0, visible: false }
          return
        }

        markerPositions[i] = { x: projected[0], y: projected[1], visible: true }

        const isHovered = hoveredMarker === i
        const pulse = 0.5 + 0.5 * Math.sin(now / 500 + i * 1.3)
        const baseRadius = (isHovered ? 6 : 4) * scaleFactor

        // Pulsing ripple ring
        context.beginPath()
        context.arc(projected[0], projected[1], baseRadius + pulse * 5 * scaleFactor, 0, 2 * Math.PI)
        context.strokeStyle = isHovered ? "#7C3AED" : "#06B6D4"
        context.globalAlpha = 0.35 * (1 - pulse * 0.5)
        context.lineWidth = 1.5 * scaleFactor
        context.stroke()
        context.globalAlpha = 1

        // Marker dot
        context.beginPath()
        context.arc(projected[0], projected[1], baseRadius, 0, 2 * Math.PI)
        context.fillStyle = isHovered ? "#7C3AED" : "#06B6D4"
        context.shadowColor = isHovered ? "#7C3AED" : "#06B6D4"
        context.shadowBlur = isHovered ? 16 : 8
        context.fill()
        context.shadowBlur = 0
      })
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = (await response.json()) as FeatureCollection

        landFeatures.features.forEach((feature: Feature) => {
          generateDotsInPolygon(feature, 16).forEach(([lng, lat]) => {
            allDots.push({ lng, lat })
          })
        })

        render()
        setIsLoading(false)
      } catch {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    // Set up rotation and interaction
    const rotation: [number, number] = [0, 0]
    let autoRotate = true
    let isDragging = false
    const rotationDegPerSecond = 30 // was 0.5deg/frame at an assumed 60fps
    let resumeTimer: ReturnType<typeof setTimeout> | null = null

    // Inertia: velocity (deg/frame, at the 60fps baseline this decay rate was tuned for) carried from the last drag movement, decayed every call until it settles.
    let velocity = 0
    const velocityDecayPer60fpsFrame = 0.94

    // Resumes auto-rotate only after a few seconds of no interaction, instead of immediately on release — makes the globe feel like it settles rather than snapping back.
    const scheduleAutoResume = () => {
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        if (!isDragging && hoveredMarker === null) autoRotate = true
      }, 2500)
    }

    // Capped at ~30fps instead of every animation frame — this canvas redraws
    // the ocean, graticule, land outlines, and every halftone dot (can be
    // thousands of arcs) on each call, continuously, for as long as the
    // globe is mounted. At 60fps that's enough sustained main-thread work to
    // visibly stutter unrelated rAF-driven animations elsewhere on the page
    // (the custom cursor's spring physics in particular). A slow rotation
    // and a gentle marker pulse don't need 60fps to read as smooth.
    //
    // Rotation speed and inertia decay are both scaled by the real elapsed
    // time between calls (not a fixed per-call amount) so halving the call
    // rate doesn't also halve the rotation speed or stretch out how long
    // inertia takes to settle.
    const frameInterval = 1000 / 30
    let lastFrameTime = 0
    let lastElapsed = 0

    const rotate = (elapsed: number) => {
      if (elapsed - lastFrameTime < frameInterval) return
      const deltaMs = lastElapsed === 0 ? frameInterval : elapsed - lastElapsed
      lastFrameTime = elapsed
      lastElapsed = elapsed

      if (autoRotate) {
        rotation[0] += rotationDegPerSecond * (deltaMs / 1000)
        projection.rotate(rotation)
      } else if (Math.abs(velocity) > 0.01) {
        // velocity decays geometrically every 60fps-frame-equivalent; summing
        // that decay over the (now larger, since throttled) gap between
        // calls is a geometric series, not a single multiply.
        const deltaFrames60 = deltaMs / (1000 / 60)
        const decayedTotal =
          (velocity * (1 - Math.pow(velocityDecayPer60fpsFrame, deltaFrames60))) / (1 - velocityDecayPer60fpsFrame)
        rotation[0] += decayedTotal
        velocity *= Math.pow(velocityDecayPer60fpsFrame, deltaFrames60)
        projection.rotate(rotation)
      }
      render()
    }

    // Auto-rotation timer (also drives marker pulse animation every frame)
    const rotationTimer = d3.timer(rotate)

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true
      autoRotate = false
      velocity = 0
      if (resumeTimer) clearTimeout(resumeTimer)
      const startX = event.clientX
      const startY = event.clientY
      const sensitivity = 0.5
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

        velocity = moveEvent.movementX * sensitivity
        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        isDragging = false
        scheduleAutoResume()
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    // Hover detection for destination markers — surfaces flag + scholarship names
    const handlePointerMove = (event: MouseEvent) => {
      if (isDragging) return

      const rect = canvas.getBoundingClientRect()
      const mx = (event.clientX - rect.left) * (containerWidth / rect.width)
      const my = (event.clientY - rect.top) * (containerHeight / rect.height)

      let closest: number | null = null
      let closestDist = 16

      markerPositions.forEach((pos, i) => {
        if (!pos.visible) return
        const dist = Math.hypot(pos.x - mx, pos.y - my)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
      })

      if (closest !== hoveredMarker) {
        hoveredMarker = closest
        setHoveredIndex(closest)
        autoRotate = closest === null
        if (closest !== null) {
          const pos = markerPositions[closest]
          setTooltipPos({ x: pos.x, y: pos.y })
        }
        canvas.style.cursor = closest !== null ? "pointer" : "grab"
      }
    }

    const handlePointerLeave = () => {
      if (hoveredMarker !== null) {
        hoveredMarker = null
        setHoveredIndex(null)
        autoRotate = true
        canvas.style.cursor = "grab"
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handlePointerMove)
    canvas.addEventListener("mouseleave", handlePointerLeave)

    // Load the world data
    loadWorldData()

    // Cleanup
    return () => {
      rotationTimer.stop()
      if (resumeTimer) clearTimeout(resumeTimer)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handlePointerMove)
      canvas.removeEventListener("mouseleave", handlePointerLeave)
    }
  }, [width, height, destinations])

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-[#7C3AED]/20 bg-[#0B1120]/70 p-8 ${className}`}>
        <div className="text-center">
          <p className="text-[#EF4444] font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-[#94A3B8] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const hoveredDestination = hoveredIndex !== null ? destinations[hoveredIndex] : null

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl"
        style={{ maxWidth: "100%", height: "auto", cursor: "grab" }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#020617]/40">
          <span className="text-xs text-[#94A3B8]">Loading globe…</span>
        </div>
      )}

      {hoveredDestination && tooltipPos && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl border border-[#7C3AED]/30 bg-[#0B1120]/90 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, calc(-100% - 14px))",
            minWidth: 200,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{hoveredDestination.flag}</span>
            <span className="font-semibold text-white text-sm">{hoveredDestination.name}</span>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[#94A3B8]">
            Available Scholarships
          </p>
          <ul className="mt-1 space-y-0.5">
            {hoveredDestination.scholarships.map((s) => (
              <li key={s} className="text-white/90 text-xs">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-xs text-[#94A3B8] px-2 py-1 rounded-md bg-[#0B1120]/80 border border-[#7C3AED]/15">
        Drag to rotate • Hover a marker for scholarships
      </div>
    </div>
  )
}
