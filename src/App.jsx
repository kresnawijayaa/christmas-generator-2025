// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Music, VolumeX, Sparkles, Gift, Share2, Copy, Send, Instagram, PlusCircle } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

import bgmAudio from './assets/last-christmas.mp3';

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase init
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// --- KONFIGURASI LAIN ---
const CREATOR_IG = import.meta.env.VITE_CREATOR_IG || "username_kamu"; 
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

export default function App() {
  const [data, setData] = useState({ to: '', from: '', message: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const [form, setForm] = useState({ to: '', from: '', msg: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [user, setUser] = useState(null);

  const audioRef = useRef(null);

  // --- AUTH ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(() => {});
    });
    return () => unsub();
  }, []);

  // --- URL PARSING ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let recipientName = 'Someone Special';
    const pathSegment = window.location.pathname.split('/').filter(Boolean).pop();

    if (pathSegment && pathSegment !== 'srcdoc') recipientName = pathSegment;
    else if (params.get('to')) recipientName = params.get('to');

    const senderName = params.get('from') || 'Your Friend';
    const msg = params.get('msg') ||
      "May the melody and spirit of the holidays fill your home with love and peace. Wishing you a year ahead filled with new hope, abundant happiness, and prosperity.";

    const format = (s) =>
      s.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    setData({
      to: format(recipientName),
      from: format(senderName),
      message: msg
    });
  }, []);

  // --- LOGGING ---
  const logActivity = async (type, payload) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "activity_logs"), {
        type,
        ...payload,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });
    } catch {}
  };

  const handleOpen = () => {
    setIsOpen(true);
    logActivity('view_card', { recipient: data.to, sender: data.from });
    audioRef.current?.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // --- GENERATE LINK ---
  const generateLink = () => {
    if (!form.to || !form.from) return;

    const nameParam = form.to.replace(/\s+/g, '-');
    let url = `${BASE_URL}/${nameParam}?from=${encodeURIComponent(form.from)}`;
    if (form.msg) url += `&msg=${encodeURIComponent(form.msg)}`;

    setGeneratedLink(url);

    logActivity('create_link', {
      creator: form.from,
      target: form.to,
      hasMessage: !!form.msg
    });
  };

  const resetGenerator = () => {
    setGeneratedLink('');
    setForm(prev => ({ ...prev, to: '' }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link kartu berhasil disalin ✨");
  };

  const shareToWA = () => {
    const text = `Hi ${form.to} 👋  
Aku punya kartu ucapan digital spesial buat kamu.  

Buka di sini ya ✨  
${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const Snowflakes = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute top-[-20px] bg-white rounded-full opacity-80 animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 5 + 5}px`,
            height: `${Math.random() * 5 + 5}px`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 text-white overflow-hidden relative">
      <audio ref={audioRef} src={bgmAudio} loop />

      {!isOpen && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-900/95">
          <div onClick={handleOpen} className="cursor-pointer flex flex-col items-center animate-bounce">
            <Gift size={80} className="text-yellow-400 mb-4" />
            <p className="text-xl font-bold tracking-widest text-yellow-100">YOU HAVE A MESSAGE</p>
            <p className="text-sm mt-2 text-white/70">Tap to open</p>
          </div>
          <div className="absolute bottom-10 text-white/30 text-xs flex items-center gap-1">
            <Instagram size={12}/> Created by @{CREATOR_IG}
          </div>
        </div>
      )}

      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white text-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setShowGenerator(false)} className="absolute top-4 right-4">✕</button>

            <h3 className="text-xl font-bold mb-1 text-red-700">
              Buat Kartu Ucapan Digital
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Isi detail di bawah, kami akan membuatkan link kartu spesial untukmu.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Nama Pengirim</label>
                <input
                  className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                  placeholder="Contoh: Ken"
                  value={form.from}
                  onChange={e => setForm({ ...form, from: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Nama Penerima</label>
                <input
                  className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                  placeholder="Contoh: Wina & Family"
                  value={form.to}
                  onChange={e => setForm({ ...form, to: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Pesan (Opsional)</label>
                <textarea
                  className="w-full border p-2 rounded-lg text-sm bg-gray-50 h-20"
                  placeholder="Pesan sudah disiapkan otomatis. Tulis di sini jika ingin menggantinya dengan ucapan versimu sendiri."
                  value={form.msg}
                  onChange={e => setForm({ ...form, msg: e.target.value })}
                />
              </div>

              {!generatedLink ? (
                <button onClick={generateLink} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">
                  Buat Link Kartunya ✨
                </button>
              ) : (
                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                  <p className="text-xs text-green-800 font-semibold mb-2">
                    Link kartu berhasil dibuat 🎉
                  </p>

                  <div className="flex gap-2 mb-2">
                    <button onClick={copyToClipboard} className="flex-1 border py-2 rounded-lg text-sm">
                      <Copy size={14}/> Salin
                    </button>
                    <button onClick={shareToWA} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm">
                      <Send size={14}/> Kirim WA
                    </button>
                  </div>

                  <button onClick={resetGenerator} className="w-full border py-2 rounded-lg text-sm">
                    <PlusCircle size={14}/> Buat Kartu Lainnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-20 right-6 z-50 p-3 rounded-full">
          {isPlaying ? <Music size={24}/> : <VolumeX size={24}/>}
        </button>
      )}
    </div>
  );
}
