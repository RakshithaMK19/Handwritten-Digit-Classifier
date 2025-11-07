
import React, { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-gray-700 relative text-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="about-modal-title" className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">
          About Handwritten Digit Classification
        </h2>
        
        <div className="space-y-6 text-base">
          <section>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">The Challenge</h3>
            <p>
              This application tackles a classic problem in computer vision: recognizing handwritten digits. The goal is to create a system that can look at an image of a single handwritten digit (like the one you draw on the canvas) and correctly identify which number it is, from 0 to 9.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">The Inspiration: MNIST Dataset</h3>
            <p>
              This task was popularized by the MNIST dataset, a large collection of 70,000 handwritten digits that has been used for decades to test and benchmark machine learning models. Our image processing mimics the format of MNIST images (28x28 pixels, grayscale) to prepare your drawing for the AI.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">How It Works (AI Concepts)</h3>
            <p className="mb-2">
              Instead of training a model from scratch in the browser, this app uses a powerful, general-purpose AI model through the Google Gemini API.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><span className="font-semibold">Image Understanding:</span> The AI analyzes the pixels of your drawing to identify patterns, strokes, and shapes.</li>
              <li><span className="font-semibold">Classification:</span> Based on its vast training on images and text, it classifies the drawing into one of the ten digit categories (0-9).</li>
              <li><span className="font-semibold">Confidence Scores:</span> The model doesn't just give a single answer; it provides a probability for each digit, representing its confidence in each potential match. This is what you see in the chart.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Key Technologies</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>React & TypeScript:</strong> For building this interactive user interface.</li>
              <li><strong>Google Gemini API:</strong> Provides the powerful AI model for classification.</li>
              <li><strong>HTML5 Canvas:</strong> For the drawing area.</li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;
