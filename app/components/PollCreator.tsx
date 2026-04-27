import { useState, useRef } from "react";

export default function PollCreator({ sendMessage }: { sendMessage: (msg: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = options.filter(opt => opt.trim() !== "");
    if (question.trim() && filteredOptions.length >= 2) {
      sendMessage({
        type: "create_poll",
        question: question.trim(),
        options: filteredOptions,
        image_url: imageUrl
      });
      setQuestion("");
      setOptions(["", ""]);
      setImageUrl(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm hover:bg-indigo-500/20 transition-all flex items-center justify-center space-x-2 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Создать опрос</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 bg-[#121214] border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Новый опрос</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Poll Image Upload */}
              <div className="flex flex-col items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                    ${imageUrl ? "border-indigo-500/50" : "border-white/10 hover:border-indigo-500/30"}
                  `}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Poll preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Добавить обложку</span>
                    </>
                  )}
                </div>
                {imageUrl && (
                  <button 
                    type="button" 
                    onClick={() => setImageUrl(null)}
                    className="mt-2 text-[10px] text-rose-400 font-bold uppercase hover:text-rose-300"
                  >
                    Удалить фото
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Вопрос</label>
                <input 
                  type="text" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="О чем хотите спросить?"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Варианты ответа</label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Вариант ${idx + 1}`}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      required={idx < 2}
                    />
                  ))}
                </div>
                {options.length < 8 && (
                  <button 
                    type="button" 
                    onClick={handleAddOption}
                    className="mt-3 text-xs text-indigo-400 font-bold hover:text-indigo-300"
                  >
                    + Добавить вариант
                  </button>
                )}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}