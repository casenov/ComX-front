import { useState, useRef } from "react";

export default function MessageInput({ 
  onSend, 
  onTyping 
}: { 
  onSend: (text: string, image_url?: string) => void;
  onTyping: () => void;
}) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || imageUrl) {
      onSend(text, imageUrl || undefined);
      setText("");
      setImageUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:p-10 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {imageUrl && (
          <div className="mb-4 inline-block animate-scale-up">
            <div className="relative group">
              <img src={imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-[24px] border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
              <button 
                onClick={() => setImageUrl(null)}
                className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-xl p-2 shadow-xl hover:bg-rose-600 hover:scale-110 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-5 rounded-[24px] glass-card text-white/40 hover:text-indigo-400 hover:border-indigo-500/50 transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[24px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input 
              type="text" 
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onTyping();
              }}
              placeholder="Start typing your encrypted transmission..." 
              className="relative w-full glass-card px-8 py-5 text-base md:text-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={!text.trim() && !imageUrl}
            className="p-5 rounded-[24px] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-20 disabled:scale-100 disabled:shadow-none transition-all flex-shrink-0 font-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
