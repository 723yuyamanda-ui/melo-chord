// src/constants/music.ts

// ピアノロール用に上から下へ（高音 B5 から 低音 C3 まで21音）
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
  'M7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], '7': [0, 4, 7, 10]
};

export const getNoteIndex = (noteName: string) => ALL_NOTES.indexOf(noteName.replace(/\d/g, ''));

export const getChordNotes = (chordName: string, baseOctave: number = 4) => {
  if (chordName === '-' || !chordName) return null;
  const [chord, slash] = chordName.split('/');
  let root = chord[1] === '#' || chord[1] === 'b' ? chord.slice(0, 2) : chord.slice(0, 1);
  let type = chord.slice(root.length);

  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_TYPES[type] || CHORD_TYPES[''];
  
  // --- 両手ボイシング（5音リッチ構成） ---
  
  // 1. 左手（ベース音・重低音）
  const bassNoteName = slash ? slash : root;
  const bassIdx = getNoteIndex(bassNoteName);
  const bassNote = `${ALL_NOTES[bassIdx]}2`;

  const lhNotes = [bassNote];
  // 左手5度（重低音の厚み追加）
  if (!slash && !type.includes('dim') && !type.includes('m7b5')) {
    const p5Idx = (rootIndex + 7) % 12;
    const p5Oct = (rootIndex + 7) >= 12 ? 3 : 2;
    lhNotes.push(`${ALL_NOTES[p5Idx]}${p5Oct}`);
  }

  // 2. 右手（中高音の和音・転回形）
  const rhOctave = 3;
  const rhNotes = intervals.map((interval, index) => {
    const noteIdx = (rootIndex + interval) % 12;
    let octOffset = Math.floor((rootIndex + interval) / 12);
    let oct = rhOctave + octOffset;

    if (intervals.length === 3 && index === 0) {
      oct += 1;
    }
    return `${ALL_NOTES[noteIdx]}${oct}`;
  });

  const notes = Array.from(new Set([...lhNotes, ...rhNotes])); 

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