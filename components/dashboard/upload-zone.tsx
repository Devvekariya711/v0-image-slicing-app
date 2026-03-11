"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ACCEPTED_VIDEO_EXTENSIONS } from "@/lib/constants"
import { emit } from "@/lib/events"
import { Upload, FileVideo, CheckCircle2, XCircle } from "lucide-react"

type Status = "idle" | "uploading" | "completed" | "failed"

export function UploadZone() {
    const [status, setStatus] = useState<Status>("idle")
    const [progress, setProgress] = useState(0)
    const [fileName, setFileName] = useState("")
    const [fileSize, setFileSize] = useState("")
    const [error, setError] = useState("")
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function formatSize(bytes: number) {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
    }

    function isValidVideo(file: File): boolean {
        const ext = "." + file.name.split(".").pop()?.toLowerCase()
        return ACCEPTED_VIDEO_EXTENSIONS.includes(ext)
    }

    const handleUpload = useCallback(async (file: File) => {
        if (!isValidVideo(file)) {
            setStatus("failed")
            setError(`Invalid file type. Only video files: ${ACCEPTED_VIDEO_EXTENSIONS.join(", ")}`)
            return
        }

        setFileName(file.name)
        setFileSize(formatSize(file.size))
        setStatus("uploading")
        setProgress(0)
        setError("")

        const formData = new FormData()
        formData.append("file", file)

        try {
            const xhr = new XMLHttpRequest()
            xhr.open("POST", "/api/upload")

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    setProgress(Math.round((e.loaded / e.total) * 100))
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setStatus("completed")
                    setProgress(100)
                    emit("media:added") // Auto-refresh dashboard
                    setTimeout(() => {
                        setStatus("idle")
                        setFileName("")
                        setFileSize("")
                        setProgress(0)
                    }, 3000)
                } else {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        setStatus("failed")
                        setError(data.error || "Upload failed")
                    } catch {
                        setStatus("failed")
                        setError("Upload failed")
                    }
                }
            }

            xhr.onerror = () => {
                setStatus("failed")
                setError("Network error during upload")
            }

            xhr.send(formData)
        } catch (err) {
            setStatus("failed")
            setError(err instanceof Error ? err.message : "Upload failed")
        }
    }, [])

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    return (
        <div className="space-y-4">
            <div
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${dragOver
                        ? "border-primary bg-primary/5"
                        : status === "uploading"
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-card/50"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => status === "idle" && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_VIDEO_EXTENSIONS.join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {status === "idle" && (
                    <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                        <span className="text-sm font-medium">Drop your video here or click to browse</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            Supports: {ACCEPTED_VIDEO_EXTENSIONS.join(", ")} (max 2GB)
                        </span>
                    </div>
                )}

                {status === "uploading" && (
                    <div className="flex flex-col items-center">
                        <FileVideo className="h-10 w-10 text-primary mb-3 animate-pulse" />
                        <span className="text-sm font-medium">{fileName}</span>
                        <span className="text-xs text-muted-foreground">{fileSize}</span>
                    </div>
                )}

                {status === "completed" && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-10 w-10 text-green-400 mb-3" />
                        <span className="text-sm font-medium text-green-400">Upload complete!</span>
                        <span className="text-xs text-muted-foreground">{fileName}</span>
                    </div>
                )}

                {status === "failed" && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-10 w-10 text-destructive mb-3" />
                        <span className="text-sm font-medium text-destructive">Upload failed</span>
                        <span className="text-xs text-muted-foreground">{error}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => { e.stopPropagation(); setStatus("idle"); setError("") }}
                        >
                            Try again
                        </Button>
                    </div>
                )}
            </div>

            {status === "uploading" && (
                <div className="space-y-1.5">
                    <Progress value={progress} className="h-2" />
                    <span className="text-xs text-muted-foreground block">{progress}% uploaded</span>
                </div>
            )}
        </div>
    )
}
