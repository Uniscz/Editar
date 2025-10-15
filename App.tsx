import React, { useState, useRef, useEffect } from 'https://esm.sh/react';
import { Message, MessageRole, AttachedImageFile } from './types';
import { generateOrEditImage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<AttachedImageFile | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage({ file, dataUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim() && !attachedImage) return;

    setError(null);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: MessageRole.USER,
      text: prompt,
      images: attachedImage ? [{ url: attachedImage.dataUrl }] : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const imageResults = await generateOrEditImage(prompt, attachedImage?.file, aspectRatio);
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: MessageRole.MODEL,
        images: imageResults.map(res => ({ url: res.url, text: res.text })),
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setAttachedImage(null);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 p-4 border-b border-gray-700 shadow-lg">
        <h1 className="text-xl font-bold text-center text-white">Limpa Marca Prime  eraser</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ id: 'loading', role: MessageRole.MODEL, isLoading: true }} />}
         {error && (
            <div className="flex justify-start">
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg max-w-2xl">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>
      
      <footer className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveImage}
            attachedFile={attachedImage}
            isLoading={isLoading}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;