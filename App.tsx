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
  const [scale, setScale] = useState(1);
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
      const imageResults = await generateOrEditImage(prompt, attachedImage?.file, aspectRatio, scale);
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
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      <header className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Anistia 2.0</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ id: 'loading', role: MessageRole.MODEL, isLoading: true }} />}
         {error && (
            <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg max-w-2xl shadow-sm">
                    <p className="font-bold">Erro</p>
                    <p>{error}</p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>
      
      <footer className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveImage}
            attachedFile={attachedImage}
            isLoading={isLoading}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            scale={scale}
            onScaleChange={setScale}
          />
          <div className="text-center mt-3">
            <p className="text-sm text-gray-500" style={{ fontSize: '14px' }}>
              Siga-me no TikTok{' '}
              <a href="https://www.tiktok.com/@euinelegivel" target="_blank" rel="noopener noreferrer" className="hover:underline">
                @euinelegivel
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

