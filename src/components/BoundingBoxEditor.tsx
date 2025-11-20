'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BoundingBox } from '@/app/types';

interface BoundingBoxEditorProps {
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  boundingBoxes: BoundingBox[];
  onBoundingBoxesChange: (boxes: BoundingBox[]) => void;
}

interface DragState {
  boxId: string;
  type: 'move' | 'resize';
  startX: number;
  startY: number;
  startBox: BoundingBox;
  corner?: 'nw' | 'ne' | 'sw' | 'se';
}

export default function BoundingBoxEditor({
  imageUrl,
  imageWidth: propImageWidth,
  imageHeight: propImageHeight,
  boundingBoxes,
  onBoundingBoxesChange,
}: BoundingBoxEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: propImageWidth || 0,
    height: propImageHeight || 0,
  });

  // Update dimensions when image loads or props change
  useEffect(() => {
    if (propImageWidth && propImageHeight) {
      setImageDimensions({ width: propImageWidth, height: propImageHeight });
    } else if (imageRef.current) {
      const img = imageRef.current;
      const updateDimensions = () => {
        setImageDimensions({ width: img.offsetWidth, height: img.offsetHeight });
      };
      if (img.complete) {
        updateDimensions();
      } else {
        img.onload = updateDimensions;
      }
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [propImageWidth, propImageHeight]);

  const imageWidth = imageDimensions.width;
  const imageHeight = imageDimensions.height;

  // Convert normalized coordinates to pixel coordinates
  const normalizedToPixel = useCallback(
    (box: BoundingBox) => {
      return {
        x: box.x * imageWidth,
        y: box.y * imageHeight,
        width: box.width * imageWidth,
        height: box.height * imageHeight,
      };
    },
    [imageWidth, imageHeight]
  );

  // Convert pixel coordinates to normalized coordinates
  const pixelToNormalized = useCallback(
    (x: number, y: number, width: number, height: number): BoundingBox => {
      return {
        id: '',
        x: Math.max(0, Math.min(1, x / imageWidth)),
        y: Math.max(0, Math.min(1, y / imageHeight)),
        width: Math.max(0, Math.min(1, width / imageWidth)),
        height: Math.max(0, Math.min(1, height / imageHeight)),
      };
    },
    [imageWidth, imageHeight]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, box: BoundingBox, type: 'move' | 'resize', corner?: 'nw' | 'ne' | 'sw' | 'se') => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedBoxId(box.id);
      setDragState({
        boxId: box.id,
        type,
        startX: e.clientX,
        startY: e.clientY,
        startBox: { ...box },
        corner,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragState.startX) / rect.width;
      const deltaY = (e.clientY - dragState.startY) / rect.height;

      const boxIndex = boundingBoxes.findIndex((b) => b.id === dragState.boxId);
      if (boxIndex === -1) return;

      const box = { ...boundingBoxes[boxIndex] };
      const pixelBox = normalizedToPixel(box);

      if (dragState.type === 'move') {
        const newX = pixelBox.x + deltaX * imageWidth;
        const newY = pixelBox.y + deltaY * imageHeight;
        box.x = Math.max(0, Math.min(1, newX / imageWidth));
        box.y = Math.max(0, Math.min(1, newY / imageHeight));
      } else if (dragState.type === 'resize' && dragState.corner) {
        const { corner } = dragState;
        let newX = pixelBox.x;
        let newY = pixelBox.y;
        let newWidth = pixelBox.width;
        let newHeight = pixelBox.height;

        if (corner === 'nw') {
          newX = pixelBox.x + deltaX * imageWidth;
          newY = pixelBox.y + deltaY * imageHeight;
          newWidth = pixelBox.width - deltaX * imageWidth;
          newHeight = pixelBox.height - deltaY * imageHeight;
        } else if (corner === 'ne') {
          newY = pixelBox.y + deltaY * imageHeight;
          newWidth = pixelBox.width + deltaX * imageWidth;
          newHeight = pixelBox.height - deltaY * imageHeight;
        } else if (corner === 'sw') {
          newX = pixelBox.x + deltaX * imageWidth;
          newWidth = pixelBox.width - deltaX * imageWidth;
          newHeight = pixelBox.height + deltaY * imageHeight;
        } else if (corner === 'se') {
          newWidth = pixelBox.width + deltaX * imageWidth;
          newHeight = pixelBox.height + deltaY * imageHeight;
        }

        // Ensure minimum size
        if (newWidth < 20) {
          newWidth = 20;
          if (corner === 'nw' || corner === 'sw') {
            newX = pixelBox.x + pixelBox.width - 20;
          }
        }
        if (newHeight < 20) {
          newHeight = 20;
          if (corner === 'nw' || corner === 'ne') {
            newY = pixelBox.y + pixelBox.height - 20;
          }
        }

        const normalized = pixelToNormalized(newX, newY, newWidth, newHeight);
        box.x = normalized.x;
        box.y = normalized.y;
        box.width = normalized.width;
        box.height = normalized.height;
      }

      const newBoxes = [...boundingBoxes];
      newBoxes[boxIndex] = box;
      onBoundingBoxesChange(newBoxes);
    },
    [dragState, boundingBoxes, imageWidth, imageHeight, normalizedToPixel, pixelToNormalized, onBoundingBoxesChange]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  const handleDeleteBox = useCallback(
    (boxId: string) => {
      onBoundingBoxesChange(boundingBoxes.filter((b) => b.id !== boxId));
      if (selectedBoxId === boxId) {
        setSelectedBoxId(null);
      }
    },
    [boundingBoxes, selectedBoxId, onBoundingBoxesChange]
  );

  const handleLabelChange = useCallback(
    (boxId: string, label: string) => {
      const newBoxes = boundingBoxes.map((box) =>
        box.id === boxId ? { ...box, label } : box
      );
      onBoundingBoxesChange(newBoxes);
    },
    [boundingBoxes, onBoundingBoxesChange]
  );

  if (imageWidth === 0 || imageHeight === 0) {
    return (
      <div className="relative w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotation target"
          className="max-w-full max-h-[600px]"
          style={{ display: 'block' }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative inline-block"
        onClick={() => setSelectedBoxId(null)}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotation target"
          className="max-w-full max-h-[600px]"
          style={{ display: 'block' }}
          draggable={false}
        />
        {boundingBoxes.map((box) => {
          const pixelBox = normalizedToPixel(box);
          const isSelected = selectedBoxId === box.id;

          return (
            <div
              key={box.id}
              className="absolute border-2 cursor-move"
              style={{
                left: `${pixelBox.x}px`,
                top: `${pixelBox.y}px`,
                width: `${pixelBox.width}px`,
                height: `${pixelBox.height}px`,
                borderColor: isSelected ? '#3b82f6' : '#ef4444',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                zIndex: isSelected ? 20 : 10,
              }}
              onMouseDown={(e) => handleMouseDown(e, box, 'move')}
            >
              {/* Resize handles */}
              {isSelected && (
                <>
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize"
                    style={{ left: -6, top: -6 }}
                    onMouseDown={(e) => handleMouseDown(e, box, 'resize', 'nw')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize"
                    style={{ right: -6, top: -6 }}
                    onMouseDown={(e) => handleMouseDown(e, box, 'resize', 'ne')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nesw-resize"
                    style={{ left: -6, bottom: -6 }}
                    onMouseDown={(e) => handleMouseDown(e, box, 'resize', 'sw')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize"
                    style={{ right: -6, bottom: -6 }}
                    onMouseDown={(e) => handleMouseDown(e, box, 'resize', 'se')}
                  />
                </>
              )}

              {/* Label */}
              <div
                className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                style={{ zIndex: 30 }}
              >
                {box.label || 'Object'}
                {box.confidence !== undefined && (
                  <span className="ml-1 opacity-75">
                    ({Math.round(box.confidence * 100)}%)
                  </span>
                )}
              </div>

              {/* Delete button */}
              {isSelected && (
                <button
                  className="absolute -top-6 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                  style={{ zIndex: 30 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBox(box.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bounding box list sidebar */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Bounding Boxes ({boundingBoxes.length})
        </h3>
        {boundingBoxes.map((box) => (
          <div
            key={box.id}
            className={`p-2 border rounded cursor-pointer ${
              selectedBoxId === box.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => setSelectedBoxId(box.id)}
          >
            <input
              type="text"
              value={box.label || ''}
              onChange={(e) => handleLabelChange(box.id, e.target.value)}
              placeholder="Object label"
              className="w-full px-2 py-1 text-sm border rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-1 text-xs text-gray-500">
              {Math.round(box.x * 100)}%, {Math.round(box.y * 100)}% |{' '}
              {Math.round(box.width * 100)}% × {Math.round(box.height * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

