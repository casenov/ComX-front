type User = {
  user_id: string;
  nickname: string;
  avatar: string;
  is_typing?: boolean;
};

export default function UserList({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  return (
    <div className="flex-1 overflow-y-auto py-2">
      <div className="px-6 mb-2">
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Участники — {users.length}</p>
      </div>
      <div className="space-y-1">
        {users.map((u) => (
          <div 
            key={u.user_id} 
            className={`
              flex items-center px-6 py-2 transition-colors relative group
              ${u.user_id === currentUserId ? "bg-white/5" : "hover:bg-white/[0.02]"}
            `}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5">
                <img 
                  src={u.avatar} 
                  alt={u.nickname} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${u.nickname}`;
                  }}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0a0c] rounded-full"></div>
            </div>
            <div className="ml-3 min-w-0">
              <p className={`text-sm truncate ${u.user_id === currentUserId ? "text-indigo-400 font-bold" : "text-white/70"}`}>
                {u.nickname}
                {u.user_id === currentUserId && <span className="ml-1 text-[10px] opacity-40 font-normal">(вы)</span>}
              </p>
              {u.is_typing && (
                <p className="text-[10px] text-indigo-400 animate-pulse font-medium">печатает...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}