import React, { useState, useEffect, useRef } from 'react';
import { AppState, StyleOption, GeneratedImage, AnalysisResult } from './types';
import CameraCapture from './components/CameraCapture';
import SceneSelector from './components/SceneSelector';
import { generateTimeTravelImage, analyzeHistoricalAccuracy } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImage | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [editPrompt, setEditPrompt] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analysisEndRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Scroll to analysis when it arrives
  useEffect(() => {
    if (analysis && analysisEndRef.current) {
        analysisEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysis]);

  // Scroll thumbnails to end on new generation
  useEffect(() => {
    if (generatedResult?.steps && thumbnailsRef.current) {
      thumbnailsRef.current.scrollLeft = thumbnailsRef.current.scrollWidth;
    }
  }, [generatedResult?.steps]);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setAppState(AppState.CAPTURING); // State where user selects style
  };

  const handleStyleSelect = async (style: StyleOption) => {
    if (!capturedImage) return;

    setAppState(AppState.PROCESSING);
    setLoadingMessage(`Applying ${style.name} style...`);
    setAnalysis(null);

    try {
      const resultImage = await generateTimeTravelImage(capturedImage, style.promptSuffix);
      
      const firstStepId = crypto.randomUUID();
      
      setGeneratedResult({
        originalImage: capturedImage,
        style: style,
        steps: [{
          id: firstStepId,
          image: resultImage,
          description: style.name
        }],
        selectedStepId: firstStepId
      });
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      alert("Generation failed! Please try again.");
      setAppState(AppState.CAPTURING);
    }
  };

  const handleEdit = async () => {
    if (!generatedResult || !editPrompt.trim()) return;

    // Use the CURRENTLY VIEWED image as the base for the edit
    const currentViewImage = generatedResult.selectedStepId === 'original' 
      ? generatedResult.originalImage 
      : generatedResult.steps.find(s => s.id === generatedResult.selectedStepId)?.image;

    if (!currentViewImage) return;

    setAppState(AppState.PROCESSING);
    setLoadingMessage(`Refining: "${editPrompt}"...`);

    try {
      const newImage = await generateTimeTravelImage(
        currentViewImage, 
        generatedResult.style.promptSuffix, 
        editPrompt
      );

      const newStepId = crypto.randomUUID();
      
      setGeneratedResult({
        ...generatedResult,
        steps: [...generatedResult.steps, {
          id: newStepId,
          image: newImage,
          description: editPrompt
        }],
        selectedStepId: newStepId
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
    
    // Analyze currently viewed image
    const currentViewImage = generatedResult.selectedStepId === 'original' 
      ? generatedResult.originalImage 
      : generatedResult.steps.find(s => s.id === generatedResult.selectedStepId)?.image;
      
    if (!currentViewImage) return;

    setAnalysis({ text: '', isLoading: true });
    
    try {
      const text = await analyzeHistoricalAccuracy(currentViewImage);
      setAnalysis({ text, isLoading: false });
    } catch (error) {
      console.error(error);
      setAnalysis({ text: "Analysis failed.", isLoading: false });
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setCapturedImage(null);
    setGeneratedResult(null);
    setAnalysis(null);
    setEditPrompt("");
  };

  // Helper to get currently displayed image
  const getDisplayImage = () => {
    if (!generatedResult) return null;
    if (generatedResult.selectedStepId === 'original') return generatedResult.originalImage;
    return generatedResult.steps.find(s => s.id === generatedResult.selectedStepId)?.image;
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
                AI Photo Studio
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                Upload a selfie or use your camera. Transform into historical figures or create professional headshots using Gemini AI.
              </p>
            </div>
            <CameraCapture onCapture={handleCapture} appState={appState} />
          </div>
        )}

        {/* State: CAPTURING - Select Style */}
        {appState === AppState.CAPTURING && capturedImage && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="flex flex-col items-center">
               <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-lg mb-6">
                 <img src={capturedImage} alt="Source" className="w-full h-full object-cover" />
               </div>
               <p className="text-slate-300 mb-8">Photo acquired. Select a style:</p>
            </div>
            <SceneSelector onSelect={handleStyleSelect} disabled={false} />
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
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
               </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-500 historical-font">{loadingMessage}</h3>
            <p className="text-slate-400">Generative AI is processing...</p>
          </div>
        )}

        {/* State: RESULT */}
        {appState === AppState.RESULT && generatedResult && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in items-start">
            
            {/* Left Col: Main Image + Thumbnails */}
            <div className="lg:col-span-2 space-y-6">
               <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700 aspect-[4/5] sm:aspect-square md:aspect-[4/3] group flex items-center justify-center">
                  <img 
                    src={getDisplayImage() || ''} 
                    alt="Displayed Result" 
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Download Button */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <a 
                      href={getDisplayImage() || ''}
                      download={`chronolens-${generatedResult.style.id}-${generatedResult.selectedStepId}.jpg`}
                      className="p-3 bg-slate-900/80 hover:bg-amber-600 text-white rounded-full backdrop-blur-sm transition-all shadow-lg"
                      title="Download"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                       </svg>
                     </a>
                  </div>

                  {/* Tag Indicator */}
                  <div className="absolute top-4 left-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                        generatedResult.selectedStepId === 'original' 
                           ? 'bg-slate-700 text-white' 
                           : 'bg-amber-500 text-black'
                     }`}>
                        {generatedResult.selectedStepId === 'original' ? 'Original Source' : 'AI Generated'}
                     </span>
                  </div>
               </div>
               
               {/* Thumbnails Gallery */}
               <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2" ref={thumbnailsRef}>
                    {/* Original Thumbnail */}
                    <button 
                      onClick={() => setGeneratedResult({...generatedResult, selectedStepId: 'original'})}
                      className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        generatedResult.selectedStepId === 'original' ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={generatedResult.originalImage} className="w-full h-full object-cover" alt="Original" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-1 truncate">Original</div>
                    </button>

                    {/* Generated Steps */}
                    {generatedResult.steps.map((step, idx) => (
                      <button 
                        key={step.id}
                        onClick={() => setGeneratedResult({...generatedResult, selectedStepId: step.id})}
                        className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                           generatedResult.selectedStepId === step.id ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={step.image} className="w-full h-full object-cover" alt={`Step ${idx + 1}`} />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-1 truncate">
                           {idx === 0 ? generatedResult.style.name : `Edit ${idx}`}
                        </div>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Right Col: Controls & Analysis */}
            <div className="flex flex-col gap-6">
              
              {/* Edit Controls */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                 <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 historical-font">{generatedResult.style.name}</h3>
                    <p className="text-slate-400 text-xs">{generatedResult.style.description}</p>
                 </div>
                 
                 <div className="space-y-4">
                   <label className="block text-sm font-medium text-slate-300">
                     Refine this result
                   </label>
                   <div className="flex flex-col gap-2">
                     <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Make it sepia', 'Add glasses'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-slate-600"
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                     />
                     <button 
                      onClick={handleEdit}
                      disabled={!editPrompt.trim()}
                      className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                     >
                       Generate Variation
                     </button>
                   </div>
                   <p className="text-xs text-slate-500">
                     Uses Gemini 2.5 Flash Image to modify the currently viewed image.
                   </p>
                 </div>
              </div>

               {/* Analysis Section */}
               <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      AI Analysis
                    </h3>
                    <button 
                      onClick={handleAnalysis}
                      disabled={analysis?.isLoading}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white disabled:opacity-50"
                    >
                      {analysis ? 'Re-Analyze' : 'Analyze'}
                    </button>
                  </div>
                  
                  {analysis && (
                    <div className="text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar p-3 bg-slate-900/50 rounded-lg border border-slate-700" ref={analysisEndRef}>
                      {analysis.isLoading ? (
                         <div className="flex items-center gap-2 text-indigo-300">
                           <span className="animate-pulse">Consulting Gemini 3 Pro...</span>
                         </div>
                      ) : (
                        analysis.text
                      )}
                    </div>
                  )}
                  {!analysis && (
                    <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 italic">
                        Verify accuracy or get details about the current image using Gemini 3 Pro.
                      </p>
                    </div>
                  )}
               </div>

              <div className="mt-auto pt-6 border-t border-slate-800">
                 <button 
                  onClick={() => setAppState(AppState.CAPTURING)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   Select Different Style
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