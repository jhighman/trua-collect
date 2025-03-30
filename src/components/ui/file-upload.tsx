import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect?: (file: File) => void
  onFileRemove?: () => void
  accept?: string
  maxSize?: number // in bytes
  preview?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = "image/*,application/pdf",
  maxSize = 5 * 1024 * 1024, // 5MB default
  preview = true,
  className,
  ...props
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return false
    }
    if (accept) {
      const acceptedTypes = accept.split(",").map(type => type.trim())
      const fileType = file.type
      if (!acceptedTypes.some(type => {
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.replace("/*", ""))
        }
        return type === fileType
      })) {
        setError(`File type must be ${accept}`)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setFile(file)
        onFileSelect?.(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setFile(file)
        onFileSelect?.(file)
      }
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    onFileRemove?.()
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border border-dashed border-slate-200 bg-slate-50",
          error && "border-destructive"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept={accept}
          onChange={handleChange}
          {...props}
        />
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {file ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  type="button"
                >
                  Remove
                </Button>
              </div>
              {preview && file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-w-full max-h-[200px] object-contain rounded-lg"
                />
              )}
            </>
          ) : (
            <>
              <svg
                className="w-10 h-10 mb-3 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-muted-foreground">
                {accept.split(",").join(", ")}
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 