with open("App.tsx", "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

new_lines = []
for i, line in enumerate(lines):
    if "const [currentUser, setCurrentUser] = useState<UserType | null>(null);" in line:
        new_lines.append(line)
        new_lines.append("  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'stats'>('form');")
        continue

    # Wrap Form section
    if '          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">' in line and 'px-2 mb-6 text-center' in lines[i+1]:
        new_lines.append('        {activeTab === "form" && (')
        new_lines.append(line)
        continue

    # Wrap History section
    if '          <div className="space-y-8 animate-in slide-in-from-right-4">' in line and 'Nhật ký' in lines[i+2]:
        new_lines.append('        )}');
        new_lines.append('        {activeTab === "history" && (')
        new_lines.append(line)
        continue

    # Wrap Stats section
    if '          <div className="space-y-8 animate-in zoom-in-95 pb-10">' in line and 'Báo cáo giám sát' in lines[i+3]:
        new_lines.append('        )}');
        new_lines.append('        {activeTab === "stats" && (')
        new_lines.append(line)
        continue

    # Wrap Bottom Navigation
    if '      </main>' in line:
        new_lines.append('        )}')
        new_lines.append('      </main>')
        new_lines.append("""
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
        <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'form' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <FileText size={24} className={activeTab === 'form' ? 'fill-blue-100' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">Giám sát</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <History size={24} className={activeTab === 'history' ? 'fill-blue-100' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">Nhật ký</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <BarChart3 size={24} className={activeTab === 'stats' ? 'fill-blue-100' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">Báo cáo</span>
        </button>
      </div>
""")
        continue

    new_lines.append(line)

with open("App.tsx", "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines))
