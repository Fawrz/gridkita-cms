"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliverableUploadProps {
  orderId: string;
  action: (formData: FormData) => void | Promise<void>;
}

export function DeliverableUpload({ orderId, action }: DeliverableUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const hasFiles = selectedFiles.length > 0;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center gap-2
          border-2 border-dashed rounded-lg p-8 cursor-pointer
          transition-all
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/50"}
          ${hasFiles ? "bg-muted/30 border-primary/40" : ""}
        `}
      >
        <input
          ref={inputRef}
          name="file"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {!hasFiles ? (
          <>
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Pilih atau tarik file hasil desain</p>
            <p className="text-xs text-muted-foreground">
              ZIP / FIG / PDF / PNG — maks 100MB per file
            </p>
          </>
        ) : (
          <>
            <File className="size-6 text-primary" />
            <p className="text-sm font-medium">{selectedFiles.length} file dipilih</p>
            <p className="text-xs text-muted-foreground">
              {(totalSize / 1024 / 1024).toFixed(1)} MB total
            </p>
          </>
        )}
      </div>

      {hasFiles && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              {isImageFile(file) ? (
                <div className="relative w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <File className="size-5 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB · Siap diunggah
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!hasFiles}>
        <Upload className="size-4 mr-1.5" />
        {!hasFiles ? "Pilih file terlebih dahulu" : "Upload Deliverable"}
      </Button>
    </form>
  );
}
