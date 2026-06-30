"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 極小の2本線メニュー開閉ボタン */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="group flex flex-col gap-1.5 focus:outline-none p-1 flex-shrink-0" 
        aria-label="Open Menu"
      >
        <span className="w-5 h-0.5 bg-gray-600 group-hover:bg-orange-500 transition-colors duration-300"></span>
        <span className="w-5 h-0.5 bg-gray-600 group-hover:bg-orange-500 transition-colors duration-300"></span>
      </button>

      {/* スライドインするサイドメニュー本体 */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* 背景の暗幕（クリックで閉じる） */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />

        {/* 左からスライドしてくる黒いパネル */}
        <div className={`absolute top-0 left-0 h-full w-64 md:w-72 bg-[#050505] border-r border-[#1a1a1a] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div className="p-6 md:p-8 flex justify-between items-center border-b border-[#1a1a1a]">
            <span className="text-[9px] font-black text-[#ff6b00] tracking-[0.4em] uppercase">MENU</span>
            <button onClick={() => setIsOpen(false)} className="text-[10px] text-[#444444] hover:text-white tracking-widest uppercase font-bold transition-colors">
              ✕
            </button>
          </div>

          <nav className="flex-1 px-8 py-12 flex flex-col gap-10">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-black tracking-[0.2em] uppercase text-[#888888] hover:text-[#ff6b00] transition-colors">
              HOME
            </Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className="text-sm font-black tracking-[0.2em] uppercase text-[#888888] hover:text-[#ff6b00] transition-colors">
              PROFILE
            </Link>
            <Link href="/review" onClick={() => setIsOpen(false)} className="text-sm font-black tracking-[0.2em] uppercase text-[#888888] hover:text-[#ff6b00] transition-colors">
              NEW DIG
            </Link>
            <Link href="/ranking" onClick={() => setIsOpen(false)} className="text-sm font-black tracking-[0.2em] uppercase text-[#888888] hover:text-[#ff6b00] transition-colors">
              RANKING
            </Link>
          </nav>

          <div className="p-8 border-t border-[#1a1a1a]">
            <p className="text-[8px] text-[#444444] font-bold tracking-[0.4em] uppercase italic">
              MY DIGS. // Micro Archive
            </p>
          </div>
        </div>
      </div>
    </>
  );
}