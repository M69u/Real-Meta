"use client"

import { useState, useRef } from "react"
import { Camera, Upload, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface ScanResult {
  artwork_id: number
  name: string
  artist: string
  description: string
  similarity: number
}

export default function ScanPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [usingCamera, setUsingCamera] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setUsingCamera(true)
        setError(null)
      }
    } catch (err) {
      setError("Could not access camera. Please upload an image instead.")
      console.error("Camera error:", err)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL("image/jpeg")
      setSelectedImage(imageData)
      
      // Stop camera
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
      setUsingCamera(false)
      setResult(null)
      setError(null)
    }
  }

  const handleScan = async () => {
    if (!selectedImage) return

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      // Convert base64 to blob
      const blob = await (await fetch(selectedImage)).blob()
      
      const formData = new FormData()
      formData.append("file", blob, "monument.jpg")

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${API_URL}/scan/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else if (data.message) {
        setError(data.message)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan monument. Please try again.")
      console.error("Scan error:", err)
    } finally {
      setScanning(false)
    }
  }

  return (
    <main className="min-h-screen bg-background dark">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Scan Monument
          </h1>
          <p className="text-muted-foreground">Upload or capture an image to discover monument details</p>
        </div>

        {/* Camera View */}
        {usingCamera && (
          <Card className="p-4 mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg mb-4"
            />
            <Button onClick={captureImage} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Capture Photo
            </Button>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Upload Section */}
        {!selectedImage && !usingCamera && (
          <Card className="p-8 mb-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </Button>
                <Button
                  onClick={startCamera}
                  size="lg"
                  variant="outline"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Use Camera
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Card>
        )}

        {/* Preview and Scan */}
        {selectedImage && !usingCamera && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Selected Image</h2>
              <img
                src={selectedImage}
                alt="Selected monument"
                className="w-full rounded-lg mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Scan Monument
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedImage(null)
                    setResult(null)
                    setError(null)
                  }}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </Card>

            {/* Results */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-lg">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {result && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-500/20 px-4 py-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Match Confidence</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {(result.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="text-xl font-semibold">{result.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Artist</p>
                    <p className="text-lg">{result.artist}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{result.description}</p>
                  </div>
                </div>
              )}
              {!error && !result && !scanning && (
                <p className="text-muted-foreground text-center py-8">
                  Click "Scan Monument" to identify this monument
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
