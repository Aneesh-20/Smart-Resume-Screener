import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { formatBytes } from '../../utils/formatters';

interface DropzoneProps {
  onUpload: (files: File[]) => Promise<void>;
  isLoading?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onUpload,
  isLoading = false,
  maxFiles = 10,
  maxSizeMb = 15,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const allowedExts = ['.pdf', '.txt'];

    Array.from(files).forEach((file) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMessage(`"${file.name}" is not supported. Only .pdf and .txt are allowed.`);
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMb}MB size limit.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, maxFiles);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Target */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-[2.5px] border-dashed border-stone-900 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'bg-rose-100 shadow-[6px_6px_0px_0px_#1c1917] -translate-x-0.5 -translate-y-0.5'
            : 'bg-stone-50 hover:bg-rose-50/60 shadow-[3px_3px_0px_0px_#1c1917] hover:shadow-[5px_5px_0px_0px_#1c1917] hover:-translate-x-0.5 hover:-translate-y-0.5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] flex items-center justify-center mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-stone-950">
              Click to select or drag and drop resumes
            </p>
            <p className="text-xs font-bold text-stone-600 mt-1">
              Supports <strong className="text-stone-950">.PDF</strong> and <strong className="text-stone-950">.TXT</strong> files up to {maxSizeMb}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-100 border-2 border-stone-900 text-rose-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#1c1917]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="p-4 rounded-xl bg-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_#1c1917] space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-stone-900">
            <span>Selected Resumes ({selectedFiles.length})</span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-stone-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border-2 border-stone-900 text-xs shadow-[1.5px_1.5px_0px_0px_#1c1917]"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-stone-950 block truncate">{file.name}</span>
                    <span className="text-[11px] font-bold text-stone-500">{formatBytes(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="p-1 rounded border border-stone-900 text-stone-700 hover:text-rose-700 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleUploadClick}
              isLoading={isLoading}
              size="md"
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload & Parse {selectedFiles.length} Resume{selectedFiles.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
