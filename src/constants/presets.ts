// src/constants/presets.ts
import { NoteData } from '../types';

export interface PresetMelody {
  id: string;
  title: string;
  category: 'Chorus' | 'Verse' | 'Chill';
  description: string;
  bpm: number;
  bars: 4 | 8;
  notes: NoteData[];
}

export const PRESET_MELODIES: PresetMelody[] = [
  
  {
    id: "demo-1",
    title: "カノンメロディ (8小節)",
    category: "Verse",
    description: "8小節をフルに使った長尺のメロディ。シンプルな進行から壮大な展開まで試せます。",
    bpm: 110,
    bars: 8,
    notes: [
      { midiNote: 67, col: 16, duration: 2 }, { midiNote: 64, col: 20, duration: 2 },
      { midiNote: 65, col: 22, duration: 2 }, { midiNote: 67, col: 24, duration: 2 },
      { midiNote: 64, col: 28, duration: 2 }, { midiNote: 65, col: 30, duration: 2 },
      { midiNote: 67, col: 32, duration: 2 }, { midiNote: 55, col: 34, duration: 2 },
      { midiNote: 57, col: 36, duration: 2 }, { midiNote: 59, col: 38, duration: 2 },
      { midiNote: 60, col: 40, duration: 2 }, { midiNote: 62, col: 42, duration: 2 },
      { midiNote: 64, col: 44, duration: 2 }, { midiNote: 65, col: 46, duration: 2 },
      { midiNote: 64, col: 48, duration: 2 }, { midiNote: 60, col: 52, duration: 2 },
      { midiNote: 62, col: 54, duration: 2 }, { midiNote: 64, col: 56, duration: 2 },
      { midiNote: 52, col: 60, duration: 2 }, { midiNote: 53, col: 62, duration: 2 },
      { midiNote: 55, col: 64, duration: 2 }, { midiNote: 57, col: 66, duration: 2 },
      { midiNote: 55, col: 68, duration: 2 }, { midiNote: 53, col: 70, duration: 2 },
      { midiNote: 55, col: 72, duration: 2 }, { midiNote: 60, col: 74, duration: 2 },
      { midiNote: 59, col: 76, duration: 2 }, { midiNote: 60, col: 78, duration: 2 },
      { midiNote: 57, col: 80, duration: 2 }, { midiNote: 60, col: 84, duration: 2 },
      { midiNote: 59, col: 86, duration: 2 }, { midiNote: 57, col: 88, duration: 2 },
      { midiNote: 55, col: 92, duration: 2 }, { midiNote: 53, col: 94, duration: 2 },
      { midiNote: 55, col: 96, duration: 2 }, { midiNote: 53, col: 98, duration: 2 },
      { midiNote: 52, col: 100, duration: 2 }, { midiNote: 53, col: 102, duration: 2 },
      { midiNote: 55, col: 104, duration: 2 }, { midiNote: 57, col: 106, duration: 2 },
      { midiNote: 59, col: 108, duration: 2 }, { midiNote: 60, col: 110, duration: 2 },
      { midiNote: 57, col: 112, duration: 2 }, { midiNote: 60, col: 116, duration: 2 },
      { midiNote: 59, col: 118, duration: 2 }, { midiNote: 60, col: 120, duration: 2 },
      { midiNote: 59, col: 124, duration: 2 }, { midiNote: 57, col: 126, duration: 2 },
      { midiNote: 59, col: 128, duration: 2 }, { midiNote: 60, col: 130, duration: 2 },
      { midiNote: 62, col: 132, duration: 2 }, { midiNote: 60, col: 134, duration: 2 },
      { midiNote: 59, col: 136, duration: 2 }, { midiNote: 60, col: 138, duration: 2 },
      { midiNote: 57, col: 140, duration: 2 }, { midiNote: 59, col: 142, duration: 2 }
    ]
  }
];