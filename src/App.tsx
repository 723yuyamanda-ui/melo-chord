// src/App.tsx の更新
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import InputSelectPage from './components/InputSelectPage';
import SimpleKeyboardInput from './components/SimpleKeyboardInput';
import ChordSuggestionPage from './components/ChordSuggestionPage';
import MidiEditor from './components/MidiEditor'; // ★ Mockから本物へ変更

export default function MusicApp() {
  return (
    <BrowserRouter>
      <div className="h-full w-full bg-black flex justify-center items-center overflow-hidden font-sans select-none relative">
        <div className="w-full max-w-[430px] h-full bg-gray-950 shadow-2xl relative text-white overflow-hidden sm:h-[90vh] sm:rounded-2xl sm:border sm:border-gray-800">
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/input-select" element={<InputSelectPage />} />
            <Route path="/keyboard" element={<SimpleKeyboardInput />} />
            <Route path="/suggest" element={<ChordSuggestionPage />} />
            <Route path="/editor" element={<MidiEditor />} /> {/* ★ 変更 */}
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}