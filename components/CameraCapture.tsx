import React, { useRef, useState, useCallback } from 'react';
import { AppState } from '../types';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  appState: AppState;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, appState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please allow permissions or upload a file.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for mirror effect if using user-facing camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        onCapture(imageDataUrl);
      }
    }
  }, [onCapture]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
        {!isStreamActive ? (
          <div className="text-center p-6 space-y-4">
            <div className="text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-light">Ready to travel?</p>
            </div>
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Start Camera
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Or</span>
              </div>
            </div>
             <label className="cursor-pointer inline-flex items-center px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 font-medium rounded-full hover:bg-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </label>
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        ) : (
          <>
             <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
               <button 
                onClick={capturePhoto}
                className="h-16 w-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-xl transition-transform transform active:scale-95 flex items-center justify-center group"
                aria-label="Take Photo"
               >
                 <div className="h-12 w-12 rounded-full border-2 border-transparent group-hover:border-white/50 transition-all"></div>
               </button>
            </div>
             <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;