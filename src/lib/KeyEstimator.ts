// src/lib/KeyEstimator.ts

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 2.69, 3.34, 3.17, 3.28];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES_JP = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"];

export interface KeyEstimationResult {
  key: string;
  confidence: number;
}

export class KeyEstimator {
  /**
   * 12音階の出現ウェイト（クロマグラム）からキーを推定
   */
  public static estimateKey(chroma: number[]): KeyEstimationResult {
    const total = chroma.reduce((a, b) => a + b, 0);
    if (total === 0) return { key: "不明", confidence: 0 };

    const normChroma = chroma.map((v) => v / total);
    let bestScore = -Infinity;
    let estimatedKey = "";

    for (let shift = 0; shift < 12; shift++) {
      // Major
      const majProfileShifted = this.rotate(MAJOR_PROFILE, shift);
      const majScore = this.cosineSimilarity(normChroma, majProfileShifted);
      if (majScore > bestScore) {
        bestScore = majScore;
        estimatedKey = `${NOTE_NAMES[shift]} Major`;
      }

      // Minor
      const minProfileShifted = this.rotate(MINOR_PROFILE, shift);
      const minScore = this.cosineSimilarity(normChroma, minProfileShifted);
      if (minScore > bestScore) {
        bestScore = minScore;
        estimatedKey = `${NOTE_NAMES[shift]} Minor`;
      }
    }

    return {
      key: estimatedKey,
      confidence: Math.max(0, Math.min(1, bestScore)),
    };
  }

  private static rotate(arr: number[], steps: number): number[] {
    return arr.slice(steps).concat(arr.slice(0, steps));
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }

  public static pitchToNoteNameJP(pitchHz: number): string {
    if (pitchHz <= 0) return "";
    const midi = Math.round(69 + 12 * Math.log2(pitchHz / 440));
    const noteIndex = (midi % 12 + 12) % 12;
    return NOTE_NAMES_JP[noteIndex];
  }

  public static pitchToNoteIndex(pitchHz: number): number {
    if (pitchHz <= 0) return -1;
    const midi = Math.round(69 + 12 * Math.log2(pitchHz / 440));
    return (midi % 12 + 12) % 12;
  }
}