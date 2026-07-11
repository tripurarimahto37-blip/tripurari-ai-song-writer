import React, { useState, useEffect, useRef } from "react";
import { SavedSong, SongData, SongQuery } from "./types";
import Header from "./components/Header";
import SongForm from "./components/SongForm";
import SongDisplay from "./components/SongDisplay";
import SavedSongsList from "./components/SavedSongsList";
import SettingsModal from "./components/SettingsModal";
import { Sparkles, Library, Heart, AlertCircle, HelpCircle, ArrowRight, Music } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState<SongQuery>({
    topic: "",
    language: "Hindi",
    style: "Romantic",
    length: "3",
  });
  const [song, setSong] = useState<SongData | null>(null);
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  
  // Reference to lyrics display to scroll to it on small screens
  const lyricsSectionRef = useRef<HTMLDivElement>(null);

  // Load saved songs and API key from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tripurari_saved_songs");
      if (stored) {
        setSavedSongs(JSON.parse(stored));
      }
      
      const storedKey = localStorage.getItem("tripurari_gemini_api_key") || "";
      setCustomApiKey(storedKey);
    } catch (e) {
      console.error("Failed to load saved songs or keys:", e);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem("tripurari_gemini_api_key", key);
    setCustomApiKey(key);
  };

  // Save song helper
  const handleSaveSong = () => {
    if (!song) return;

    // Check if song is already saved (by title & style & language)
    const exists = savedSongs.find(
      (s) => s.title === song.title && s.style === song.style && s.language === song.language
    );

    if (exists) {
      // Remove it (toggle off)
      const updated = savedSongs.filter((s) => s.id !== exists.id);
      setSavedSongs(updated);
      localStorage.setItem("tripurari_saved_songs", JSON.stringify(updated));
      return;
    }

    // Save as new song
    const newSaved: SavedSong = {
      ...song,
      id: Date.now().toString(),
      query: { ...query },
      createdAt: new Date().toISOString(),
    };

    const updated = [newSaved, ...savedSongs];
    setSavedSongs(updated);
    localStorage.setItem("tripurari_saved_songs", JSON.stringify(updated));
  };

  // Delete saved song helper
  const handleDeleteSong = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSongs.filter((s) => s.id !== id);
    setSavedSongs(updated);
    localStorage.setItem("tripurari_saved_songs", JSON.stringify(updated));
    
    // If deleted song was currently loaded, clear current state selection
    const isCurrentlyLoaded = song && savedSongs.find(s => s.id === id)?.title === song.title;
    if (isCurrentlyLoaded) {
      setSong(null);
    }
  };

  // Load saved song into current view
  const handleSelectSong = (saved: SavedSong) => {
    setSong({
      title: saved.title,
      language: saved.language,
      style: saved.style,
      metadata: saved.metadata,
      sections: saved.sections,
    });
    setQuery(saved.query);
    setError(null);
    
    // Smooth scroll to lyrics
    setTimeout(() => {
      lyricsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Generate Song using our full-stack Express API route
  const handleGenerateSong = async () => {
    setIsLoading(true);
    setError(null);
    setSong(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customApiKey) {
        headers["x-gemini-api-key"] = customApiKey;
      }

      const res = await fetch("/api/generate-song", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(query),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const songData: SongData = await res.json();
      setSong(songData);

      // Scroll to lyrics section smoothly (helpful on mobile/tablets)
      setTimeout(() => {
        lyricsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while writing your song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if the current active song is in saved list
  const isCurrentSongSaved = song
    ? !!savedSongs.find(
        (s) => s.title === song.title && s.style === song.style && s.language === song.language
      )
    : false;

  return (
    <div className="text-slate-100 min-h-screen relative overflow-x-hidden font-sans select-none" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}>
      
      {/* Background Subtle Glowing Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={!!customApiKey}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-12 relative z-10">
        
        {/* Welcome Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold tracking-wider text-indigo-300 mb-3 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Vocal & Poetry AI Engine
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Compose Poetic & Beautiful Lyrics Instantly
          </h2>
          <p className="mt-3.5 text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans">
            Unleash your creativity. Choose a topic, select from native languages and musical genres, and let the AI build rhythmic, touching lyrics custom-made for your tunes.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Input Form + Saved Songs List (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Songwriting Parameters Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Music className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Compose New Track</h3>
              </div>
              
              <SongForm
                query={query}
                setQuery={setQuery}
                onGenerate={handleGenerateSong}
                isLoading={isLoading}
              />
            </div>

            {/* Saved Songs Panel */}
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Library className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">Saved Lyrics</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-indigo-300 border border-white/5">
                  {savedSongs.length} archived
                </span>
              </div>

              <SavedSongsList
                songs={savedSongs}
                onSelect={handleSelectSong}
                onDelete={handleDeleteSong}
                selectedId={song ? savedSongs.find(s => s.title === song.title)?.id || null : null}
              />
            </div>

          </div>

          {/* RIGHT SIDE: Output Display & Visualizers (7 Columns) */}
          <div ref={lyricsSectionRef} className="lg:col-span-7 space-y-6 scroll-mt-24">
            
            {/* Error Message Box */}
            {error && (
              <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex gap-3 text-sm leading-relaxed shadow-lg">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold font-display text-white mb-0.5">Composition Failed</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Song Generator Display Frame */}
            <div>
              {/* Spinner/Loading Screen */}
              {isLoading ? (
                <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center text-center p-8 shadow-2xl">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-slate-950 flex items-center justify-center border border-white/10">
                      <Music className="w-5 h-5 text-indigo-400 animate-bounce" />
                    </div>
                  </div>
                  
                  <h3 className="text-base font-bold font-display text-white tracking-wider uppercase">
                    Composing beautiful lyrics...
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed font-sans">
                    Tripurari AI is arranging structure, aligning rhyme schemes, and polishing poetic words.
                  </p>
                </div>
              ) : (
                <SongDisplay
                  song={song}
                  onSave={handleSaveSong}
                  isSaved={isCurrentSongSaved}
                />
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 mt-16 text-center text-[11px] text-slate-500 font-sans tracking-wide">
        <p>© {new Date().getFullYear()} Tripurari AI Song Writer. All rights reserved.</p>
        <p className="mt-1 opacity-70">Sleek Composer Workspace. Designed with modern minimalist interface elements.</p>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
      />

    </div>
  );
}
