import React, { useState, useEffect, useRef } from 'react';
import { Music, VolumeX, Heart, Sparkles, Gift, Share2, Copy, Send, Instagram, PlusCircle } from 'lucide-react';

// --- KONFIGURASI AUDIO & ENV ---

// [PENTING] UNTUK PENGGUNAAN LOKAL & DEPLOY VERCEL:
// Hapus tanda komentar (//) pada bagian 'LOCAL' di bawah ini, 
// dan beri komentar pada bagian 'PREVIEW'.

// === MODE LOCAL / PRODUCTION (Gunakan ini di laptop/Vercel) ===
import bgmAudio from './assets/last-christmas.mp3';
const CREATOR_IG = import.meta.env.VITE_CREATOR_IG || "username_kamu"; 
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

// === MODE PREVIEW (Hanya untuk demo di sini agar tidak error) ===
// const bgmAudio = "https://ia800100.us.archive.org/2/items/LastChristmasInstrumental/Last%20Christmas%20-%20Instrumental.mp3";
// const CREATOR_IG = "username_kamu"; // Fallback preview
// const BASE_URL = window.location.origin; // Fallback preview

export default function App() {
  // State untuk Data Kartu
  const [data, setData] = useState({
    to: '',
    from: '',
    message: ''
  });
  
  // State UI
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false); // Modal Generator
  
  // State Form Generator
  const [form, setForm] = useState({ to: '', from: '', msg: '' });
  const [generatedLink, setGeneratedLink] = useState('');

  const audioRef = useRef(null);
  const audioUrl = bgmAudio;

  useEffect(() => {
    // Logika Pintar Baca URL
    const params = new URLSearchParams(window.location.search);
    
    // 1. Ambil Nama Penerima (Support /Nama atau ?to=Nama)
    let recipientName = 'Someone Special';
    const path = window.location.pathname;
    const pathSegment = path.split('/').filter(Boolean).pop();

    if (pathSegment && pathSegment !== 'srcdoc') {
        recipientName = pathSegment;
    } else if (params.get('to')) {
        recipientName = params.get('to');
    }

    // 2. Ambil Pengirim & Pesan (Default jika kosong)
    const senderName = params.get('from') || 'Your Friend'; 
    const customMsg = params.get('msg') || "May the melody and spirit of the holidays fill your home with love and peace. Wishing you a year ahead filled with new hope, abundant happiness, and prosperity.";

    // Format Nama (Hilangkan dash, Capitalize)
    const formatName = (str) => str.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    setData({
        to: formatName(recipientName),
        from: formatName(senderName),
        message: customMsg
    });

  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // --- LOGIKA GENERATOR LINK ---
  const generateLink = () => {
    if(!form.to || !form.from) return;

    // Buat URL yang bersih
    const baseUrl = BASE_URL; 
    const nameParam = form.to.replace(/\s+/g, '-'); // Ganti spasi nama jadi strip
    
    let finalUrl = `${baseUrl}/${nameParam}?from=${encodeURIComponent(form.from)}`;
    
    if(form.msg) {
        finalUrl += `&msg=${encodeURIComponent(form.msg)}`;
    }

    setGeneratedLink(finalUrl);
  };

  const resetGenerator = () => {
    setGeneratedLink('');
    setForm(prev => ({ ...prev, to: '' })); // Reset nama penerima saja, pengirim & pesan biarkan
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link kartu berhasil disalin ✨");
  };

  const shareToWA = () => {
    const text = `Hi ${form.to} 👋  
Aku punya kartu ucapan digital spesial buat kamu.  
Buka di sini ya ✨  
${generatedLink}
`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- KOMPONEN VISUAL ---
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
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 text-white font-sans overflow-hidden relative">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) translateX(0px); opacity: 0.8; }
          100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
        }
        .animate-fall { animation: fall linear infinite; }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .font-serif-display { font-family: 'Times New Roman', serif; }
      `}</style>

      <audio ref={audioRef} src={audioUrl} loop />

      {/* --- LAYAR BUKA (ENVELOPE) --- */}
      {!isOpen && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-900/95 transition-opacity duration-1000">
          <div onClick={handleOpen} className="cursor-pointer flex flex-col items-center animate-bounce">
            <Gift size={80} className="text-yellow-400 mb-4 drop-shadow-glow" />
            <p className="text-xl font-bold tracking-widest text-yellow-100">YOU HAVE A MESSAGE</p>
            <p className="text-sm mt-2 text-white/70">Tap to open</p>
          </div>
          
          {/* Credit di layar depan */}
          <div className="absolute bottom-10 text-white/30 text-xs flex items-center gap-1">
            <Instagram size={12} /> Created by @{CREATOR_IG}
          </div>
        </div>
      )}

      {/* --- MODAL GENERATOR (Pop Up) --- */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white text-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button onClick={() => setShowGenerator(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
                <h3 className="text-xl font-bold mb-1 text-red-700">Buat Kartu Ucapan Digital</h3>
                <p className="text-xs text-gray-500 mb-4">Isi detail di bawah, kami akan membuatkan link kartu spesial untukmu.</p>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Nama Pengirim</label>
                        <input type="text" placeholder="Contoh: Ken" className="w-full border p-2 rounded-lg text-sm bg-gray-50" 
                            value={form.from}
                            onChange={e => setForm({...form, from: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Nama Penerima</label>
                        <input type="text" placeholder="Contoh: Wina & Family" className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                            value={form.to}
                            onChange={e => setForm({...form, to: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Pesan (Opsional)</label>
                        <textarea placeholder="Pesan sudah disiapkan otomatis. Tulis di sini jika ingin menggantinya dengan ucapan versimu sendiri." className="w-full border p-2 rounded-lg text-sm bg-gray-50 h-20"
                            value={form.msg}
                            onChange={e => setForm({...form, msg: e.target.value})} />
                    </div>
                    
                    {!generatedLink ? (
                        <button onClick={generateLink} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">
                            Buat Link Kartunya ✨
                        </button>
                    ) : (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-200 animate-fade-in">
                            <p className="text-xs text-green-800 font-semibold mb-2">Link kartu berhasil dibuat 🎉</p>
                            <div className="flex gap-2 mb-2">
                                <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    <Copy size={14}/> Salin
                                </button>
                                <button onClick={shareToWA} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 shadow-md">
                                    <Send size={14}/> Kirim WA
                                </button>
                            </div>
                            <button onClick={resetGenerator} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition">
                                <PlusCircle size={14}/> Buat Kartu Lainnya
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className={`mt-4 relative z-10 min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-1000 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <Snowflakes />
        
        <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl text-center border-t-4 border-yellow-500 relative mb-20"> {/* mb-20 agar tidak ketutup tombol bawah */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-800 rounded-full p-3 shadow-lg border-2 border-yellow-500">
             <Sparkles className="text-yellow-300" size={32} />
          </div>

          <div className="mt-6 mb-2">
            <h3 className="text-yellow-200 tracking-[0.2em] text-xs uppercase font-bold mb-2">Season's Greetings</h3>
            <h1 className="font-serif-display text-4xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-red-100 drop-shadow-md">
              Merry<br/>Christmas
            </h1>
            <p className="font-serif-display text-2xl mt-1 text-yellow-400">2025</p>
          </div>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto my-6"></div>

          <div className="space-y-4">
            <p className="text-sm text-white/80 uppercase tracking-widest">To our dearest</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md min-h-[40px] capitalize">
              {data.to}
            </h2>
          </div>

          <div className="mt-8 mb-8 text-white/90 leading-relaxed font-light italic text-base md:text-lg">
            "{data.message}"
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-white/60 mb-1">Warmly,</p>
            <p className="text-xl font-bold font-serif-display tracking-wide text-yellow-200 capitalize">
              -- {data.from} --
            </p>
          </div>
        </div>

        {/* --- TOMBOL PORTFOLIO / VIRAL LOOP --- */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex flex-col items-center z-30 pointer-events-none">
            {/* Tombol Buat Sendiri (Pointer events auto agar bisa diklik) */}
            <button 
                onClick={() => setShowGenerator(true)}
                className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-white/20 transition-all mb-8 flex items-center gap-2"
            >
                <Share2 size={14} />
                Buat kartu ucapanmu sendiri
            </button>
            
            {/* Watermark Portfolio */}
            <a href={`https://instagram.com/${CREATOR_IG}`} target="_blank" rel="noreferrer" className="pointer-events-auto text-white/30 text-[10px] hover:text-white/80 transition-colors flex items-center gap-1 pb-2">
                <Instagram size={10} />
                Developed by @{CREATOR_IG}
            </a>
        </div>
      </div>

      {/* Tombol Musik */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-20 right-6 z-50 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white shadow-lg hover:bg-white/20 transition-all active:scale-90"
        >
          {isPlaying ? <Music size={24} className="text-green-300" /> : <VolumeX size={24} className="text-red-300" />}
        </button>
      )}
    </div>
  );
}