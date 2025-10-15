import React, { useState, useRef } from 'https://esm.sh/react';
import { PaperclipIcon, SendIcon, XCircleIcon } from './icons';
import { AttachedImageFile } from '../types';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
  attachedFile: AttachedImageFile | null;
  isLoading: boolean;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
}

const aspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const scales = [
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
  { label: '3×', value: 3 }
];

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  onFileChange, 
  onRemoveFile, 
  attachedFile, 
  isLoading, 
  aspectRatio, 
  onAspectRatioChange,
  scale,
  onScaleChange
}) => {
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || attachedFile) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
    // Reset file input value to allow re-selecting the same file
    e.target.value = '';
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {attachedFile && (
        <div className="relative w-28 h-28 group">
          <img src={attachedFile.dataUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" />
          <button
            type="button"
            onClick={onRemoveFile}
            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-0.5 text-gray-600 hover:text-red-600 hover:border-red-600 transition-all duration-200 shadow-sm"
            aria-label="Remove attached image"
          >
            <XCircleIcon />
          </button>
        </div>
      )}
      {!attachedFile && !isLoading && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-medium mr-2">Proporção:</span>
            {aspectRatios.map(ratio => (
              <button
                key={ratio}
                type="button"
                onClick={() => onAspectRatioChange(ratio)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm ${
                  aspectRatio === ratio
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-medium mr-2">Escala:</span>
            {scales.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => onScaleChange(s.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm ${
                  scale === s.value
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-gray-900 transition-shadow duration-200 shadow-sm">
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={isLoading}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
          aria-label="Attach an image"
        >
          <PaperclipIcon />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
          }}
          placeholder={attachedFile ? "Descreva as mudanças que você quer..." : "Descreva a imagem que você quer gerar..."}
          className="flex-1 bg-transparent focus:outline-none resize-none px-3 text-gray-900 placeholder-gray-400"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && !attachedFile)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          aria-label="Send prompt"
        >
          {isLoading ? 'Processando...' : <SendIcon />}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

