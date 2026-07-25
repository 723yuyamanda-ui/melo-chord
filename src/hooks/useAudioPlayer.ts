// src/hooks/useAudioPlayer.ts
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { NoteData } from '../types';
import { getChordNotes, getNoteNameFromMidi, transposeString, resetVoicingCache } from '../constants/music';

const ensureAudioContext = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }
  };

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);     
  const [isLoading, setIsLoading] = useState(false); 
  const [isMelodyMuted, setIsMelodyMutedState] = useState(false);
  
  const isMelodyMutedRef = useRef(false);

  const setIsMelodyMuted = (muted: boolean) => {
    setIsMelodyMutedState(muted);
    isMelodyMutedRef.current = muted;
  };
  
  const melodySamplerRef = useRef<Tone.Sampler | null>(null);
  const pianoSamplerRef = useRef<Tone.Sampler | null>(null);
  const guitarSamplerRef = useRef<Tone.Sampler | null>(null);
  const bassSamplerRef = useRef<Tone.Sampler | null>(null);
  const drumSamplerRef = useRef<Tone.Sampler | null>(null);
  
  const globalReverbRef = useRef<Tone.Reverb | null>(null);
  const activeLoopRef = useRef<Tone.Loop | null>(null);

  const baseTransposeRef = useRef(0);
  const realtimeTransposeRef = useRef(0);

  const getHumanizedOffset = (maxMs: number = 12) => {
    return (Math.random() - 0.5) * (maxMs / 1000);
  };

  const getHumanizedVelocity = (baseVelocity: number, range: number = 0.1) => {
    return Math.max(0.2, Math.min(1.0, baseVelocity + (Math.random() - 0.5) * range));
  };

  const initAudio = async () => {
    if (isReady || isLoading) return;
    setIsLoading(true);

    try {
      await Tone.start();

      const reverb = new Tone.Reverb({
        decay: 1.6, 
        preDelay: 0.01,
        wet: 0.22
      }).toDestination();
      globalReverbRef.current = reverb;

      const melodySampler = new Tone.Sampler({
        urls: { "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3" },
        baseUrl: "/samples/vibraphone/",
        volume: -17
      }).connect(reverb);
      (melodySampler as any).polyphony = 32; 
      melodySamplerRef.current = melodySampler;

      const pianoSampler = new Tone.Sampler({
        urls: { "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3" },
        baseUrl: "/samples/piano/",
        volume: -14
      }).connect(reverb);
      (pianoSampler as any).polyphony = 32; 
      pianoSamplerRef.current = pianoSampler;

      const guitarSampler = new Tone.Sampler({
        urls: { "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3" },
        baseUrl: "/samples/guitar/",
        volume: -16
      }).connect(reverb);
      (guitarSampler as any).polyphony = 32; 
      guitarSamplerRef.current = guitarSampler;

      const bassSampler = new Tone.Sampler({
        urls: { "C2": "C2.mp3", "C3": "C3.mp3" },
        baseUrl: "/samples/bass/",
        volume: -13
      }).toDestination().connect(reverb);
      (bassSampler as any).polyphony = 12; 
      bassSamplerRef.current = bassSampler;

      const drumSampler = new Tone.Sampler({
        urls: { "C1": "kick.mp3", "D1": "snare.mp3", "E1": "hihat.mp3" },
        baseUrl: "/samples/drums/",
        volume: -15
      }).toDestination(); 
      (drumSampler as any).polyphony = 16; 
      drumSamplerRef.current = drumSampler;

      await Tone.loaded();
      setIsReady(true);
    } catch (error) {
      console.error("オーディオサンプルの読み込みに失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setDynamicDetune = (currentTranspose: number) => {
    realtimeTransposeRef.current = currentTranspose;
  };

  const playSingleNote = async (noteName: string) => {
    if (!isReady) {
      await initAudio();
      return; 
    }
    if (melodySamplerRef.current) {
      melodySamplerRef.current.triggerAttackRelease(noteName, '8n', Tone.now() + getHumanizedOffset(5));
    }
  };

  // ★ 改修: maxStep (4小節:80 / 8小節:144) による動的プレビュー制御
  const startMelodyPreview = async (
    melodyGrid: NoteData[], 
    maxStep: number = 80, 
    bpm: number = 110, 
    onStepChange: (step: number | null) => void, 
    startStep: number = 0
  ) => {
    await ensureAudioContext();
    if (!isReady) await initAudio();
    stopPlayback();
    Tone.Transport.bpm.value = bpm;
    
    let currentStep = startStep;

    activeLoopRef.current = new Tone.Loop((time) => {
      if (currentStep >= maxStep) {
        currentStep = startStep;
      }
      
      const current16th = currentStep;
      Tone.Draw.schedule(() => { onStepChange(current16th); }, time);

      melodyGrid.forEach(note => {
        if (note.col === current16th && note.midiNote !== 0) {
          const rawNote = getNoteNameFromMidi(note.midiNote);
          if (rawNote && melodySamplerRef.current) {
            const timeOffset = time + getHumanizedOffset(8);
            melodySamplerRef.current.triggerAttackRelease(rawNote, note.duration * 0.125, timeOffset);
          }
        }
      });
      currentStep += 2;
    }, "8n");

    activeLoopRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

  // ★ 改修: maxStep (4小節:80 / 8小節:144) による動的同期演奏制御
  const startSyncPlayback = async (
    melodyGrid: NoteData[], 
    chordProgression: string[],
    onStepChange: (step: number) => void,
    initialTranspose: number = 0,
    bpm: number = 110,
    startStep: number = 16,
    maxStep: number = 80
  ) => {
    await ensureAudioContext();
    if (!isReady) await initAudio();
    stopPlayback();
    resetVoicingCache(); 

    baseTransposeRef.current = initialTranspose;
    realtimeTransposeRef.current = initialTranspose;
    Tone.Transport.bpm.value = bpm;

    let currentStep = startStep;
    const totalSteps = maxStep; 
    let lastValidChord = '';

    activeLoopRef.current = new Tone.Loop((time) => {
      if (currentStep >= totalSteps) {
        currentStep = startStep;
      }

      const current16th = currentStep;
      const adjusted16th = current16th - 16;
      const chordSlot = Math.floor(adjusted16th / 8);
      const delta = realtimeTransposeRef.current - baseTransposeRef.current;

      Tone.Draw.schedule(() => {
        onStepChange(current16th);
      }, time);

      const hasMelodyOnThisStep = melodyGrid.some(n => n.col === current16th && n.midiNote !== 0);
      const duckingMultiplier = (hasMelodyOnThisStep && !isMelodyMutedRef.current) ? 0.85 : 1.0;

      // 1. メロディ再生
      if (!isMelodyMutedRef.current) {
        melodyGrid.forEach(note => {
          if (note.col === current16th && note.midiNote !== 0) {
            // ★ 修正点: MIDI番号に対して直接 delta を足すことで絶対確実に正しい移調音を作る
            const shiftedMidiNote = note.midiNote + delta;
            const rawNote = getNoteNameFromMidi(shiftedMidiNote);
            
            if (rawNote && melodySamplerRef.current) {
              const mldTiming = time + getHumanizedOffset(4); 
              const mldVel = getHumanizedVelocity(0.92, 0.04); 
              melodySamplerRef.current.triggerAttackRelease(rawNote, note.duration * 0.125, mldTiming, mldVel);
            }
          }
        });
      }

      // 2. 伴奏演奏
      if (adjusted16th >= 0) {
        if (current16th % 8 === 0) {
          const incomingChord = chordProgression[chordSlot];
          if (incomingChord && incomingChord !== '-') {
            lastValidChord = incomingChord;
          }
        }

        if (lastValidChord) {
          let activeChord = lastValidChord;
          if (delta !== 0) activeChord = transposeString(activeChord, delta);

          const chordData = getChordNotes(activeChord, 4);
          if (chordData) {
            const rightHandNotes = chordData.notes.filter(n => n !== chordData.bassNote);

            if (current16th % 4 === 0) {
              const pnoTiming = time + getHumanizedOffset(10);
              const gtrTiming = time + 0.016 + getHumanizedOffset(12); 

              const humanizedRhNotes = rightHandNotes.map((_, idx) => {
                const baseV = idx === 0 ? 0.80 : 0.70 - (idx * 0.04);
                return getHumanizedVelocity(baseV, 0.08) * duckingMultiplier;
              });

              if (pianoSamplerRef.current) {
                rightHandNotes.forEach((note, idx) => {
                  pianoSamplerRef.current!.triggerAttackRelease(note, "4n", pnoTiming, humanizedRhNotes[idx]);
                });
              }
              if (guitarSamplerRef.current) {
                rightHandNotes.forEach((note, idx) => {
                  const stringStrumDelay = idx * 0.012; 
                  guitarSamplerRef.current!.triggerAttackRelease(note, "4n", gtrTiming + stringStrumDelay, humanizedRhNotes[idx] * 0.85);
                });
              }
            }

            if ((current16th % 4 === 0 || current16th % 8 === 6) && bassSamplerRef.current) {
              const bassTiming = time + getHumanizedOffset(8) - 0.003; 
              const isDownBeat = current16th % 8 === 0;
              const bassVel = getHumanizedVelocity(isDownBeat ? 0.80 : 0.60, 0.06); 
              bassSamplerRef.current.triggerAttackRelease(chordData.bassNote, "8n", bassTiming, bassVel);
            }
          }
        }
      }

      // 3. ドラム
      if (adjusted16th >= 0 && drumSamplerRef.current) {
        if (adjusted16th % 8 === 0 || adjusted16th % 16 === 10 || adjusted16th % 16 === 12) {
          const kickVel = getHumanizedVelocity(current16th % 8 === 0 ? 0.90 : 0.70, 0.04);
          drumSamplerRef.current.triggerAttackRelease('C1', '8n', time, kickVel);
        }
        if (adjusted16th % 8 === 4) {
          const snareVel = getHumanizedVelocity(0.85, 0.05);
          drumSamplerRef.current.triggerAttackRelease('D1', '8n', time + getHumanizedOffset(4), snareVel);
        }
        if (current16th % 2 === 0) {
          const isAccent = current16th % 4 === 0;
          const hihatVel = getHumanizedVelocity(isAccent ? 0.50 : 0.28, 0.08);
          drumSamplerRef.current.triggerAttackRelease('E1', '16n', time + getHumanizedOffset(6), hihatVel);
        }
      }

      currentStep++;
    }, "16n");

    Tone.Transport.loop = false;

    activeLoopRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    if (activeLoopRef.current) {
      activeLoopRef.current.dispose();
      activeLoopRef.current = null;
    }
    resetVoicingCache(); 
    setDynamicDetune(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => { 
      Tone.Transport.stop(); 
    };
  }, []);

  return {
    isReady, isLoading, isPlaying, isMelodyMuted, setIsMelodyMuted, initAudio, playSingleNote,
    startMelodyPreview, startSyncPlayback, stopPlayback, setDynamicDetune
  };
}