"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import UserList from "./components/UserList";
import PollCreator from "./components/PollCreator";
import LoadingScreen from "./components/LoadingScreen";

type Poll = {
  id: number;
  question: string;
  options: string[];
  votes: Record<string, string[]>;
  image_url?: string;
};

type Message = {
  id: number;
  user_id: string;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions: Record<string, string[]>;
  reply_to?: Message;
  image_url?: string;
  poll?: Poll;
};

type User = {
  user_id: string;
  nickname: string;
  avatar: string;
  is_typing?: boolean;
};

export default function Home() {
  const [user, setUser] = useState<{ id: string; nickname: string; avatar: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use 127.0.0.1 to avoid localhost issues on Windows
  const { isConnected, sendMessage, lastMessage } = useWebSocket("ws://127.0.0.1:8000/ws");
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "init":
        setUser({
          id: lastMessage.user_id,
          nickname: lastMessage.nickname,
          avatar: lastMessage.avatar,
        });
        setMessages(lastMessage.messages || []);
        setUsers(lastMessage.users || []);
        break;
      case "new_message":
        setMessages((prev) => {
          if (prev.some(m => m.id === lastMessage.message.id)) return prev;
          return [...prev, lastMessage.message];
        });
        break;
      case "user_joined":
        setUsers((prev) => {
          const exists = prev.some(u => u.user_id === lastMessage.user.user_id);
          if (exists) {
            return prev.map(u => u.user_id === lastMessage.user.user_id ? lastMessage.user : u);
          }
          return [...prev, lastMessage.user];
        });
        break;
      case "user_left":
        setUsers((prev) => prev.filter((u) => u.user_id !== lastMessage.user_id));
        break;
      case "user_typing":
        setUsers((prev) => 
          prev.map((u) => u.user_id === lastMessage.user_id ? { ...u, is_typing: lastMessage.is_typing } : u)
        );
        break;
      case "update_reactions":
        setMessages((prev) => 
          prev.map((m) => m.id === lastMessage.message_id ? { ...m, reactions: lastMessage.reactions } : m)
        );
        break;
      case "update_poll":
        setMessages((prev) => 
          prev.map((m) => m.id === lastMessage.message_id ? { ...m, poll: lastMessage.poll } : m)
        );
        break;
      case "error":
        alert(lastMessage.message);
        break;
      case "user_changed_nick":
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === lastMessage.user_id ? { ...u, nickname: lastMessage.new_nick } : u
          )
        );
        if (user?.id === lastMessage.user_id) {
          setUser((u) => u && { ...u, nickname: lastMessage.new_nick });
        }
        break;
      case "user_changed_avatar":
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === lastMessage.user_id ? { ...u, avatar: lastMessage.new_avatar } : u
          )
        );
        if (user?.id === lastMessage.user_id) {
          setUser((u) => u && { ...u, avatar: lastMessage.new_avatar });
        }
        break;
    }
  }, [lastMessage, user?.id]);

  const handleSendMessage = (text: string, image_url?: string) => {
    if (text.trim() || image_url) {
      sendMessage({ 
        type: "message", 
        text, 
        reply_to_id: replyingTo?.id,
        image_url
      });
      setReplyingTo(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendMessage({ type: "typing", is_typing: false });
      }
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    else sendMessage({ type: "typing", is_typing: true });

    typingTimeoutRef.current = setTimeout(() => {
      sendMessage({ type: "typing", is_typing: false });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleAddReaction = (messageId: number, emoji: string) => {
    sendMessage({ type: "add_reaction", message_id: messageId, emoji });
  };

  const handleVote = (pollId: number, optionIndex: number) => {
    sendMessage({ type: "vote_poll", poll_id: pollId, option_index: optionIndex });
  };

  const handleChangeNick = () => {
    const newNick = prompt("Введите новый ник:", user?.nickname);
    if (newNick && newNick.trim()) {
      sendMessage({ type: "change_nick", nickname: newNick.trim() });
    }
  };

  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  return (
    <div className="flex h-screen bg-mesh text-white/90 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 glass border-r border-white/5 flex flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black tracking-tighter text-gradient">COMX_SYSTEM</h1>
            <button 
              className="md:hidden text-white/40 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="glass-card p-6 flex flex-col items-center glow-indigo">
            <div className="relative group cursor-pointer mb-4" onClick={handleChangeNick}>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/30 p-1 group-hover:border-indigo-500/80 transition-all duration-500 rotate-3 group-hover:rotate-0">
                <img src={user?.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-lg p-1.5 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-xl text-white mb-1 truncate w-full text-center tracking-tight">{user?.nickname}</p>
            <div className="flex items-center space-x-2 opacity-40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">Active Session</span>
            </div>
          </div>
        </div>

        <UserList users={users} currentUserId={user?.id || ""} />
        
        <div className="p-6 border-t border-white/5 bg-black/20">
           <PollCreator sendMessage={sendMessage} />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col w-full relative">
        <header className="h-20 flex items-center justify-between px-6 md:px-10 glass border-b border-white/5 z-30">
          <div className="flex items-center space-x-6">
            <button 
              className="md:hidden p-3 rounded-xl bg-white/5 text-white/60 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="font-black text-white text-lg md:text-xl tracking-tight uppercase">Comtechno</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-rose-500"}`}></div>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.1em]">{isConnected ? "Node Connected" : "Connection Lost"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Encryption</span>
                <span className="text-xs text-indigo-400 font-mono">AES-256-GCM</span>
             </div>
             <div className="w-px h-8 bg-white/5"></div>
             <div className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-help" title="Private & Secure">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
             </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <MessageList 
            messages={messages} 
            currentUserId={user?.id || ""} 
            onReply={(msg) => setReplyingTo(msg)}
            onReaction={handleAddReaction}
            onVote={handleVote}
            onImageClick={setSelectedImage}
          />
        </div>
        
        {/* Reply Indicator */}
        {replyingTo && (
          <div className="mx-6 md:mx-10 mb-4 p-4 glass-card border-l-4 border-indigo-500 flex items-center justify-between animate-slide-in">
            <div className="min-w-0">
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Replying to {replyingTo.nickname}</p>
              <p className="text-sm text-white/60 truncate italic">"{replyingTo.text}"</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-2 text-white/20 hover:text-rose-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(99,102,241,0.2)] rounded-2xl animate-scale-up"
            />
            <button 
              className="absolute top-0 right-0 p-4 text-white/40 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}