import re

with open("App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

modal_code = """
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white px-5 py-4 border-b border-sky-100 flex items-center justify-between shadow-sm safe-top">
            <div>
              <h3 className="text-[18px] font-black text-blue-900 uppercase leading-none truncate max-w-[250px]">{selectedSession.department}</h3>
              <p className="text-[12px] font-bold text-slate-400 mt-1">{formatToVN(selectedSession.date)} • {selectedSession.observer}</p>
            </div>
            <button 
              onClick={() => setSelectedSession(null)}
              className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-32">
            {selectedSession.observations.map((obs, idx) => (
              <div key={obs.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-sky-100 relative">
                 <div className="absolute top-5 right-5 text-slate-200 font-black text-[24px] leading-none opacity-50">
                    #{idx + 1}
                 </div>
                 <div className="space-y-4 relative z-10">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4">
                      <div>
                        <div className="text-[15px] font-black text-slate-800">{obs.staffName || 'Chưa nhập tên'}</div>
                        <div className="text-[12px] font-bold text-blue-500 uppercase tracking-wide mt-0.5">{obs.profession}</div>
                        {obs.patientType && (
                          <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                             Khu vực: {obs.patientType}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteObservationFromSession(selectedSession.id, obs.id)}
                        className="text-red-400 hover:text-red-600 p-2 -mr-2 -mt-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chỉ định</div>
                       <div className="flex flex-wrap gap-1.5">
                         {(obs.indications || []).map((ind, i) => (
                           <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[12px] font-semibold leading-tight border border-blue-100/50">
                             {ind}
                           </span>
                         ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hành động</div>
                         <div className="text-[13px] font-bold text-slate-700">{obs.action}</div>
                       </div>
                       <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuân thủ</div>
                         <div className={`text-[13px] font-black ${obs.procedure === 'Đúng' ? 'text-emerald-600' : obs.procedure === 'Sai' ? 'text-red-500' : 'text-slate-400'}`}>
                           {obs.procedure || 'N/A'}
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
"""

content = re.sub(r'(</main>\s*\{\/\* Bottom Navigation \*\/})', modal_code + r'\n\1', content)

with open("App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
