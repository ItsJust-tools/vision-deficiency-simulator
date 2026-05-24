'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ToolCanvasProps {
  imageSrc?: string;
  activeCondition: string;
  intensity: number;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onUpload?: () => void;
}

const visionFilters = [
  { name: 'normal', cssFilter: 'none', label: 'Normal Vision' },
  { name: 'protanopia', cssFilter: 'hue-rotate(130deg) saturate(1.5)', label: 'Red-Blindness' },
  { name: 'deuteranopia', cssFilter: 'hue-rotate(110deg) saturate(1.3)', label: 'Green-Blindness' },
  { name: 'tritanopia', cssFilter: 'hue-rotate(-150deg) saturate(1.2)', label: 'Blue-Blindness' },
  { name: 'achromatopsia', cssFilter: 'grayscale(100%)', label: 'Color Blindness' },
  { name: 'cataracts', cssFilter: 'blur(1px) sepia(0.5) brightness(1.1) hue-rotate(30deg)', label: 'Cataracts' },
  { name: 'glaucoma', cssFilter: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)', label: 'Glaucoma' },
  { name: 'diabetic-retinopathy', cssFilter: 'contrast(1.1) brightness(0.9) hue-rotate(-5deg)', label: 'Diabetic Retinopathy' },
];

export function ToolCanvas({ imageSrc, activeCondition, intensity, canvasRef, onUpload }: ToolCanvasProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (imageSrc) {
      setFileName('uploaded-image');
    } else {
      setFileName('No image uploaded');
    }
  }, [imageSrc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div ref={canvasRef} className="vision-canvas" role="application" aria-label="Vision Deficiency Simulator">
      {/* Upload/View Toggle */}
      <div className="vision-header">
        {!imageSrc ? (
          <div className="upload-mode">
            <div className="upload-instruction">
              <p>Drag & drop an image here, or</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius)',
                  fontWeight: 500,
                  display: 'inline-block',
                }}
              >
                Browse files
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* Image Display with Overlay */}
            <div
              className="image-container"
              style={{
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
              }}
            >
              <img
                src={imageSrc}
                alt="Uploaded image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              {/* Vision Filter Overlay */}
              <div
                ref={overlayRef}
                className="vision-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  filter: visionFilters.find((f) => f.name === activeCondition)?.cssFilter || 'none',
                  opacity: intensity / 100,
                }}
              />
            </div>

            {/* Info */}
            <div className="image-info">
              <span className="file-name">{fileName}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
