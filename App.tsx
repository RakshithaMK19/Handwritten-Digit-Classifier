
import React, { useState, useRef, useCallback } from 'react';
import { classifyDigit } from './services/geminiService';
import Canvas, { type CanvasHandle } from './components/Canvas';
import PredictionChart from './components/PredictionChart';
import AboutModal from './components/AboutModal';
import { type PredictionResult } from './types';
import { preprocessCanvasImage } from './utils/image';

const App: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const canvasRef = useRef<CanvasHandle>(null);

  const handlePredict = useCallback(async () => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      setError('Please draw a digit first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const canvasElement = canvasRef.current.getCanvasElement();
      if (!canvasElement) {
        throw new Error('Canvas element not found');
      }
      
      const base64Image = preprocessCanvasImage(canvasElement);
      
      const result = await classifyDigit(base64Image);
      
      if (result && result.length > 0) {
        const sortedPredictions = [...result].sort((a, b) => b.probability - a.probability);
        setPredictions(sortedPredictions);
      } else {
        throw new Error('Failed to get a valid prediction.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setPredictions([]);
    setError(null);
  }, []);

  const topPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">Handwritten Digit Classifier</h1>
        <p className="text-lg text-gray-400 mt-2">Draw a digit from 0 to 9 and let AI guess it!</p>
        <div className="mt-4">
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="text-cyan-400 border border-cyan-400 rounded-full px-4 py-1 text-sm hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
            aria-label="About this project"
          >
            About this Project
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        <div className="flex-shrink-0 w-full lg:w-1/2 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-2xl shadow-lg border-4 border-gray-700 overflow-hidden">
            <Canvas ref={canvasRef} />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
            >
              {isLoading ? 'Predicting...' : 'Predict'}
            </button>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all duration-300 disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex-grow w-full lg:w-1/2 bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-gray-700 flex flex-col justify-center min-h-[300px] sm:min-h-[400px] md:min-h-full">
          {isLoading && (
             <div className="flex flex-col items-center justify-center text-center">
               <div className="loader border-t-4 border-cyan-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
               <p className="mt-4 text-gray-300 text-lg">Analyzing your drawing...</p>
             </div>
          )}
          {error && <p className="text-red-400 text-center text-lg">{error}</p>}
          {!isLoading && !error && predictions.length === 0 && (
            <div className="text-center text-gray-500">
              <p className="text-xl">Prediction results will appear here.</p>
              <p>Draw a digit and click "Predict".</p>
            </div>
          )}
          {predictions.length > 0 && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-4">
                <p className="text-lg text-gray-400">The AI thinks it's a:</p>
                <p className="text-8xl font-bold text-cyan-400 my-2">{topPrediction?.digit}</p>
                <p className="text-lg text-gray-400">
                  Confidence: <span className="font-semibold text-cyan-300">{(topPrediction!.probability * 100).toFixed(2)}%</span>
                </p>
              </div>
              <div className="flex-grow w-full">
                 <PredictionChart data={predictions} />
              </div>
            </div>
          )}
        </div>
      </main>
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  );
};

export default App;
