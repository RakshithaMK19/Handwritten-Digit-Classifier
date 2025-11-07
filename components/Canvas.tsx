
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

export interface CanvasHandle {
  clear: () => void;
  getCanvasElement: () => HTMLCanvasElement | null;
  isEmpty: () => boolean;
}

const Canvas = forwardRef<CanvasHandle>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 20; // Thick line for better recognition
        contextRef.current = context;
      }
    }
  }, []);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const { offsetX, offsetY } = getCoords(event);
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
      setIsEmpty(false);
    }
  };

  const finishDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { offsetX, offsetY } = getCoords(event);
    if (contextRef.current) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    if (event.nativeEvent instanceof MouseEvent) {
      return { offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY };
    }
    if (event.nativeEvent instanceof TouchEvent) {
      const rect = canvas.getBoundingClientRect();
      const touch = event.nativeEvent.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    }
    return { offsetX: 0, offsetY: 0 };
  };
  
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      const parent = canvas.parentElement;
      if(parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = Math.max(10, parent.clientWidth / 20);
      }
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);


  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      }
    },
    getCanvasElement() {
      return canvasRef.current;
    },
    isEmpty: () => isEmpty,
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      onMouseLeave={finishDrawing}
      onTouchStart={startDrawing}
      onTouchEnd={finishDrawing}
      onTouchMove={draw}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
    />
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
