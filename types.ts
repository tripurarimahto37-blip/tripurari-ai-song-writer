export interface SongSection {
  type: string; // e.g. "Verse 1", "Chorus", "Bridge", "Outro"
  text: string; // The lyrics content with line breaks
}

export interface SongMetadata {
  tempo: string;      // e.g., "Upbeat 120 BPM"
  mood: string;       // e.g., "Inspiring & Energetic"
  keySuggest: string; // e.g., "C Major"
}

export interface SongData {
  title: string;
  language: string;
  style: string;
  metadata: SongMetadata;
  sections: SongSection[];
}

export interface SongQuery {
  topic: string;
  language: string;
  style: string;
  length: string; // "1" | "3" | "5"
}

export interface SavedSong extends SongData {
  id: string;
  query: SongQuery;
  createdAt: string;
}
