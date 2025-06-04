"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Download,
  Copy,
  Share2,
  Palette,
  ImageIcon,
  Moon,
  Sun,
  Save,
  History,
  Trash2,
  Highlighter,
  Type,
} from "lucide-react"

interface TextHighlight {
  start: number
  end: number
  color: string
  text: string
}

interface NewsCardConfig {
  backgroundImage: string | null
  headline: string
  subtitle: string
  template: string
  primaryColor: string
  textColor: string
  fontSize: number
  position: string
  logoUrl: string | null
  overlayOpacity: number
  headlineHighlights: TextHighlight[]
  subtitleHighlights: TextHighlight[]
  highlightColor: string
}

interface SavedProject {
  id: string
  name: string
  config: NewsCardConfig
  timestamp: number
}

const templates = {
  news: {
    name: "News",
    primaryColor: "#dc2626",
    gradient: ["#dc2626", "#b91c1c"],
    accent: "#dc2626",
  },
  crypto: {
    name: "Crypto",
    primaryColor: "#7c3aed",
    gradient: ["#7c3aed", "#2563eb"],
    accent: "#7c3aed",
  },
  tech: {
    name: "Tech",
    primaryColor: "#2563eb",
    gradient: ["#2563eb", "#0891b2"],
    accent: "#2563eb",
  },
  business: {
    name: "Business",
    primaryColor: "#059669",
    gradient: ["#059669", "#10b981"],
    accent: "#059669",
  },
  breaking: {
    name: "Terkini",
    primaryColor: "#dc2626",
    gradient: ["#b91c1c", "#ea580c"],
    accent: "#dc2626",
  },
}

const highlightColors = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
]

export default function NewsCardGenerator() {
  const [isDark, setIsDark] = useState(false)
  const [config, setConfig] = useState<NewsCardConfig>({
    backgroundImage: null,
    headline: "UGM Ciptakan Sistem Inspeksi Mobil Berbasis Blockchain",
    subtitle:
      "Teknologi blockchain digunakan untuk meningkatkan transparansi dan keamanan dalam proses inspeksi kendaraan",
    template: "crypto",
    primaryColor: "#7c3aed",
    textColor: "#ffffff",
    fontSize: 48,
    position: "bottom",
    logoUrl: null,
    overlayOpacity: 70,
    headlineHighlights: [{ start: 32, end: 56, color: "#8b5cf6", text: "Mobil Berbasis Blockchain" }],
    subtitleHighlights: [],
    highlightColor: "#8b5cf6",
  })

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [activeTextArea, setActiveTextArea] = useState<"headline" | "subtitle" | null>(null)
  const [showSubtitleHighlight, setShowSubtitleHighlight] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headlineRef = useRef<HTMLTextAreaElement>(null)
  const subtitleRef = useRef<HTMLTextAreaElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Load saved projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("newsCardProjects")
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading saved projects:", error)
      }
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // Handle text selection
  const handleTextSelection = (textArea: "headline" | "subtitle") => {
    const textarea = textArea === "headline" ? headlineRef.current : subtitleRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    if (selectedText.length > 0) {
      setSelectedText(selectedText)
      setSelectionStart(start)
      setSelectionEnd(end)
      setActiveTextArea(textArea)
    }
  }

  // Add highlight to selected text
  const addHighlight = () => {
    if (!selectedText || !activeTextArea) return

    const newHighlight: TextHighlight = {
      start: selectionStart,
      end: selectionEnd,
      color: config.highlightColor,
      text: selectedText,
    }

    setConfig((prev) => ({
      ...prev,
      [activeTextArea === "headline" ? "headlineHighlights" : "subtitleHighlights"]: [
        ...prev[activeTextArea === "headline" ? "headlineHighlights" : "subtitleHighlights"],
        newHighlight,
      ].sort((a, b) => a.start - b.start),
    }))

    setSelectedText("")
    setActiveTextArea(null)
  }

  // Remove highlight
  const removeHighlight = (textArea: "headline" | "subtitle", index: number) => {
    setConfig((prev) => ({
      ...prev,
      [textArea === "headline" ? "headlineHighlights" : "subtitleHighlights"]: prev[
        textArea === "headline" ? "headlineHighlights" : "subtitleHighlights"
      ].filter((_, i) => i !== index),
    }))
  }

  // Render text with highlights for preview
  const renderHighlightedText = (text: string, highlights: TextHighlight[]) => {
    if (highlights.length === 0) return text

    const parts = []
    let lastIndex = 0

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(text.substring(lastIndex, highlight.start))
      }

      // Add highlighted text with better styling
      parts.push(
        <span
          key={index}
          className="px-1 py-0.5 rounded font-semibold"
          style={{
            backgroundColor: highlight.color + "80", // Add transparency
            color: "#ffffff",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {highlight.text}
        </span>,
      )

      lastIndex = highlight.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  // Get current template with custom primary color applied
  const getCurrentTemplate = useCallback(() => {
    const baseTemplate = templates[config.template as keyof typeof templates]
    return {
      ...baseTemplate,
      primaryColor: config.primaryColor,
      gradient: [config.primaryColor, baseTemplate.gradient[1]],
      accent: config.primaryColor,
    }
  }, [config.template, config.primaryColor])

  // Canvas rendering function that matches CSS exactly
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 1080
    const height = 1080

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    try {
      // Draw background - exactly like CSS background-size: cover
      if (config.backgroundImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = config.backgroundImage!
        })

        // Calculate cover dimensions (same as CSS background-size: cover)
        const imgAspect = img.width / img.height
        const canvasAspect = width / height

        let drawWidth, drawHeight, offsetX, offsetY

        if (imgAspect > canvasAspect) {
          // Image is wider - fit to height and crop sides
          drawHeight = height
          drawWidth = height * imgAspect
          offsetX = (width - drawWidth) / 2
          offsetY = 0
        } else {
          // Image is taller - fit to width and crop top/bottom
          drawWidth = width
          drawHeight = width / imgAspect
          offsetX = 0
          offsetY = (height - drawHeight) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, "#667eea")
        gradient.addColorStop(1, "#764ba2")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      // Draw overlay with custom primary color
      const currentTemplate = getCurrentTemplate()
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, height)

      // Convert hex to rgba for opacity
      const hexToRgba = (hex: string, alpha: number) => {
        const r = Number.parseInt(hex.slice(1, 3), 16)
        const g = Number.parseInt(hex.slice(3, 5), 16)
        const b = Number.parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }

      const opacity = config.overlayOpacity / 100
      overlayGradient.addColorStop(0, hexToRgba(currentTemplate.gradient[0], 0))
      overlayGradient.addColorStop(1, hexToRgba(currentTemplate.gradient[1], opacity))

      ctx.fillStyle = overlayGradient
      ctx.fillRect(0, 0, width, height)

      // Calculate text positioning based on config.position
      const padding = 60
      let textStartY = padding

      if (config.position === "center") {
        textStartY = height / 2 - 100
      } else if (config.position === "bottom") {
        textStartY = height - 300 // More space for larger text
      }

      // Draw logo
      if (config.logoUrl) {
        const logoImg = new Image()
        logoImg.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          logoImg.src = config.logoUrl!
        })

        const logoHeight = 60 // Slightly larger logo
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight
        ctx.drawImage(logoImg, padding, padding, logoWidth, logoHeight)
      }

      // Draw terkini news badge
      if (config.template === "breaking") {
        const badgeY = textStartY - 10
        const badgeWidth = 140
        const badgeHeight = 36

        // Badge background
        ctx.fillStyle = currentTemplate.primaryColor
        ctx.fillRect(padding, badgeY, badgeWidth, badgeHeight)

        // Badge text
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 16px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("TERKINI", padding + badgeWidth / 2, badgeY + 24)

        textStartY += 60 // Add space after badge
      }

      // Set up text styling
      ctx.textAlign = "left"
      ctx.fillStyle = config.textColor

      // Draw headline with highlights
      const maxWidth = width - padding * 2
      const scaledFontSize = config.fontSize * 1.5 // Scale up for canvas
      const lineHeight = scaledFontSize * 1.1

      ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      // Function to draw text with highlights
      const drawTextWithHighlights = (
        text: string,
        highlights: TextHighlight[],
        x: number,
        y: number,
        fontSize: number,
      ) => {
        if (highlights.length === 0) {
          // No highlights, draw normally
          const words = text.split(" ")
          const lines = []
          let currentLine = words[0]

          for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const width = ctx.measureText(currentLine + " " + word).width
            if (width < maxWidth) {
              currentLine += " " + word
            } else {
              lines.push(currentLine)
              currentLine = word
            }
          }
          lines.push(currentLine)

          lines.forEach((line, index) => {
            ctx.fillText(line, x, y + index * (fontSize * 1.1))
          })

          return lines.length * (fontSize * 1.1)
        }

        // Draw text with highlights
        let currentY = y
        const currentX = x
        let charIndex = 0
        const lineHeight = fontSize * 1.1

        // Split text into words for wrapping
        const words = text.split(" ")
        let currentLine = ""
        let lineStartIndex = 0

        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
          const word = words[wordIndex]
          const testLine = currentLine + (currentLine ? " " : "") + word
          const testWidth = ctx.measureText(testLine).width

          if (testWidth > maxWidth && currentLine) {
            // Draw current line with highlights
            drawLineWithHighlights(currentLine, lineStartIndex, currentX, currentY, highlights)

            // Move to next line
            currentY += lineHeight
            currentLine = word
            lineStartIndex = charIndex
          } else {
            currentLine = testLine
          }

          charIndex += word.length + (wordIndex < words.length - 1 ? 1 : 0)
        }

        // Draw final line
        if (currentLine) {
          drawLineWithHighlights(currentLine, lineStartIndex, currentX, currentY, highlights)
          currentY += lineHeight
        }

        return currentY - y
      }

      const drawLineWithHighlights = (
        line: string,
        lineStartIndex: number,
        x: number,
        y: number,
        highlights: TextHighlight[],
      ) => {
        let currentX = x
        const charIndex = lineStartIndex

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const globalIndex = charIndex + i

          // Check if this character is in a highlight
          const highlight = highlights.find((h) => globalIndex >= h.start && globalIndex < h.end)

          if (highlight) {
            // Draw highlight background
            const charWidth = ctx.measureText(char).width
            ctx.fillStyle = highlight.color + "80"
            ctx.fillRect(currentX - 2, y - scaledFontSize + 10, charWidth + 4, scaledFontSize + 5)

            // Draw character
            ctx.fillStyle = "#ffffff"
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
            ctx.shadowBlur = 4
            ctx.fillText(char, currentX, y)
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
          } else {
            // Draw normal character
            ctx.fillStyle = config.textColor
            ctx.fillText(char, currentX, y)
          }

          currentX += ctx.measureText(char).width
        }
      }

      // Draw headline
      let currentY = textStartY
      const headlineHeight = drawTextWithHighlights(
        config.headline,
        config.headlineHighlights,
        padding,
        currentY,
        scaledFontSize,
      )
      currentY += headlineHeight + 30

      // Draw subtitle with highlights
      if (config.subtitle) {
        const subtitleSize = scaledFontSize * 0.45 // Better proportion
        ctx.font = `${subtitleSize}px Arial, sans-serif`
        ctx.shadowBlur = 8

        drawTextWithHighlights(config.subtitle, config.subtitleHighlights, padding, currentY, subtitleSize)
      }

      // Draw accent border at bottom
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.fillStyle = currentTemplate.accent
      ctx.fillRect(0, height - 8, width, 8)
    } catch (error) {
      console.error("Error rendering canvas:", error)
    }
  }, [config, getCurrentTemplate])

  // Re-render canvas when config changes
  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Save project to localStorage
  const saveProject = useCallback(() => {
    const projectName = prompt("Enter project name:") || `Project ${Date.now()}`
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: projectName,
      config: { ...config },
      timestamp: Date.now(),
    }

    const updatedProjects = [newProject, ...savedProjects].slice(0, 10) // Keep only 10 recent
    setSavedProjects(updatedProjects)
    localStorage.setItem("newsCardProjects", JSON.stringify(updatedProjects))
    alert("Project saved successfully!")
  }, [config, savedProjects])

  // Load project from history
  const loadProject = useCallback((project: SavedProject) => {
    setConfig(project.config)
    setShowHistory(false)
  }, [])

  // Delete project from history
  const deleteProject = useCallback(
    (projectId: string) => {
      const updatedProjects = savedProjects.filter((p) => p.id !== projectId)
      setSavedProjects(updatedProjects)
      localStorage.setItem("newsCardProjects", JSON.stringify(updatedProjects))
    },
    [savedProjects],
  )

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setConfig((prev) => ({ ...prev, backgroundImage: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setConfig((prev) => ({ ...prev, logoUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setConfig((prev) => ({ ...prev, backgroundImage: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleTemplateChange = (template: string) => {
    const templateConfig = templates[template as keyof typeof templates]
    setConfig((prev) => ({
      ...prev,
      template,
      primaryColor: templateConfig.primaryColor,
    }))
  }

  const downloadImage = async (format: "png" | "jpg") => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ensure canvas is rendered before download
    await renderCanvas()

    // Small delay to ensure rendering is complete
    setTimeout(() => {
      const link = document.createElement("a")
      link.download = `news-card-${Date.now()}.${format}`
      link.href = canvas.toDataURL(`image/${format}`, format === "jpg" ? 0.9 : 1.0)
      link.click()
    }, 200)
  }

  const copyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Ensure canvas is rendered before copying
      await renderCanvas()

      setTimeout(() => {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            alert("Image copied to clipboard!")
          }
        })
      }, 200)
    } catch (err) {
      console.error("Failed to copy image:", err)
      alert("Failed to copy image to clipboard")
    }
  }

  const currentTemplate = getCurrentTemplate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              News Card Generator
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={saveProject}>
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* History Panel */}
            {showHistory && (
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Saved Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedProjects.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No saved projects yet</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {savedProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-slate-500">{new Date(project.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => loadProject(project)}>
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Text Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Headline Section with Integrated Highlighting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="headline" className="text-base font-medium flex items-center gap-2">
                      <span>Headline</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      {selectedText && activeTextArea === "headline" && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          "{selectedText}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      ref={headlineRef}
                      id="headline"
                      value={config.headline}
                      onChange={(e) => setConfig((prev) => ({ ...prev, headline: e.target.value }))}
                      onSelect={() => handleTextSelection("headline")}
                      placeholder="Enter your news headline..."
                      className="resize-none text-base pr-12"
                      rows={3}
                    />

                    {/* Inline Highlight Controls */}
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (selectedText && activeTextArea === "headline") {
                            addHighlight()
                          }
                        }}
                        disabled={!selectedText || activeTextArea !== "headline"}
                        title="Highlight selected text"
                      >
                        <Highlighter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Compact Highlight Controls */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Highlight:</Label>
                      <div className="flex gap-1">
                        {highlightColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setConfig((prev) => ({ ...prev, highlightColor: color.value }))}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              config.highlightColor === color.value
                                ? "border-slate-400 scale-110"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        <Input
                          type="color"
                          value={config.highlightColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, highlightColor: e.target.value }))}
                          className="w-6 h-6 p-0 border-2 border-slate-200 rounded-full cursor-pointer"
                          title="Custom color"
                        />
                      </div>
                    </div>

                    {selectedText && activeTextArea === "headline" && (
                      <Button onClick={addHighlight} size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">
                        Highlight
                      </Button>
                    )}
                  </div>

                  {/* Current Highlights */}
                  {config.headlineHighlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {config.headlineHighlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs text-white shadow-sm"
                          style={{ backgroundColor: highlight.color }}
                        >
                          <span className="max-w-[100px] truncate">{highlight.text}</span>
                          <button
                            onClick={() => removeHighlight("headline", index)}
                            className="hover:bg-black/20 rounded-full w-4 h-4 flex items-center justify-center"
                            title="Remove highlight"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle Section with Optional Highlighting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subtitle" className="text-base font-medium">
                      Subtitle
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">Enable highlighting</Label>
                      <input
                        type="checkbox"
                        checked={showSubtitleHighlight}
                        onChange={(e) => {
                          setShowSubtitleHighlight(e.target.checked)
                          if (!e.target.checked) {
                            setConfig((prev) => ({ ...prev, subtitleHighlights: [] }))
                            if (activeTextArea === "subtitle") {
                              setActiveTextArea(null)
                              setSelectedText("")
                            }
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      ref={subtitleRef}
                      id="subtitle"
                      value={config.subtitle}
                      onChange={(e) => setConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                      onSelect={() => showSubtitleHighlight && handleTextSelection("subtitle")}
                      placeholder="Enter subtitle or description..."
                      className="resize-none"
                      rows={2}
                    />

                    {/* Inline Highlight Controls for Subtitle */}
                    {showSubtitleHighlight && (
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            if (selectedText && activeTextArea === "subtitle") {
                              addHighlight()
                            }
                          }}
                          disabled={!selectedText || activeTextArea !== "subtitle"}
                          title="Highlight selected text"
                        >
                          <Highlighter className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Subtitle Highlight Controls */}
                  {showSubtitleHighlight && (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-slate-600 dark:text-slate-400">Highlight:</Label>
                          <div className="flex gap-1">
                            {highlightColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setConfig((prev) => ({ ...prev, highlightColor: color.value }))}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${
                                  config.highlightColor === color.value
                                    ? "border-slate-400 scale-110"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                            <Input
                              type="color"
                              value={config.highlightColor}
                              onChange={(e) => setConfig((prev) => ({ ...prev, highlightColor: e.target.value }))}
                              className="w-5 h-5 p-0 border-2 border-slate-200 rounded-full cursor-pointer"
                              title="Custom color"
                            />
                          </div>
                        </div>

                        {selectedText && activeTextArea === "subtitle" && (
                          <Button
                            onClick={addHighlight}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-xs"
                          >
                            Highlight
                          </Button>
                        )}
                      </div>

                      {/* Current Subtitle Highlights */}
                      {config.subtitleHighlights.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {config.subtitleHighlights.map((highlight, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs text-white shadow-sm"
                              style={{ backgroundColor: highlight.color }}
                            >
                              <span className="max-w-[80px] truncate">{highlight.text}</span>
                              <button
                                onClick={() => removeHighlight("subtitle", index)}
                                className="hover:bg-black/20 rounded-full w-3 h-3 flex items-center justify-center"
                                title="Remove highlight"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Background Image Upload */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105"
                        : "border-slate-300 dark:border-slate-600 hover:border-purple-400"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {config.backgroundImage ? (
                      <div className="space-y-2">
                        <img
                          src={config.backgroundImage || "/placeholder.svg"}
                          alt="Background"
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {isDragging ? "Drop image here" : "Click to change image or drag & drop new one"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload
                          className={`w-6 sm:w-8 h-6 sm:h-8 mx-auto transition-colors ${isDragging ? "text-purple-500" : "text-slate-400"}`}
                        />
                        <p
                          className={`text-sm transition-colors ${isDragging ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400"}`}
                        >
                          {isDragging ? "Drop your image here" : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo (Optional)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-purple-400"
                    }`}
                    onClick={() => logoInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)

                      const files = e.dataTransfer.files
                      if (files.length > 0) {
                        const file = files[0]
                        if (file.type.startsWith("image/")) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setConfig((prev) => ({ ...prev, logoUrl: e.target?.result as string }))
                          }
                          reader.readAsDataURL(file)
                        }
                      }
                    }}
                  >
                    {config.logoUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={config.logoUrl || "/placeholder.svg"} alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="text-sm">Click or drag to change logo</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{isDragging ? "Drop logo here" : "Upload Logo or drag & drop"}</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customization Panel */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="template" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="template">Template</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Template Style</Label>
                      <Select value={config.template} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(templates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: template.primaryColor }}
                                />
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size: {config.fontSize}px</Label>
                      <Slider
                        value={[config.fontSize]}
                        onValueChange={([value]) => setConfig((prev) => ({ ...prev, fontSize: value }))}
                        min={24}
                        max={72}
                        step={2}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Overlay Opacity: {config.overlayOpacity}%</Label>
                      <Slider
                        value={[config.overlayOpacity]}
                        onValueChange={([value]) => setConfig((prev) => ({ ...prev, overlayOpacity: value }))}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Text Position</Label>
                      <Select
                        value={config.position}
                        onValueChange={(value) => setConfig((prev) => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => downloadImage("png")} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button onClick={() => downloadImage("jpg")} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    JPG
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                  {/* Hidden Canvas for Export */}
                  <canvas ref={canvasRef} width={1080} height={1080} className="hidden" />

                  {/* Preview Display */}
                  <div
                    className="w-full h-full relative bg-cover bg-center"
                    style={{
                      backgroundImage: config.backgroundImage
                        ? `url(${config.backgroundImage})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {/* Overlay with custom primary color */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${currentTemplate.gradient[1]}${Math.round(
                          config.overlayOpacity * 2.55,
                        )
                          .toString(16)
                          .padStart(2, "0")}, ${currentTemplate.gradient[0]}00)`,
                      }}
                    />

                    {/* Logo */}
                    {config.logoUrl && (
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
                        <img
                          src={config.logoUrl || "/placeholder.svg"}
                          alt="Logo"
                          className="h-8 sm:h-12 w-auto object-contain"
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    <div
                      className={`absolute inset-0 flex flex-col justify-${
                        config.position === "top" ? "start" : config.position === "center" ? "center" : "end"
                      } p-4 sm:p-8 z-10`}
                    >
                      <div className="space-y-2 sm:space-y-4">
                        {config.template === "breaking" && (
                          <div className="inline-block">
                            <span
                              className="text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wide rounded"
                              style={{ backgroundColor: currentTemplate.primaryColor }}
                            >
                              TERKINI
                            </span>
                          </div>
                        )}

                        <h1
                          className="font-bold leading-tight text-white drop-shadow-lg"
                          style={{
                            fontSize: `${Math.min(config.fontSize * 0.7, 32)}px`,
                            color: config.textColor,
                          }}
                        >
                          {renderHighlightedText(config.headline, config.headlineHighlights)}
                        </h1>

                        {config.subtitle && (
                          <p
                            className="text-white/90 drop-shadow-md leading-relaxed"
                            style={{
                              fontSize: `${Math.min(config.fontSize * 0.3, 14)}px`,
                              color: config.textColor,
                            }}
                          >
                            {renderHighlightedText(config.subtitle, config.subtitleHighlights)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Template Accent Border */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: currentTemplate.accent }}
                    />
                  </div>
                </div>

                {/* Dimension Info */}
                <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                  1080 × 1080 px (Instagram Square)
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(templates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant={config.template === key ? "default" : "outline"}
                      onClick={() => handleTemplateChange(key)}
                      className="h-auto p-3 flex flex-col items-start gap-1"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: template.primaryColor }} />
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
