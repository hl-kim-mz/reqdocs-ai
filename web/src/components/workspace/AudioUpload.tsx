'use client';

import { useState, useRef } from 'react';
import { Mic, Loader, Upload } from 'lucide-react';

interface AudioUploadProps {
  onTranscribed: (text: string) => void;
}

const ACCEPT = '.mp3,.mp4,.m4a,.wav,.webm';

export default function AudioUpload({ onTranscribed }: AudioUploadProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setFileName(file.name);
    setIsTranscribing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json() as { text?: string; error?: string };

      if (!res.ok || !data.text) {
        throw new Error(data.error ?? '변환 실패');
      }

      onTranscribed(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      ref={dropRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !isTranscribing && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
        ${isTranscribing
          ? 'border-indigo-300 bg-indigo-50 cursor-wait'
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
        disabled={isTranscribing}
      />

      {isTranscribing ? (
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-indigo-700">변환 중... {fileName}</p>
          <p className="text-xs text-slate-500">Whisper AI가 음성을 텍스트로 변환하고 있습니다</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Mic size={18} />
            <Upload size={16} />
          </div>
          <p className="text-sm font-medium text-slate-700">
            음성 파일 업로드
          </p>
          <p className="text-xs text-slate-400">
            mp3 · mp4 · m4a · wav · webm · 최대 25MB
          </p>
          {fileName && !error && (
            <p className="text-xs text-green-600 mt-1">✓ {fileName} 변환 완료</p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
