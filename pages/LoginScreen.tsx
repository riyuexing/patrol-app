
import React, { useState } from 'react';
import { User as UserType } from '../types';
import { TEAMS } from '../constants';

interface LoginScreenProps {
  onLogin: (user: UserType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('张三');
  const [password, setPassword] = useState('123456');
  const [team, setTeam] = useState(TEAMS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    onLogin({ username, team, role: '巡检员' });
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-6 max-w-md mx-auto">
      <div className="w-20 h-20 mb-8 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {isRegister ? '创建本地账户' : '登录系统'}
      </h2>
      <p className="text-gray-500 mb-8 text-sm">离线模式可用，数据保存在本地</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">用户名</label>
          <input 
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入您的姓名"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">密码</label>
          <input 
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </div>

        {isRegister && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">所属班组</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            >
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all mt-4"
        >
          {isRegister ? '立即注册' : '登 录'}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4 text-sm">
        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="text-blue-600 font-semibold"
        >
          {isRegister ? '已有账号？去登录' : '新建本地用户'}
        </button>
      </div>

      <div className="absolute bottom-8 text-gray-400 text-xs">
        V 1.0.0 (Beta) | 煤矿巡检专用版
      </div>
    </div>
  );
};

export default LoginScreen;
