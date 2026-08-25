import re

with open("App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add isSyncing state
state_insertion = "  const [isSyncing, setIsSyncing] = useState(false);\n"
if "const [isSyncing" not in content:
    content = content.replace("  const [isSubmitting, setIsSubmitting] = useState(false);", 
                              "  const [isSubmitting, setIsSubmitting] = useState(false);\n" + state_insertion)

# Add handleSyncAll function
sync_function = """
  const handleSyncAll = async () => {
    if (!scriptUrl) {
      alert("Chưa có cấu hình Google Sheet URL!");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn đồng bộ lại toàn bộ dữ liệu (" + history.length + " phiên) lên Google Sheet không?")) {
      return;
    }
    
    setIsSyncing(true);
    let successCount = 0;
    try {
      for (const session of history) {
        const rows = session.observations.map(obs => ({
          date: formatToVN(session.date),
          observer: session.observer,
          department: session.department,
          staffName: obs.staffName || '---',
          profession: obs.profession,
          khuVuc: obs.patientType || 'N/A',
          indication: (obs.indications || []).join(', '),
          action: obs.action,
          procedure: obs.procedure || 'N/A',
          createdAt: session.createdAt
        }));

        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ rows })
        });
        successCount++;
      }
      alert(`Đã đồng bộ thành công ${successCount} phiên giám sát lên hệ thống!`);
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
      alert("Có lỗi xảy ra trong quá trình đồng bộ!");
    } finally {
      setIsSyncing(false);
    }
  };
"""

if "const handleSyncAll" not in content:
    content = content.replace("  const handleLogout = () => {", sync_function + "\n  const handleLogout = () => {")

# Add the sync button to the History tab
sync_button = """
             <div className="flex justify-between items-center px-2 mb-6 gap-2 flex-wrap">
                <h2 className="text-[22px] font-black text-blue-900 uppercase">Nhật ký</h2>
                <div className="flex gap-2">
                  <button 
                    disabled={isSyncing || history.length === 0}
                    onClick={handleSyncAll} 
                    className="flex items-center gap-2 text-[14px] font-bold text-blue-600 bg-white px-4 py-2 rounded-full uppercase border border-blue-100 shadow-sm disabled:opacity-50"
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                    Đồng bộ
                  </button>
                  <button onClick={() => { if(confirm("Xóa toàn bộ lịch sử?")) { localStorage.removeItem(STORAGE_KEY); setHistory([]); } }} className="text-[14px] font-bold text-red-500 bg-white px-4 py-2 rounded-full uppercase border border-red-100 shadow-sm">Xóa tất cả</button>
                </div>
             </div>
"""

content = re.sub(
    r'<div className="flex justify-between items-center px-2 mb-6">\s*<h2 className="text-\[22px\] font-black text-blue-900 uppercase">Nhật ký</h2>\s*<button onClick=\{\(\) => \{ if\(confirm\("Xóa toàn bộ lịch sử\?"\)\) \{ localStorage.removeItem\(STORAGE_KEY\); setHistory\(\[\]\); \} \}\} className="text-\[14px\] font-bold text-red-500 bg-white px-4 py-2 rounded-full uppercase border border-red-100 shadow-sm">Xóa tất cả</button>\s*</div>',
    sync_button,
    content
)


with open("App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

