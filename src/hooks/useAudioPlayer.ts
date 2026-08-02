// src/hooks/useAudioPlayer.ts
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { NoteData } from '../types';
import { getChordNotes, getGuitarChordNotes, getNoteNameFromMidi, transposeString, resetVoicingCache } from '../constants/music';

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

  // 生音音声再生用ノード（GrainPlayer + PitchShift）
  const userVoiceGrainPlayerRef = useRef<Tone.GrainPlayer | null>(null);
  const userVoicePitchShiftRef = useRef<Tone.PitchShift | null>(null);
  
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

      const chordEQ = new Tone.EQ3({
        low: -4,
        mid: +1.5,
        high: +2.0
      }).toDestination();

      const bassEQ = new Tone.EQ3({
        low: +2.5,
        mid: -2.0,
        high: -6.0
      }).toDestination();

      const melodyEQ = new Tone.EQ3({
        low: -2.0,
        mid: +1.0,
        high: +1.5
      }).toDestination();

      const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.12 }).toDestination();

      const melodySampler = new Tone.Sampler({
        urls: { "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3" },
        baseUrl: "/samples/vibraphone/",
        volume: -18
      }).connect(melodyEQ).connect(reverb);
      melodySamplerRef.current = melodySampler;

      const pianoSampler = new Tone.Sampler({
        urls: { 
          "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3",
          "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3",
          "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3"
        },
        baseUrl: "/samples/piano/",
        volume: -20
      }).connect(chordEQ).connect(reverb);
      (pianoSampler as any).polyphony = 32;
      pianoSamplerRef.current = pianoSampler;

      const guitarSampler = new Tone.Sampler({
        urls: { 
          "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3",
          "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3",
          "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3"
        },
        baseUrl: "/samples/guitar/",
        volume: -16
      }).connect(chordEQ).connect(reverb);
      (guitarSampler as any).polyphony = 32;
      guitarSamplerRef.current = guitarSampler;

      const bassSampler = new Tone.Sampler({
        urls: { 
          "C2": "C2.mp3", "E2": "E2.mp3", "G2": "G2.mp3",
          "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3"
        },
        baseUrl: "/samples/bass/",
        volume: -22
      }).connect(bassEQ);
      (bassSampler as any).polyphony = 12;
      bassSamplerRef.current = bassSampler;

      const drumSampler = new Tone.Sampler({
        urls: {
          "C1": "kick.mp3",
          "D1": "snare.mp3",
          "E1": "hihat.mp3"
        },
        baseUrl: "/samples/drums/",
        volume: -16
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

  const loadRecordedAudio = async (audioUrl: string): Promise<void> => {
    await ensureAudioContext();
    if (userVoiceGrainPlayerRef.current) {
      userVoiceGrainPlayerRef.current.dispose();
      userVoiceGrainPlayerRef.current = null;
    }
    if (userVoicePitchShiftRef.current) {
      userVoicePitchShiftRef.current.dispose();
      userVoicePitchShiftRef.current = null;
    }

    return new Promise((resolve) => {
      const pitchShift = new Tone.PitchShift(0).toDestination();
      const grainPlayer = new Tone.GrainPlayer(audioUrl, () => {
        resolve();
      }).connect(pitchShift);

      grainPlayer.grainSize = 0.1;
      grainPlayer.overlap = 0.05;

      userVoiceGrainPlayerRef.current = grainPlayer;
      userVoicePitchShiftRef.current = pitchShift;
    });
  };

  const setDynamicDetune = (currentTranspose: number) => {
    realtimeTransposeRef.current = currentTranspose;
    if (userVoicePitchShiftRef.current) {
      userVoicePitchShiftRef.current.pitch = currentTranspose;
    }
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

  // ★ 生音音声・伴奏同期演奏機能（マイク遅延ゼロ補正版）
  const startSyncPlayback = async (
    melodyGrid: NoteData[], 
    chordProgression: string[],
    onStepChange: (step: number) => void,
    initialTranspose: number = 0,
    bpm: number = 110,
    startStep: number = 16,
    maxStep: number = 80,
    audioUrl?: string
  ) => {
    await ensureAudioContext();
    if (!isReady) await initAudio();
    stopPlayback();
    resetVoicingCache(); 

    baseTransposeRef.current = initialTranspose;
    realtimeTransposeRef.current = initialTranspose;
    Tone.Transport.bpm.value = bpm;

    if (audioUrl) {
      await loadRecordedAudio(audioUrl);
    }

    let currentStep = startStep;
    const totalSteps = maxStep; 
    let lastValidChord = '';

    // ★ マイク録音時の入力遅延補正（0.08秒 ＝ 約80ms 前詰め再生）
    const LATENCY_COMPENSATION = 0.08;

    activeLoopRef.current = new Tone.Loop((time) => {
      if (currentStep === startStep) {
        if (userVoiceGrainPlayerRef.current && userVoicePitchShiftRef.current) {
          userVoicePitchShiftRef.current.pitch = realtimeTransposeRef.current;
          userVoiceGrainPlayerRef.current.playbackRate = bpm / 110; 
          userVoiceGrainPlayerRef.current.stop();

          // 遅延分を補正してジャストタイミングで再生！
          const playTime = Math.max(0, time - LATENCY_COMPENSATION);
          userVoiceGrainPlayerRef.current.start(playTime);
        }
      }

      if (currentStep >= totalSteps) {
        currentStep = startStep;
        if (userVoiceGrainPlayerRef.current) {
          userVoiceGrainPlayerRef.current.stop();
          const playTime = Math.max(0, time - LATENCY_COMPENSATION);
          userVoiceGrainPlayerRef.current.start(playTime);
        }
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

      if (!isMelodyMutedRef.current && !userVoiceGrainPlayerRef.current) {
        melodyGrid.forEach(note => {
          if (note.col === current16th && note.midiNote !== 0) {
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
          const guitarChordData = getGuitarChordNotes(activeChord);

          if (chordData) {
            const rightHandNotes = chordData.notes.filter(n => n !== chordData.bassNote);

            if (current16th % 4 === 0) {
              const pnoTiming = time + getHumanizedOffset(8);
              const gtrTiming = time + 0.012 + getHumanizedOffset(10); 

              if (pianoSamplerRef.current) {
                rightHandNotes.forEach((note, idx) => {
                  const baseV = idx === 0 ? 0.78 : 0.68 - (idx * 0.03);
                  const pnoVel = getHumanizedVelocity(baseV, 0.06) * duckingMultiplier;
                  pianoSamplerRef.current!.triggerAttackRelease(note, "4n", pnoTiming, pnoVel);
                });
              }

              if (guitarSamplerRef.current && guitarChordData) {
                guitarChordData.notes.forEach((note, idx) => {
                  const stringStrumDelay = idx * 0.016;
                  const gtrVel = getHumanizedVelocity(0.72, 0.05) * duckingMultiplier;
                  guitarSamplerRef.current!.triggerAttackRelease(
                    note, 
                    "4n", 
                    gtrTiming + stringStrumDelay, 
                    gtrVel
                  );
                });
              }
            }

            if ((current16th % 4 === 0 || current16th % 8 === 6) && bassSamplerRef.current) {
              const bassTiming = time + getHumanizedOffset(6) - 0.003; 
              const isDownBeat = current16th % 8 === 0;
              const bassVel = getHumanizedVelocity(isDownBeat ? 0.82 : 0.62, 0.05); 
              bassSamplerRef.current.triggerAttackRelease(chordData.bassNote, "8n", bassTiming, bassVel);
            }
          }
        }
      }

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
    if (userVoiceGrainPlayerRef.current) {
      userVoiceGrainPlayerRef.current.stop();
    }
    resetVoicingCache(); 
    setDynamicDetune(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        if (Tone.context.state !== 'running') {
          try {
            await Tone.start();
            await Tone.context.resume();
          } catch (e) {
            console.error('AudioContext復帰に失敗しました:', e);
          }
        }
      }
    };

    const handlePageShow = async (event: PageTransitionEvent) => {
      if (event.persisted || Tone.context.state !== 'running') {
        try {
          await Tone.start();
          await Tone.context.resume();
        } catch (e) {
          console.error('PageShowによるAudioContext復帰失敗:', e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => { 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      Tone.Transport.stop(); 
    };
  }, []);

  return {
    isReady, isLoading, isPlaying, isMelodyMuted, setIsMelodyMuted, initAudio, playSingleNote,
    startMelodyPreview, startSyncPlayback, stopPlayback, setDynamicDetune, loadRecordedAudio
  };
}