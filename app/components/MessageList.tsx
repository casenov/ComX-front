import { useEffect, useRef, useState } from "react";

type Poll = {
  id: number;
  question: string;
  options: string[];
  votes: Record<string, string[]>;
  image_url?: string;
};

type Message = {
  id: number;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: string;
  user_id: string;
  reactions: Record<string, string[]>;
  reply_to?: Message;
  image_url?: string;
  poll?: Poll;
};

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "🔥", "💩"];

export default function MessageList({ 
  messages, 
  currentUserId, 
  onReply,
  onReaction,
  onVote,
  onImageClick
}: { 
  messages: Message[]; 
  currentUserId: string;
  onReply: (msg: Message) => void;
  onReaction: (msgId: number, emoji: string) => void;
  onVote: (pollId: number, optionIndex: number) => void;
  onImageClick: (url: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activePicker, setActivePicker] = useState<number | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderPoll = (msgId: number, poll: Poll) => {
    const totalVotes = Object.values(poll.votes).reduce((acc, v) => acc + v.length, 0);
    const userVotedFor = Object.entries(poll.votes).find(([_, v]) => v.includes(currentUserId))?.[0];
    const hasVoted = userVotedFor !== undefined;

    return (
      <div className="mt-4 space-y-3 w-full">
        {poll.image_url && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 h-40 group/pollimg">
            <img src={poll.image_url} alt="Poll cover" className="w-full h-full object-cover group-hover/pollimg:scale-105 transition-transform duration-700" />
          </div>
        )}
        <p className="font-bold text-lg text-white mb-4 leading-tight tracking-tight">{poll.question}</p>
        <div className="space-y-2.5">
          {poll.options.map((opt, idx) => {
            const votesForOpt = poll.votes[idx]?.length || poll.votes[String(idx)]?.length || 0;
            const percentage = totalVotes > 0 ? Math.round((votesForOpt / totalVotes) * 100) : 0;
            const isSelected = userVotedFor === String(idx);

            return (
              <button
                key={idx}
                onClick={() => onVote(poll.id, idx)}
                className={`
                  w-full relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 text-left
                  ${isSelected ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"}
                `}
              >
                {hasVoted && (
                  <div 
                    className="absolute inset-y-0 left-0 bg-indigo-500/10 transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full transition-all ${isSelected ? "bg-indigo-500 scale-125" : "bg-white/10"}`}></div>
                    <span className={isSelected ? "font-bold text-white" : "text-white/70"}>{opt}</span>
                  </div>
                  {hasVoted && totalVotes > 0 && (
                    <span className="text-indigo-400 font-black tabular-nums">{percentage}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between pt-4 px-2">
           <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-5 h-5 rounded-full border-2 border-[#0a0a0c] bg-white/5 overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+poll.id}`} alt="voter" className="w-full h-full" />
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                {totalVotes} Participants
              </p>
           </div>
           {!hasVoted && (
             <span className="text-[10px] text-indigo-400 font-black uppercase animate-pulse">Vote to see results</span>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto px-6 md:px-10 py-10 space-y-10">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-20">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-pulse"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-xl font-bold tracking-tight">Channel Initialized. No logs found.</p>
        </div>
      )}
      {messages.map((msg) => {
        const isMe = msg.user_id === currentUserId;
        const isSystem = msg.user_id === "system";

        return (
          <div 
            key={msg.id} 
            className={`flex items-end space-x-4 animate-slide-in group ${isMe ? "flex-row-reverse space-x-reverse" : "flex-row"} ${isSystem ? "justify-center !space-x-0" : ""}`}
          >
            {!isSystem && (
              <div 
                className="w-12 h-12 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 bg-white/5 shadow-xl transition-transform group-hover:scale-110 cursor-pointer"
                onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
              >
                <img src={msg.avatar} alt={msg.nickname} className="w-full h-full object-cover" />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? "items-end" : isSystem ? "items-center" : "items-start"}`}>
              {!isSystem && (
                <div className={`flex items-center space-x-3 mb-2 px-2 ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <span className="text-xs font-black text-white/90 tracking-tight">{msg.nickname}</span>
                  <span className="text-[10px] text-white/20 font-bold">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              <div className="relative group">
                {msg.reply_to && (
                  <div className={`
                    mb-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/40 truncate max-w-full italic
                    ${isMe ? "text-right border-r-4 border-r-indigo-500/50" : "text-left border-l-4 border-l-indigo-500/50"}
                  `}>
                    <span className="font-black text-[9px] uppercase tracking-widest text-indigo-400 block mb-1">Response to {msg.reply_to.nickname}</span>
                    {msg.reply_to.text}
                  </div>
                )}

                <div className={`
                  shadow-2xl relative transition-all duration-300
                  ${isMe 
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[24px] rounded-br-none hover:shadow-indigo-500/20" 
                    : isSystem 
                      ? "glass-card p-8 border-indigo-500/20 w-full max-w-lg shadow-[0_0_50px_rgba(99,102,241,0.1)]" 
                      : "bg-white/5 text-white/90 border border-white/10 rounded-[24px] rounded-bl-none hover:bg-white/[0.08]"}
                    ${activeMessageId === msg.id ? "ring-2 ring-indigo-500/50" : ""}
                  `}
                  onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                >
                  {msg.image_url && (
                    <div className="p-1.5">
                      <img 
                        src={msg.image_url} 
                        alt="Shared" 
                        className="max-w-full max-h-[500px] object-cover cursor-zoom-in rounded-[18px] hover:brightness-110 transition-all duration-500"
                        onClick={() => onImageClick(msg.image_url!)}
                      />
                    </div>
                  )}
                  {msg.text && (
                    <div className="px-6 py-4">
                      <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap tracking-tight font-medium">{msg.text}</p>
                    </div>
                  )}
                  {msg.poll && renderPoll(msg.id, msg.poll)}
                </div>

                {/* Actions */}
                {!isSystem && (
                  <div className={`
                    absolute top-0 flex items-center space-x-2 transition-all duration-300 z-20
                    ${isMe ? "right-0 translate-x-0 md:-left-28" : "left-0 translate-x-0 md:-right-28"}
                    ${activeMessageId === msg.id ? "opacity-100 -top-14" : "opacity-0 pointer-events-none group-hover:opacity-100 md:group-hover:-top-2 md:group-hover:pointer-events-auto"}
                  `}>
                    <button 
                      onClick={() => onReply(msg)}
                      className="p-3 rounded-2xl glass-card text-white/60 hover:text-white hover:border-indigo-500/50 transition-all scale-90 hover:scale-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setActivePicker(activePicker === msg.id ? null : msg.id)}
                        className="p-3 rounded-2xl glass-card text-white/60 hover:text-white hover:border-indigo-500/50 transition-all scale-90 hover:scale-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      
                      {activePicker === msg.id && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 glass-card p-2 flex space-x-2 animate-scale-up shadow-3xl">
                          {COMMON_EMOJIS.map(emoji => (
                            <button 
                              key={emoji}
                              onClick={() => { onReaction(msg.id, emoji); setActivePicker(null); }}
                              className="text-xl hover:scale-150 transition-transform p-2 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reactions display */}
              {!isSystem && Object.keys(msg.reactions).length > 0 && (
                <div className={`flex flex-wrap gap-2 mt-3 ${isMe ? "justify-end" : "justify-start"}`}>
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => onReaction(msg.id, emoji)}
                      className={`
                        flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-black border transition-all
                        ${users.includes(currentUserId) 
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"}
                      `}
                    >
                      <span>{emoji}</span>
                      <span className="tabular-nums">{users.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}