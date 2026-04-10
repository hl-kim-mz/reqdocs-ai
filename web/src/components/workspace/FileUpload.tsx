'use client';

import { useState, useRef } from 'react';
import { FileText, Loader, Upload } from 'lucide-react';

interface FileUploadProps {
  onExtracted: (text: string) => void;
}

const ACCEPT = '.txt,.md,.pdf,.docx';

export default function FileUpload({ onExtracted }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setFileName(file.name);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json() as { text?: string; error?: string };

      if (!res.ok || !data.text) {
        throw new Error(data.error ?? '추출 실패');
      }

      onExtracted(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
        ${isProcessing
          ? 'border-violet-300 bg-violet-50 cursor-wait'
          : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-6 h-6 text-violet-600 animate-spin" />
          <p className="text-sm font-medium text-violet-700">추출 중... {fileName}</p>
          <p className="text-xs text-slate-500">파일에서 텍스트를 읽고 있습니다</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText size={18} />
            <Upload size={16} />
          </div>
          <p className="text-sm font-medium text-slate-700">문서 파일 업로드</p>
          <p className="text-xs text-slate-400">txt · md · pdf · docx · 최대 10MB</p>
          {fileName && !error && (
            <p className="text-xs text-green-600 mt-1">✓ {fileName} 추출 완료</p>
          )}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
