
import React, { useState, useEffect } from 'react';
import { MonitoringSession, Observation, Department, Profession, User as UserType } from './types';
import { DEPARTMENTS, PROFESSIONS, NON_HYGIENE_ACTIONS, AUTH_KEY } from './constants';
import ObservationRow from './components/ObservationRow';
import Login from './components/Login';
import { 
  Plus, History, LayoutDashboard, FileText, Loader2, 
  CloudUpload, X, UserCircle, Briefcase, Zap, Calendar, ChevronRight,
  TrendingUp, BarChart3, LogOut, Users, Sliders, Settings, Trash2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const STORAGE_KEY = 'hand_hygiene_data_v2';
const SCRIPT_URL_KEY = 'hand_hygiene_script_url_v2';
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2AvYl4Ggnuh_gZU6YL7YNCww8go8929Z1eniwFQi5tUlZTLygTPAT4yyzTzTupn3IBw/exec";
const DEFAULT_LOGO_FALLBACK = "https://raw.githubusercontent.com/hhieu16221027/VST-system/refs/heads/main/logo.png";

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const formatToVN = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const getStartOfWeek = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is start of week
  const monday = new Date(d.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday;
};

const getEndOfWeek = (startDate: Date) => {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 6);
  d.setHours(23,59,59,999);
  return d;
};

const getWeekLabel = (dateStr: string) => {
  if (!dateStr) return 'Không xác định';
  const start = getStartOfWeek(dateStr);
  const end = getEndOfWeek(start);
  const formatDayMonth = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };
  return `Tuần ${formatDayMonth(start)} - ${formatDayMonth(end)}/${end.getFullYear()}`;
};

const getShortWeekLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const start = getStartOfWeek(dateStr);
  const end = getEndOfWeek(start);
  const formatDayMonth = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };
  return `${formatDayMonth(start)}-${formatDayMonth(end)}`;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'stats'>('form');
  const [history, setHistory] = useState<MonitoringSession[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scriptUrl, setScriptUrl] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MonitoringSession | null>(null);

  // Form State
  const [observer, setObserver] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [observations, setObservations] = useState<Observation[]>([
    {
      id: generateId(),
      profession: "DD/HS/KTY",
      indications: [],
      action: "VST với cồn",
      procedure: "Đúng",
      staffName: "",
      patientType: null
    }
  ]);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth);
        setCurrentUser(user);
        setObserver(user.fullName);
      } catch (e) {
        console.error("Lỗi đọc thông tin đăng nhập:", e);
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch (e) { console.error("Lỗi đọc dữ liệu:", e); }
    }
    
    const storedUrl = localStorage.getItem(SCRIPT_URL_KEY);
    // Cập nhật: Luôn ưu tiên dùng DEFAULT_SCRIPT_URL nếu nó khác với link cũ trong máy
    if (storedUrl !== DEFAULT_SCRIPT_URL) {
      setScriptUrl(DEFAULT_SCRIPT_URL);
      setTempUrl(DEFAULT_SCRIPT_URL);
      localStorage.setItem(SCRIPT_URL_KEY, DEFAULT_SCRIPT_URL);
    } else if (storedUrl) {
      setScriptUrl(storedUrl);
      setTempUrl(storedUrl);
    } else {
      setScriptUrl(DEFAULT_SCRIPT_URL);
      setTempUrl(DEFAULT_SCRIPT_URL);
      localStorage.setItem(SCRIPT_URL_KEY, DEFAULT_SCRIPT_URL);
    }
  }, []);

  const handleSaveUrl = () => {
    if (!tempUrl.trim()) return;
    setScriptUrl(tempUrl.trim());
    localStorage.setItem(SCRIPT_URL_KEY, tempUrl.trim());
    alert("Đã lưu cấu hình đường dẫn mới thành công!");
    setShowSettings(false);
  };

  const handleResetUrl = () => {
    setScriptUrl(DEFAULT_SCRIPT_URL);
    setTempUrl(DEFAULT_SCRIPT_URL);
    localStorage.setItem(SCRIPT_URL_KEY, DEFAULT_SCRIPT_URL);
    alert("Đã khôi phục đường dẫn mặc định!");
  };

  const handleAddObservation = () => {
    setObservations([...observations, {
      id: generateId(),
      profession: "DD/HS/KTY",
      indications: [],
      action: "VST với cồn",
      procedure: "Đúng",
      staffName: "",
      patientType: null
    }]);
  };

  const handleUpdateObservation = (id: string, updates: Partial<Observation>) => {
    setObservations(prev => prev.map(obs => obs.id === id ? { ...obs, ...updates } : obs));
  };

  const handleDeleteObservation = (id: string) => {
    if (observations.length <= 1) return;
    setObservations(prev => prev.filter(obs => obs.id !== id));
  };

  const handleDeleteObservationFromSession = (sessionId: string, observationId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá lượt quan sát này khỏi chi tiết giám sát không?")) {
      return;
    }

    const updatedHistory = history.map(session => {
      if (session.id === sessionId) {
        const updatedObs = session.observations.filter(o => o.id !== observationId);
        return {
          ...session,
          observations: updatedObs
        };
      }
      return session;
    }).filter(session => session.observations.length > 0);

    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

    if (selectedSession && selectedSession.id === sessionId) {
      const updatedObs = selectedSession.observations.filter(o => o.id !== observationId);
      if (updatedObs.length === 0) {
        setSelectedSession(null);
      } else {
        setSelectedSession({
          ...selectedSession,
          observations: updatedObs
        });
      }
    }
  };

  const getStatsByWeek = () => {
    if (history.length === 0) return [];

    const weeksMap: { 
      [key: string]: { 
        total: number; 
        compliant: number; 
        dateForSort: Date;
        depts: { [deptName: string]: { total: number; compliant: number } }
      } 
    } = {};

    history.forEach(session => {
      const weekLabel = getWeekLabel(session.date);
      const startOfWeek = getStartOfWeek(session.date);
      
      if (!weeksMap[weekLabel]) {
        weeksMap[weekLabel] = { total: 0, compliant: 0, dateForSort: startOfWeek, depts: {} };
      }

      if (!weeksMap[weekLabel].depts[session.department]) {
        weeksMap[weekLabel].depts[session.department] = { total: 0, compliant: 0 };
      }

      session.observations.forEach(obs => {
        weeksMap[weekLabel].total += 1;
        weeksMap[weekLabel].depts[session.department].total += 1;
        if (!NON_HYGIENE_ACTIONS.includes(obs.action)) {
          weeksMap[weekLabel].compliant += 1;
          weeksMap[weekLabel].depts[session.department].compliant += 1;
        }
      });
    });

    const stats = Object.keys(weeksMap).map(weekLabel => {
      const data = weeksMap[weekLabel];
      const complianceRate = data.total > 0 ? parseFloat((data.compliant / data.total * 100).toFixed(1)) : 0;
      
      const deptBreakdown = Object.keys(data.depts).map(deptName => {
        const dData = data.depts[deptName];
        const rate = dData.total > 0 ? parseFloat((dData.compliant / dData.total * 100).toFixed(1)) : 0;
        return {
          deptName,
          total: dData.total,
          compliant: dData.compliant,
          complianceRate: rate
        };
      }).sort((a, b) => b.complianceRate - a.complianceRate);

      return {
        weekLabel,
        total: data.total,
        compliant: data.compliant,
        complianceRate,
        dateForSort: data.dateForSort,
        shortWeekLabel: getShortWeekLabel(data.dateForSort.toISOString().split('T')[0]),
        deptBreakdown
      };
    }).sort((a, b) => b.dateForSort.getTime() - a.dateForSort.getTime());

    return stats;
  };

  const [statsViewMode, setStatsViewMode] = useState<'week' | 'dept'>('week');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [expandedWeeks, setExpandedWeeks] = useState<{ [weekLabel: string]: boolean }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!observer.trim()) { 
      alert("Vui lòng nhập tên NHÂN VIÊN GIÁM SÁT!"); 
      return; 
    }

    const incompleteName = observations.some(obs => !obs.staffName || !obs.staffName.trim());
    if (incompleteName) {
      alert("Vui lòng nhập đầy đủ tên nhân viên được giám sát.");
      return;
    }

    const incompleteIndications = observations.some(obs => !obs.indications || obs.indications.length === 0);
    if (incompleteIndications) {
      alert("Mỗi lượt quan sát cần chọn ít nhất một CHỈ ĐỊNH.");
      return;
    }

    const deptsWithPatientType = ["Nội - Nhiễm", "Ngoại tổng hợp", "Phụ sản", "Nhi"];
    if (deptsWithPatientType.includes(department)) {
      const incompletePatientType = observations.some(obs => !obs.patientType);
      if (incompletePatientType) {
        alert("Vui lòng chọn KHU VỰC (Nội trú/Ngoại trú) cho tất cả các lượt quan sát.");
        return;
      }
    }

    setIsSubmitting(true);
    const now = new Date();
    const timestamp = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');
    
    const session: MonitoringSession = {
      id: generateId(),
      observer: observer.trim(),
      date, 
      department,
      observations,
      createdAt: timestamp
    };

    try {
      const newHistory = [session, ...history];
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

      if (scriptUrl) {
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
      }

      setShowSuccess(true);
      setActiveTab("history");
      setHasAttemptedSubmit(false);
      setObservations([{
        id: generateId(),
        profession: "DD/HS/KTY",
        indications: [],
        action: "VST với cồn",
        procedure: "Đúng",
        staffName: "",
        patientType: null
      }]);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);

    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatsByDepartment = (weekFilter: string = 'all') => {
    if (history.length === 0) return [];

    const filteredHistory = weekFilter === 'all'
      ? history
      : history.filter(h => getWeekLabel(h.date) === weekFilter);

    const stats = DEPARTMENTS.map(dept => {
      const deptSessions = filteredHistory.filter(h => h.department === dept);
      const allObs = deptSessions.flatMap(h => h.observations);
      
      if (allObs.length === 0) return null;

      const compliantObs = allObs.filter(o => !NON_HYGIENE_ACTIONS.includes(o.action));
      const complianceRate = (compliantObs.length / allObs.length * 100).toFixed(1);

      const profStats = PROFESSIONS.map(p => {
        const pObs = allObs.filter(o => o.profession === p);
        const pCompliant = pObs.filter(o => !NON_HYGIENE_ACTIONS.includes(o.action));
        return {
          name: p,
          totalObs: pObs.length,
          compliantObs: pCompliant.length,
          rate: pObs.length > 0 ? (pCompliant.length / pObs.length * 100).toFixed(1) : "0"
        };
      });

      return {
        deptName: dept,
        total: allObs.length,
        complianceRate,
        profStats
      };
    }).filter(Boolean);

    return stats;
  };

  const deptStats = getStatsByDepartment(selectedWeekFilter);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={(user) => {
      setCurrentUser(user);
      setObserver(user.fullName);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-slate-900 overflow-x-hidden pb-40">
      <header className="bg-white border-b border-sky-100 sticky top-0 z-40 px-5 pb-5 pt-[15px] safe-top shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          <div className="absolute left-0 shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo Bệnh viện" 
              className="h-14 w-14 object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_LOGO_FALLBACK;
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-[18px] font-black tracking-tighter leading-none uppercase text-blue-600">
              BỆNH VIỆN ĐA KHOA
            </h1>
            <h2 className="text-[18px] font-black tracking-tighter leading-tight uppercase text-blue-600">
              TÂN PHÚ
            </h2>
          </div>
          
          <div className="absolute right-0 hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Chào mừng,</span>
            <span className="text-[13px] font-black text-blue-900 truncate max-w-[120px]">{currentUser.fullName}</span>
          </div>
        </div>
      </header>

        <main className="max-w-7xl mx-auto px-6 pt-8">
        {activeTab === "form" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2 mb-6 text-center">
              <h2 className="text-[18px] font-black text-blue-800/40 uppercase tracking-[0.2em] leading-relaxed">
                Giám sát vệ sinh tay <br /> thường quy
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="bg-white rounded-[28px] shadow-sm border border-sky-100 p-6 space-y-6">
                <div className="flex items-center gap-3 text-blue-600 pb-3 border-b border-sky-50">
                  <FileText size={20} />
                  <h2 className="text-[18px] font-black uppercase tracking-wider">Thông tin chung</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[16px] font-black text-slate-400 uppercase ml-2">
                      NHÂN VIÊN GIÁM SÁT <span className="text-red-500 font-black">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Họ tên nhân viên giám sát" 
                      className={`w-full px-5 py-4 bg-sky-50/50 border-2 rounded-[18px] text-[16px] focus:ring-4 focus:ring-blue-500 outline-none transition-all ${
                        hasAttemptedSubmit && !observer.trim() ? 'border-red-200 bg-red-50' : 'border-transparent'
                      }`} 
                      value={observer} 
                      onChange={(e) => setObserver(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[16px] font-black text-slate-400 uppercase ml-2">KHOA ĐƯỢC GIÁM SÁT</label>
                    <div className="relative">
                      <select className="w-full px-5 py-4 bg-sky-50/50 border-none rounded-[18px] text-[16px] font-bold outline-none appearance-none shadow-inner" value={department} onChange={(e) => setDepartment(e.target.value as Department)}>
                        {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-300">
                        <ChevronRight className="rotate-90" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-4">
                {observations.map((obs, idx) => (
                  <ObservationRow 
                    key={obs.id} 
                    index={idx} 
                    observation={obs} 
                    department={department}
                    onUpdate={handleUpdateObservation} 
                    onDelete={handleDeleteObservation} 
                  />
                ))}
              </div>
              
              <div className="pt-4 space-y-3">
                  <button type="button" onClick={handleAddObservation} className="w-full py-4 rounded-[20px] text-blue-700 bg-white font-black text-[16px] uppercase flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-blue-100 shadow-sm hover:bg-blue-50">
                    <Plus size={20} /> Thêm lượt quan sát mới
                  </button>

                  <button type="submit" disabled={isSubmitting} className={`w-full py-6 rounded-[24px] text-[18px] font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isSubmitting ? 'bg-slate-300' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CloudUpload size={24} />}
                    {isSubmitting ? 'ĐANG GỬI DỮ LIỆU...' : 'HOÀN TẤT & GỬI'}
                  </button>

                  {/* Cấu hình nâng cao (Đường dẫn Apps Script) */}
                  {false && currentUser?.role === 'admin' && (
                    <div className="bg-white rounded-[24px] border border-sky-100 p-5 shadow-sm mt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full flex items-center justify-between text-slate-500 font-bold transition-all outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders size={18} className="text-blue-500" />
                          <span className="text-[14px] uppercase tracking-wide">Cấu hình kết nối Google Sheet</span>
                        </div>
                        <ChevronRight size={18} className={`transform transition-transform text-slate-400 ${showSettings ? 'rotate-90' : ''}`} />
                      </button>
                      {showSettings && (
                        <div className="mt-4 pt-4 border-t border-sky-50 space-y-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Đường dẫn Google Apps Script hiện tại</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-mono"
                              value={tempUrl}
                              onChange={(e) => setTempUrl(e.target.value)}
                              placeholder="Nhập đường dẫn Google Apps Script"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveUrl}
                              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-[13px] hover:bg-blue-700 active:scale-95 transition-all text-center uppercase shadow-sm"
                            >
                              Lưu đường dẫn
                            </button>
                            <button
                              type="button"
                              onClick={handleResetUrl}
                              className="py-3 px-4 bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold rounded-xl text-[13px] active:scale-95 transition-all text-center uppercase"
                              title="Đặt lại mặc định"
                            >
                              Mặc định
                            </button>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                            📌 Bạn có thể dán trực tiếp đường dẫn Google Apps Script (Web App URL) mới vào ô trên và nhấp <strong>LƯU ĐƯỜNG DẪN</strong> để ứng dụng kết nối trực tiếp đến trang tính mới của bạn.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </form>
          </div>

        )}
        {activeTab === "history" && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="flex justify-between items-center px-2 mb-6">
                <h2 className="text-[22px] font-black text-blue-900 uppercase">Nhật ký</h2>
                <button onClick={() => { if(confirm("Xóa toàn bộ lịch sử?")) { localStorage.removeItem(STORAGE_KEY); setHistory([]); } }} className="text-[14px] font-bold text-red-500 bg-white px-4 py-2 rounded-full uppercase border border-red-100 shadow-sm">Xóa tất cả</button>
             </div>
             {history.length === 0 ? (
               <div className="bg-white rounded-[28px] py-20 border-2 border-dashed border-sky-100 text-center space-y-5">
                 <History className="mx-auto text-sky-200" size={48} />
                 <p className="text-[16px] font-bold text-sky-400">Chưa có dữ liệu giám sát</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {history.map(session => (
                   <div 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)}
                    className="bg-white rounded-[24px] p-6 shadow-sm border border-sky-100 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:border-blue-200"
                   >
                      <div className="space-y-1 pr-4">
                        <div className="text-[16px] font-black text-blue-900 uppercase tracking-tight truncate max-w-[200px]">{session.department}</div>
                        <div className="text-[13px] text-slate-400 font-bold">{formatToVN(session.date)} • {session.observer}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 px-3 py-1.5 rounded-xl text-[14px] font-black text-blue-600 uppercase whitespace-nowrap">{session.observations.length} Lượt</div>
                        <ChevronRight size={20} className="text-slate-300" />
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

        )}
        {activeTab === "stats" && (
          <div className="space-y-8 animate-in zoom-in-95 pb-10">
             <div className="px-2 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h2 className="text-[22px] font-black text-blue-900 uppercase tracking-tight">Báo cáo giám sát</h2>
                   <p className="text-[14px] font-bold text-slate-400 mt-1 uppercase">
                     {'Tổng hợp theo từng khoa được giám sát'}
                   </p>
                </div>
                
             </div>
             
             {history.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-[32px] border border-sky-100 shadow-sm space-y-4">
                 <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-300">
                    <BarChart3 size={32} />
                 </div>
                 <p className="text-sky-400 font-black uppercase text-[14px] tracking-widest">Chưa có dữ liệu thống kê</p>
               </div>
             ) : (                <div className="space-y-8">
                  {/* Bộ lọc Tuần cho báo cáo Theo Khoa */}
                  <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-wider">Lọc báo cáo theo tuần</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Xem kết quả của từng khoa theo khoảng thời gian tuần</p>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedWeekFilter}
                        onChange={(e) => setSelectedWeekFilter(e.target.value)}
                        className="w-full sm:w-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-black text-blue-900 uppercase outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 cursor-pointer"
                      >
                        <option value="all">TẤT CẢ CÁC TUẦN</option>
                        {getStatsByWeek().map((w: any) => (
                          <option key={w.weekLabel} value={w.weekLabel}>
                            {w.weekLabel.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {deptStats.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[32px] border border-sky-100 shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-300">
                         <BarChart3 size={24} />
                      </div>
                      <p className="text-sky-400 font-black uppercase text-[12px] tracking-widest">Không có dữ liệu trong tuần đã chọn</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {deptStats.map((dept: any) => (
                   <div key={dept.deptName} className="bg-white rounded-[32px] shadow-sm border border-sky-100 overflow-hidden">
                      <div className="bg-blue-900 p-6 flex items-center justify-between">
                        <h3 className="text-[18px] font-black text-white uppercase tracking-tight leading-tight max-w-[70%]">
                          {dept.deptName}
                        </h3>
                        <div className="flex flex-col items-end">
                           <div className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black text-white/90 uppercase tracking-tighter">
                             {dept.total} Cơ hội
                           </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-8">
                        <div className="flex flex-col gap-2 py-2">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-blue-600">
                                <TrendingUp size={18} />
                                <span className="text-[15px] font-black uppercase tracking-wider">TỶ LỆ TUÂN THỦ</span>
                              </div>
                              <span className="text-[28px] font-black text-blue-900">{dept.complianceRate}%</span>
                           </div>
                           <p className="text-[14px] text-slate-500 font-medium leading-snug border-l-4 border-blue-500 pl-4 bg-blue-50/30 py-2 rounded-r-xl">
                             Dựa trên <strong>{dept.total}</strong> lượt quan sát thực tế tại khoa.
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           {dept.profStats.map((prof: any) => (
                             <div key={prof.name} className="p-4 rounded-[24px] border border-slate-50 bg-slate-50/30 flex flex-col gap-1">
                               <div className="flex justify-between items-start">
                                 <span className="text-[12px] font-black text-slate-800 uppercase truncate max-w-[60px]">{prof.name}</span>
                                 <span className="text-[14px] font-black text-blue-600">{prof.rate}%</span>
                               </div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                 {prof.compliantObs}/{prof.totalObs} Tuân thủ
                               </div>
                             </div>
                           ))}
                        </div>
                   </div>
                 </div>
                  ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-8 pb-12">
                <button 
                  onClick={handleLogout}
                  className="w-full py-5 bg-white border-2 border-rose-100 rounded-[24px] flex items-center justify-center gap-3 text-rose-500 font-black text-[16px] uppercase active:scale-95 transition-all shadow-sm hover:bg-rose-50"
                >
                  <LogOut size={22} />
                  Đăng xuất tài khoản
                </button>
                <p className="text-center text-slate-300 text-[12px] font-bold uppercase tracking-widest mt-6">
                  Phiên bản 2.0.1 • Bệnh viện Tân Phú
                </p>
              </div>
          </div>
        )}
      </main>

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

    </div>
  );
}

export default App;