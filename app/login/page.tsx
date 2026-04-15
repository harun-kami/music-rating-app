"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // ログイン処理
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`ERROR: ${error.message}`);
    } else {
      setMessage('ACCESS GRANTED. REDIRECTING...');
      setTimeout(() => router.push('/'), 1000);
    }
    setLoading(false);
  };

  // 新規登録処理（アカウントがない人用）
  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`ERROR: ${error.message}`);
    } else {
      setMessage('CHECK YOUR EMAIL FOR CONFIRMATION!');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-12">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
          <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.4em] mt-3">Authentication // Secure Archive</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase italic ml-2">Identify / Email</p>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border-b-2 border-gray-800 p-4 font-black italic text-xl focus:outline-none focus:border-orange-500 transition-all"
              placeholder="YOUR_EMAIL@EXAMPLE.COM"
              required
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase italic ml-2">Passkey / Password</p>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border-b-2 border-gray-800 p-4 font-black italic text-xl focus:outline-none focus:border-orange-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {message && (
            <p className="text-[10px] font-black text-orange-500 uppercase italic text-center animate-pulse">
              {message}
            </p>
          )}

          <div className="pt-6 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-white text-black py-5 rounded-2xl font-black italic text-sm tracking-widest transition-all active:scale-95 shadow-2xl"
            >
              {loading ? 'CONNECTING...' : 'ENTER ARCHIVE →'}
            </button>

            <button 
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full text-gray-600 hover:text-white py-2 font-black text-[10px] uppercase tracking-widest transition-all italic"
            >
              First time digging? Create Account
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="text-gray-800 hover:text-gray-500 text-[8px] font-black uppercase tracking-[0.2em] transition-all">
            ← Offline Mode
          </Link>
        </div>

      </div>
    </main>
  );
}