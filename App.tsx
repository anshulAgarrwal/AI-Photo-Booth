import React, { useState, useEffect, useRef } from 'react';
import { AppState, HistoricalEra, GeneratedImage, AnalysisResult } from './types';
import CameraCapture from './components/CameraCapture';
import SceneSelector, { ERAS } from './components/SceneSelector';
import { generateTimeTravelImage, analyzeHistoricalAccuracy } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImage | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [editPrompt, setEditPrompt] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analysisEndRef = useRef<HTMLDivElement>(null);

  // Scroll to analysis when it arrives
  useEffect(() => {
    if (analysis && analysisEndRef.current) {
        analysisEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysis]);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setAppState(AppState.CAPTURING); // State where user selects era
  };

  const handleEraSelect = async (era: HistoricalEra) => {
    if (!capturedImage) return;

    setAppState(AppState.PROCESSING);
    setLoadingMessage(`Traveling to ${era.name}...`);
    setAnalysis(null);

    try {
      const resultImage = await generateTimeTravelImage(capturedImage, era.promptSuffix);
      
      setGeneratedResult({
        originalImage: capturedImage,
        currentImage: resultImage,
        era: era,
        history: ['Initial Generation']
      });
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      alert("Time travel failed! The portal destabilized. Please try again.");
      setAppState(AppState.CAPTURING);
    }
  };

  const handleEdit = async () => {
    if (!generatedResult || !editPrompt.trim()) return;

    const previousImage = generatedResult.currentImage;
    setAppState(AppState.PROCESSING);
    setLoadingMessage(`Refining reality: "${editPrompt}"...`);

    try {
      // We use the *current* image as the base for the edit to chain edits
      const newImage = await generateTimeTravelImage(
        previousImage, 
        generatedResult.era.promptSuffix, 
        editPrompt
      );

      setGeneratedResult({
        ...generatedResult,
        currentImage: newImage,
        history: [...generatedResult.history, editPrompt]
      });
      setEditPrompt("");
      setAppState(AppState.RESULT);
    } catch (error) {
       console.error(error);
       alert("Modification failed.");
       setAppState(AppState.RESULT);
    }
  };

  const handleAnalysis = async () => {
    if (!generatedResult) return;
    
    setAnalysis({ text: '', isLoading: true });
    
    try {
      const text = await analyzeHistoricalAccuracy(generatedResult.currentImage);
      setAnalysis({ text, isLoading: false });
    } catch (error) {
      console.error(error);
      setAnalysis({ text: "Analysis failed due to temporal interference.", isLoading: false });
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setCapturedImage(null);
    setGeneratedResult(null);
    setAnalysis(null);
    setEditPrompt("");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 bg-slate-900 border-b border-slate-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3" onClick={reset} role="button">
            <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
               CL
            </div>
            <h1 className="text-2xl font-bold historical-font tracking-wider text-amber-500 hidden sm:block">ChronoLens</h1>
          </div>
          {appState !== AppState.IDLE && (
            <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors">
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        
        {/* State: IDLE - Camera */}
        {appState === AppState.IDLE && (
          <div className="w-full space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold historical-font bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">
                Time Travel Photo Booth
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                Upload a selfie or use your camera to insert yourself into history using advanced Gemini AI.
              </p>
            </div>
            <CameraCapture onCapture={handleCapture} appState={appState} />
          </div>
        )}

        {/* State: CAPTURING - Select Era */}
        {appState === AppState.CAPTURING && capturedImage && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="flex flex-col items-center">
               <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-6">
                 <img src={capturedImage} alt="Source" className="w-full h-full object-cover" />
               </div>
               <p className="text-slate-300 mb-8">Photo acquired. Select your destination era:</p>
            </div>
            <SceneSelector onSelect={handleEraSelect} disabled={false} />
          </div>
        )}

        {/* State: PROCESSING */}
        {appState === AppState.PROCESSING && (
          <div className="text-center space-y-8 animate-pulse">
            <div className="relative w-48 h-48 mx-auto">
               <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-spin duration-[3s]"></div>
               <div className="absolute inset-2 border-4 border-indigo-500/30 rounded-full animate-spin duration-[2s] reverse"></div>
               <div className="absolute inset-4 border-4 border-slate-500/30 rounded-full animate-pulse"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-500 historical-font">{loadingMessage}</h3>
            <p className="text-slate-400">Generative AI is reconstructing history...</p>
          </div>
        )}

        {/* State: RESULT */}
        {appState === AppState.RESULT && generatedResult && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Left Col: Image Display */}
            <div className="space-y-6">
               <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700 aspect-[3/4] group">
                  <img 
                    src={generatedResult.currentImage} 
                    alt="Generated Time Travel" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <a 
                      href={generatedResult.currentImage} 
                      download={`chronolens-${generatedResult.era.id}.jpg`}
                      className="p-3 bg-slate-900/80 hover:bg-amber-600 text-white rounded-full backdrop-blur-sm transition-all"
                      title="Download"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                       </svg>
                     </a>
                  </div>
               </div>
               
               {/* Analysis Section (Gemini 3 Pro) */}
               <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Historical Analysis
                    </h3>
                    <button 
                      onClick={handleAnalysis}
                      disabled={analysis?.isLoading}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white disabled:opacity-50"
                    >
                      {analysis ? 'Re-Analyze' : 'Analyze Scene'}
                    </button>
                  </div>
                  
                  {analysis && (
                    <div className="text-sm text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-900/50 rounded" ref={analysisEndRef}>
                      {analysis.isLoading ? (
                         <div className="flex items-center gap-2 text-indigo-300">
                           <span className="animate-pulse">Consulting historical archives...</span>
                         </div>
                      ) : (
                        analysis.text
                      )}
                    </div>
                  )}
                  {!analysis && <p className="text-xs text-slate-500 italic">Use Gemini 3 Pro to verify the historical accuracy of your photo.</p>}
               </div>
            </div>

            {/* Right Col: Controls */}
            <div className="flex flex-col gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                 <h3 className="text-xl font-bold text-amber-500 mb-2 historical-font">{generatedResult.era.name}</h3>
                 <p className="text-slate-400 text-sm mb-6">{generatedResult.era.description}</p>
                 
                 <div className="space-y-4">
                   <label className="block text-sm font-medium text-slate-300">
                     Refine Result (Gemini 2.5 Flash Image)
                   </label>
                   <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Add a monocle', 'Make it sepia'"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-slate-600"
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                     />
                     <button 
                      onClick={handleEdit}
                      disabled={!editPrompt.trim()}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                     >
                       Edit
                     </button>
                   </div>
                   <p className="text-xs text-slate-500">
                     Type a command to modify the image using the Nano Banana model.
                   </p>
                 </div>
              </div>

              {/* History Log */}
              {generatedResult.history.length > 1 && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Modification Log</h4>
                  <ul className="space-y-2">
                    {generatedResult.history.map((entry, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-slate-600 font-mono">{idx + 1}.</span>
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-800">
                 <button 
                  onClick={() => setAppState(AppState.CAPTURING)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   Try Another Era
                 </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>Powered by Gemini 2.5 Flash Image & Gemini 3 Pro Preview</p>
      </footer>
    </div>
  );
};

export default App;