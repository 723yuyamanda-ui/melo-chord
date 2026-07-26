// src/constants/music.ts

export const NOTES_C_MAJOR = [
  "B5","A5","G5","F5","E5","D5","C5",
  "B4","A4","G4","F4","E4","D4","C4",
  "B3","A3","G3","F3","E3","D3","C3"
];
export const KANA_NOTES = [
  "高シ","高ラ","高ソ","高ファ","高ミ","高レ","高ド",
  "シ","ラ","ソ","ファ","ミ","レ","ド",
  "低シ","低ラ","低ソ","低ファ","低ミ","低レ","低ド"
];
export const ALL_NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export const CHORD_TYPES: Record<string, number[]> = {
  '': [0, 4, 7], 'm': [0, 3, 7], 'sus4': [0, 5, 7], 'add9': [0, 4, 7, 14],
  'M7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], '7': [0, 4, 7, 10], 'dim': [0, 3, 6], 'm6': [0, 3, 7, 9]
};

export const getNoteIndex = (noteName: string) => ALL_NOTES.indexOf(noteName.replace(/\d/g, ''));

let lastRightHandMidiAverage: number | null = null;

export const resetVoicingCache = () => {
  lastRightHandMidiAverage = null;
};

export const getChordNotes = (chordName: string, baseOctave: number = 3) => {
  if (chordName === '-' || !chordName) return null;
  const [chord, slash] = chordName.split('/');
  let root = chord[1] === '#' || chord[1] === 'b' ? chord.slice(0, 2) : chord.slice(0, 1);
  let type = chord.slice(root.length);

  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_TYPES[type] || CHORD_TYPES[''];

  // ─── 左手（ベース：スラッシュ指定音を最優先低音として配置） ───
  const bassNoteName = slash ? slash : root;
  const bassIdx = getNoteIndex(bassNoteName);
  const bassNote = `${ALL_NOTES[bassIdx]}2`; // 最低音ルート
  const lhNotes = [bassNote];

  if (!slash && !type.includes('dim') && !type.includes('m7b5')) {
    const p5Idx = (rootIndex + 7) % 12;
    const p5Oct = (rootIndex + 7) >= 12 ? 3 : 2;
    lhNotes.push(`${ALL_NOTES[p5Idx]}${p5Oct}`);
  }

  // ─── 右手（インテリジェント・スムーズボイシング：特等席帯域 MIDI 48〜68） ───
  const inversionCandidates: string[][] = [];

  for (let shift = -1; shift <= 1; shift++) {
    const currentPattern = intervals.map(interval => {
      const noteIdx = (rootIndex + interval) % 12;
      let oct = baseOctave + shift;
      if (interval >= 12) oct += Math.floor(interval / 12);
      return `${ALL_NOTES[noteIdx]}${oct}`;
    });

    const avgMidiCheck = currentPattern.reduce((sum, note) => {
      const m = note.match(/([A-Z]#?)(\d)/);
      if (!m) return sum;
      return sum + (parseInt(m[2]) + 1) * 12 + ALL_NOTES.indexOf(m[1]);
    }, 0) / currentPattern.length;

    const adjustedPattern = currentPattern.map(note => {
      const m = note.match(/([A-Z]#?)(\d)/);
      if (!m) return note;
      let targetOct = parseInt(m[2]);
      if (avgMidiCheck < 48) targetOct++;
      if (avgMidiCheck > 68) targetOct--;
      return `${m[1]}${targetOct}`;
    });

    inversionCandidates.push(adjustedPattern);
  }

  let bestPattern = inversionCandidates[1];
  if (lastRightHandMidiAverage !== null) {
    let minDistance = 999;

    inversionCandidates.forEach(candidate => {
      const avgMidi = candidate.reduce((sum, note) => {
        const m = note.match(/([A-Z]#?)(\d)/);
        if (!m) return sum;
        return sum + (parseInt(m[2]) + 1) * 12 + ALL_NOTES.indexOf(m[1]);
      }, 0) / candidate.length;

      const dist = Math.abs(avgMidi - lastRightHandMidiAverage!);
      if (dist < minDistance) {
        minDistance = dist;
        bestPattern = candidate;
      }
    });
  }

  const finalAvgMidi = bestPattern.reduce((sum, note) => {
    const m = note.match(/([A-Z]#?)(\d)/);
    if (!m) return sum;
    return sum + (parseInt(m[2]) + 1) * 12 + ALL_NOTES.indexOf(m[1]);
  }, 0) / bestPattern.length;

  lastRightHandMidiAverage = finalAvgMidi;

  bestPattern.sort((a, b) => {
    const aM = a.match(/([A-Z]#?)(\d)/);
    const bM = b.match(/([A-Z]#?)(\d)/);
    if (!aM || !bM) return 0;
    const aMidi = (parseInt(aM[2]) + 1) * 12 + ALL_NOTES.indexOf(aM[1]);
    const bMidi = (parseInt(bM[2]) + 1) * 12 + ALL_NOTES.indexOf(bM[1]);
    return aMidi - bMidi;
  });

  const notes = Array.from(new Set([...lhNotes, ...bestPattern]));
  return { notes, bassNote, rootIndex };
};

export const transposeString = (noteName: string, semitones: number) => {
  const isChord = noteName.includes('/') || noteName.length > 2 || (noteName.length > 0 && !noteName.match(/\d/));
  if (isChord && noteName !== '-') {
    const [chord, slash] = noteName.split('/');
    let root = chord[1] === '#' || chord[1] === 'b' ? chord.slice(0, 2) : chord.slice(0, 1);
    const type = chord.slice(root.length);
    let rootIdx = (ALL_NOTES.indexOf(root) + semitones) % 12;
    if (rootIdx < 0) rootIdx += 12;
    let newChord = `${ALL_NOTES[rootIdx]}${type}`;
    if (slash) {
      let slashIdx = (ALL_NOTES.indexOf(slash) + semitones) % 12;
      if (slashIdx < 0) slashIdx += 12;
      newChord += `/${ALL_NOTES[slashIdx]}`;
    }
    return newChord;
  }
  const match = noteName.match(/([A-Z]#?)(\d)/);
  if (match) {
    let idx = ALL_NOTES.indexOf(match[1]);
    let oct = parseInt(match[2]);
    let total = idx + semitones;
    oct += Math.floor(total / 12);
    idx = total % 12;
    if (idx < 0) { idx += 12; oct -= 1; }
    return `${ALL_NOTES[idx]}${oct}`;
  }
  return noteName;
};

export const PIANO_KEYS = [
  { note: 'C', isBlack: false, offset: 0 },
  { note: 'C#', isBlack: true, offset: 1 },
  { note: 'D', isBlack: false, offset: 2 },
  { note: 'D#', isBlack: true, offset: 3 },
  { note: 'E', isBlack: false, offset: 4 },
  { note: 'F', isBlack: false, offset: 5 },
  { note: 'F#', isBlack: true, offset: 6 },
  { note: 'G', isBlack: false, offset: 7 },
  { note: 'G#', isBlack: true, offset: 8 },
  { note: 'A', isBlack: false, offset: 9 },
  { note: 'A#', isBlack: true, offset: 10 },
  { note: 'B', isBlack: false, offset: 11 }
];

export const getNoteNameFromMidi = (midiNote: number): string => {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${PIANO_KEYS[noteIndex].note}${octave}`;
};

// src/constants/music.ts の末尾等に追加

export const getGuitarChordNotes = (chordName: string) => {
  if (chordName === '-' || !chordName) return null;
  const [chord, slash] = chordName.split('/');
  let root = chord[1] === '#' || chord[1] === 'b' ? chord.slice(0, 2) : chord.slice(0, 1);
  let type = chord.slice(root.length);

  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_TYPES[type] || CHORD_TYPES[''];

  // ギター低音：ルートまたはオンコードベース音（オクターブ3）
  const bassNoteName = slash ? slash : root;
  const bassIdx = getNoteIndex(bassNoteName);
  const gtrBass = `${ALL_NOTES[bassIdx]}3`;

  // ギター高音部：構成音をオープンに配置
  const gtrNotes = intervals.map(interval => {
    const noteIdx = (rootIndex + interval) % 12;
    let oct = 3;
    if (interval >= 7) oct = 4;
    return `${ALL_NOTES[noteIdx]}${oct}`;
  });

  return { notes: Array.from(new Set([gtrBass, ...gtrNotes])) };
};