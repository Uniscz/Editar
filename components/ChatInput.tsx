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
}

const aspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, onFileChange, onRemoveFile, attachedFile, isLoading, aspectRatio, onAspectRatioChange }) => {
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
          <img src={attachedFile.dataUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          <button
            type="button"
            onClick={onRemoveFile}
            className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-0.5 text-gray-400 hover:text-white hover:bg-red-600 transition-all duration-200"
            aria-label="Remove attached image"
          >
            <XCircleIcon />
          </button>
        </div>
      )}
       {!attachedFile && !isLoading && (
        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
            <span className="text-xs text-gray-400 font-medium mr-2">Aspect Ratio:</span>
            {aspectRatios.map(ratio => (
                <button
                    key={ratio}
                    type="button"
                    onClick={() => onAspectRatioChange(ratio)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                        aspectRatio === ratio
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {ratio}
                </button>
            ))}
        </div>
      )}
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow duration-200">
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
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
          placeholder={attachedFile ? "Describe the changes you want..." : "Describe the image you want to generate..."}
          className="flex-1 bg-transparent focus:outline-none resize-none px-3 text-gray-100 placeholder-gray-500"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && !attachedFile)}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Send prompt"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;