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
        className={`relative border-[2.5px] border-dashed border-slate-900 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'bg-sky-100 shadow-[6px_6px_0px_0px_#0f172a] -translate-x-0.5 -translate-y-0.5'
            : 'bg-slate-50 hover:bg-sky-50 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5'
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">
              Click to select or drag and drop resumes
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              Supports <strong className="text-slate-950">.PDF</strong> and <strong className="text-slate-950">.TXT</strong> files up to {maxSizeMb}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border-2 border-slate-900 text-rose-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#0f172a]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="p-4 rounded-xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-900">
            <span>Selected Resumes ({selectedFiles.length})</span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-slate-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border-2 border-slate-900 text-xs shadow-[1.5px_1.5px_0px_0px_#0f172a]"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-950 block truncate">{file.name}</span>
                    <span className="text-[11px] font-bold text-slate-500">{formatBytes(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="p-1 rounded border border-slate-900 text-slate-700 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
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
