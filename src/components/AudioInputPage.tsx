// src/components/AudioInputPage.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, Upload, ArrowLeft, Sparkles, Volume2, 
  Plus, Minus, CheckCircle2 
} from "lucide-react";
import { AudioAnalyzerCore, convertPitchHistoryToMelodyGrid } from "../lib/AudioAnalyzerCore";
import * as Pitchy from "pitchy";
import * as Tone from "tone";
import { AnalysisResult } from "../types";

export default function AudioInputPage() {
  const navigate = useNavigate();

  const [bpm, setBpm] = useState<number>(110);
  const [measures, setMeasures] = useState<number>(4);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyzerCoreRef = useRef<AudioAnalyzerCore>(new AudioAnalyzerCore());
  const animationFrameIdRef = useRef<number | null>(null);
  const clickSynthRef = useRef<Tone.Synth | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // ─── 1. 事前マイク起動 ＆ カウントダウン録音処理 ───
  const handleStartRecording = async () => {
    setAnalysisResult(null);
    setAudioUrl(null);
    analyzerCoreRef.current.reset();

    // 1. Tone.js AudioContext の起動
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }

    // 2. クリック音用シンセの初期化
    if (!clickSynthRef.current) {
      clickSynthRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
      }).toDestination();
      clickSynthRef.current.volume.value = -12;
    }

    // 3. 【ラグ対策】カウントダウン前にあらかじめマイクとMediaRecorderを起動してウォーミングアップ！
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const chunks: BlobPart[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };

      // 4. 予備拍カウントダウン開始
      let count = 4;
      setCountdown(count);
      const intervalMs = (60 / bpm) * 1000;

      if (clickSynthRef.current) {
        clickSynthRef.current.triggerAttackRelease("C6", "16n");
      }

      const countInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          if (clickSynthRef.current) {
            const note = count === 4 ? "C6" : "C5";
            clickSynthRef.current.triggerAttackRelease(note, "16n");
          }
        } else {
          clearInterval(countInterval);
          setCountdown(null);
          
          // カウントダウン終了と同時に録音＆解析ループを一瞬の遅延もなくスタート！
          startRecordingSession(ctx, analyser, mediaRecorder, stream);
        }
      }, intervalMs);

    } catch (err) {
      console.error("マイクアクセスエラー:", err);
      alert("マイクへのアクセスが拒否されたか、利用できません。");
    }
  };

  const startRecordingSession = (
    ctx: AudioContext, 
    analyser: AnalyserNode, 
    mediaRecorder: MediaRecorder, 
    stream: MediaStream
  ) => {
    mediaRecorder.start();
    setIsRecording(true);

    const detector = Pitchy.PitchDetector.forFloat32Array(analyser.fftSize);
    const inputBuffer = new Float32Array(detector.inputLength);
    const startTime = ctx.currentTime;

    // 録音中のクリック音（メトロノーム）
    const beatInterval = 60 / bpm;
    const totalBeats = measures * 4;
    let currentBeat = 0;

    const clickIntervalId = setInterval(() => {
      currentBeat++;
      if (currentBeat < totalBeats && clickSynthRef.current) {
        const note = currentBeat % 4 === 0 ? "C6" : "C5";
        clickSynthRef.current.triggerAttackRelease(note, "16n");
      } else if (currentBeat >= totalBeats) {
        clearInterval(clickIntervalId);
      }
    }, beatInterval * 1000);

    const processAudio = () => {
      analyser.getFloatTimeDomainData(inputBuffer);
      const [pitch, clarity] = detector.findPitch(inputBuffer, ctx.sampleRate);

      const relativeTimestamp = ctx.currentTime - startTime;
      analyzerCoreRef.current.addFrame(pitch, clarity, relativeTimestamp);
      animationFrameIdRef.current = requestAnimationFrame(processAudio);
    };

    processAudio();

    const durationMs = measures * 4 * (60 / bpm) * 1000;
    setTimeout(() => {
      clearInterval(clickIntervalId);
      stopRecording(stream);
    }, durationMs);
  };

  const stopRecording = (stream: MediaStream) => {
    setIsRecording(false);
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) audioContextRef.current.close();
    stream.getTracks().forEach((track) => track.stop());

    const result = analyzerCoreRef.current.analyze();
    setAnalysisResult(result);
  };

  // ─── 2. ファイルアップロード解析処理 ───
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzingFile(true);
    setAnalysisResult(null);
    const blobUrl = URL.createObjectURL(file);
    setAudioUrl(blobUrl);
    analyzerCoreRef.current.reset();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0);
      const windowSize = 2048;
      const hopSize = 512;

      const detector = Pitchy.PitchDetector.forFloat32Array(windowSize);

      for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        const chunk = channelData.subarray(i, i + windowSize);
        const [pitch, clarity] = detector.findPitch(chunk, sampleRate);
        const timestamp = i / sampleRate;

        analyzerCoreRef.current.addFrame(pitch, clarity, timestamp);
      }

      ctx.close();
      const result = analyzerCoreRef.current.analyze();
      setAnalysisResult(result);
    } catch (err) {
      console.error("ファイル解析エラー:", err);
      alert("ファイルの読み込み・解析に失敗しました。");
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // ─── 3. コード提案画面へ移動 ───
  const handleGoToSuggestions = () => {
    if (!analysisResult) return;

    const melodyGrid = convertPitchHistoryToMelodyGrid(
      analysisResult.pitchHistory,
      bpm,
      measures
    );

    navigate('/suggest', {
      state: {
        melodyGrid,
        bpm,
        bars: measures,
        audioUrl,
        // 解析された推定キーをそのまま提案画面へ渡す
        detectedKeyName: analysisResult.estimatedKey,
        keyTimestamp: Date.now()
      }
    });
  };

  return (
    <div className="h-full w-full bg-gray-950 text-white flex flex-col p-4 lg:p-8 select-none relative overflow-y-auto scrollbar-none">
      
      {/* ヘッダー */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <button 
          onClick={() => navigate('/')} 
          className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-black text-sm lg:text-base text-teal-400 flex items-center gap-1.5">
          <Mic size={18} /> 鼻歌・生音録音解析
        </span>
        <div className="w-8" />
      </div>

      <div className="max-w-md w-full mx-auto flex flex-col gap-6 my-auto py-6">
        
        {/* 設定エリア（テンポ ＆ 小節数） */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">録音テンポ (BPM)</span>
            <div className="flex items-center gap-3 bg-gray-950 border border-white/10 rounded-xl px-2 py-1">
              <button 
                onClick={() => setBpm((b) => Math.max(60, b - 5))}
                className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 active:scale-95 transition-all"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-mono font-black text-amber-400 w-8 text-center">{bpm}</span>
              <button 
                onClick={() => setBpm((b) => Math.min(200, b + 5))}
                className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 active:scale-95 transition-all"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-xs font-bold text-gray-400">小節数</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMeasures(4)}
                className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                  measures === 4 
                    ? "bg-teal-500 text-gray-950 border-teal-400 shadow-md" 
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                4小節
              </button>
              <button
                onClick={() => setMeasures(8)}
                className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                  measures === 8 
                    ? "bg-teal-500 text-gray-950 border-teal-400 shadow-md" 
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                8小節
              </button>
            </div>
          </div>
        </div>

        {/* 録音アクションエリア */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
          {countdown !== null ? (
            <div className="py-6 flex flex-col items-center gap-2 animate-pulse">
              <span className="text-6xl font-black text-amber-400 font-mono">{countdown}</span>
              <span className="text-xs font-bold text-teal-300">マイク準備完了！クリック音に合わせてスタート...</span>
            </div>
          ) : isRecording ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-ping">
                <Mic size={28} className="text-red-500" />
              </div>
              <span className="text-sm font-black text-red-400 tracking-wider uppercase animate-pulse">
                録音中... ({measures}小節)
              </span>
              <p className="text-[11px] text-gray-400">リズム（クリック音）に合わせて歌ってください</p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleStartRecording}
                disabled={isAnalyzingFile}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 rounded-2xl font-black text-sm lg:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-red-600/20 text-white border border-red-400/20"
              >
                <Mic size={20} />
                <span>録音を開始する（予備拍あり）</span>
              </button>

              <label className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
                <Upload size={15} className="text-teal-400" />
                <span>音声ファイルをアップロード (MP3/WAV)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isAnalyzingFile}
                />
              </label>
            </div>
          )}

          {isAnalyzingFile && (
            <p className="text-xs font-bold text-teal-400 animate-pulse">ファイルを解析中...</p>
          )}
        </div>

        {/* 音声試聴 */}
        {audioUrl && !isRecording && (
          <div className="bg-gray-950 border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-md">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Volume2 size={15} className="text-amber-400" /> 録音音声の試聴
            </span>
            <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
          </div>
        )}

        {/* 解析結果表示 */}
        {analysisResult && (
          <div className="bg-gradient-to-b from-gray-900/90 to-teal-950/40 border border-teal-500/30 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> 解析完了
              </span>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                キー: {analysisResult.estimatedKey}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">検出された主要音:</span>
                <span className="font-mono font-bold text-gray-200">
                  {analysisResult.detectedNotes.join(", ") || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">よく響いていた音:</span>
                <span className="font-mono font-bold text-teal-300">
                  {analysisResult.sustainedNotes.join(", ") || "-"}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoToSuggestions}
              className="w-full mt-2 py-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 rounded-2xl font-black text-sm text-gray-950 flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98]"
            >
              <Sparkles size={18} />
              <span>この音からコード進行を探す！</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}