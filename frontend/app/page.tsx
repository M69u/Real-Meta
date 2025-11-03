"use client"

import { useEffect, useRef } from "react"
import { Camera, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (backgroundRef.current) {
        const x = e.clientX / window.innerWidth
        const y = e.clientY / window.innerHeight

        // Subtle parallax effect on the background image instead of multiple artwork pieces
        const offsetX = x * 10
        const offsetY = y * 10
        backgroundRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <main className="relative h-screen w-full overflow-hidden dark">
      {/* Museum Background Image */}
      <div
        ref={backgroundRef}
        className="art-background"
        style={{
          backgroundImage: "url('/museum-bg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center fade-in-up">
          <h1
            className="text-4xl md:text-7xl font-bold mb-2 text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            ArtScope
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full" />
        </div>

        {/* Main Scan Card */}
        <div className="scan-card p-6 md:p-12 w-full max-w-md fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Camera Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-full">
                <Camera className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Card Content */}
          <h2 className="text-xl font-bold text-center mb-2 text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Discover Stories Behind Every Monument
          </h2>

          <p className="text-center text-gray-300 mb-6 text-xs leading-relaxed">
            Point your camera at any monument to uncover its hidden history.
          </p>

          {/* CTA Button */}
          <Link href="/scan" className="block w-full">
            <button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 button-glow text-sm">
              <span>Start Scanning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
