import re

with open("App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

delete_fn = """
  const handleDeleteSession = (sessionId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá TOÀN BỘ phiên giám sát này không?")) {
      return;
    }
    const updatedHistory = history.filter(session => session.id !== sessionId);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    setSelectedSession(null);
  };
"""

content = content.replace("  const handleDeleteObservationFromSession = (sessionId: string, observationId: string) => {", delete_fn + "\n  const handleDeleteObservationFromSession = (sessionId: string, observationId: string) => {")

header_replacement = """
          <div className="bg-white px-5 py-4 border-b border-sky-100 flex items-center justify-between shadow-sm safe-top">
            <div>
              <h3 className="text-[18px] font-black text-blue-900 uppercase leading-none truncate max-w-[250px]">{selectedSession.department}</h3>
              <p className="text-[12px] font-bold text-slate-400 mt-1">{formatToVN(selectedSession.date)} • {selectedSession.observer}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDeleteSession(selectedSession.id)}
                className="w-10 h-10 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
"""

content = re.sub(
    r'<div className="bg-white px-5 py-4 border-b border-sky-100 flex items-center justify-between shadow-sm safe-top">.*?</button>\s*</div>',
    header_replacement.strip(),
    content,
    flags=re.DOTALL
)

with open("App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
