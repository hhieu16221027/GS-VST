import React, { useState } from 'react';
import { User } from '../types';
import { ALLOWED_USERS, AUTH_KEY } from '../constants';
import { LogIn, Lock, UserCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEFAULT_LOGO_FALLBACK = "https://raw.githubusercontent.com/hhieu16221027/VST-system/refs/heads/main/logo.png";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    const found = ALLOWED_USERS.find(
      u => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (found) {
      const userObj: User = {
        username: found.username,
        fullName: found.fullName,
        role: found.role as 'admin' | 'observer'
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
      onLogin(userObj);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-lg border border-sky-100 p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="Logo Bệnh viện" 
            className="h-20 w-20 object-contain drop-shadow-sm mb-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_LOGO_FALLBACK;
            }}
          />
          <h1 className="text-[20px] font-black uppercase text-blue-600 tracking-tight leading-tight">
            BỆNH VIỆN ĐA KHOA TÂN PHÚ
          </h1>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
            Hệ thống giám sát vệ sinh tay
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-[14px] font-bold border border-red-100">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[14px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
              <UserCheck size={16} className="text-blue-500" />
              Tài khoản
            </label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              className="w-full px-5 py-4 bg-sky-50/50 border-2 border-transparent focus:border-blue-500 rounded-[18px] text-[16px] font-medium outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Lock size={16} className="text-blue-500" />
              Mật khẩu
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              className="w-full px-5 py-4 bg-sky-50/50 border-2 border-transparent focus:border-blue-500 rounded-[18px] text-[16px] font-medium outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-[16px] uppercase rounded-[20px] shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all mt-2"
          >
            <LogIn size={20} />
            Đăng nhập
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Khoa Kiểm Soát Nhiễm Khuẩn
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
