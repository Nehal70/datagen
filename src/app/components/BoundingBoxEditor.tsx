'use client';

import { useState, useRef, useEffect } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundingBoxEditorProps {
  imageUrl: string;
  imageId: string;
  initialBox?: BoundingBox;
  onBoxChange: (box: BoundingBox) => void;
  onClose: () => void;
}

export default function BoundingBoxEditor({
  imageUrl,
  imageId,
  initialBox,
  onBoxChange,
  onClose,
}: BoundingBoxEditorProps) {
  const [boxPercent, setBoxPercent] = useState<BoundingBox>({ x: 30, y: 30, width: 40, height: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current && imageSize.width > 0) {
      if (initialBox) {
        // Convert pixel coordinates to percentages
        if (initialBox.x > 100 || initialBox.y > 100) {
          // It's in pixels, convert to percentage
          setBoxPercent({
            x: (initialBox.x / imageSize.width) * 100,
            y: (initialBox.y / imageSize.height) * 100,
            width: (initialBox.width / imageSize.width) * 100,
            height: (initialBox.height / imageSize.height) * 100,
          });
        } else {
          // Already in percentage
          setBoxPercent(initialBox);
        }
      }
    }
  }, [imageSize, initialBox]);

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!imageRef.current || !containerRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) * scaleX;
      const deltaY = (e.clientY - dragStart.y) * scaleY;
      setBoxPercent((prev) => {
        const currentX = (prev.x / 100) * imageSize.width;
        const currentY = (prev.y / 100) * imageSize.height;
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const boxWidth = (prev.width / 100) * imageSize.width;
        const boxHeight = (prev.height / 100) * imageSize.height;
        return {
          x: Math.max(0, Math.min(100 - prev.width, (newX / imageSize.width) * 100)),
          y: Math.max(0, Math.min(100 - prev.height, (newY / imageSize.height) * 100)),
          width: prev.width,
          height: prev.height,
        };
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const deltaX = (e.clientX - dragStart.x) * scaleX;
      const deltaY = (e.clientY - dragStart.y) * scaleY;
      setBoxPercent((prev) => {
        const boxWidth = (prev.width / 100) * imageSize.width;
        const boxHeight = (prev.height / 100) * imageSize.height;
        const newWidth = boxWidth + deltaX;
        const newHeight = boxHeight + deltaY;
        return {
          ...prev,
          width: Math.max(5, Math.min(100 - prev.x, (newWidth / imageSize.width) * 100)),
          height: Math.max(5, Math.min(100 - prev.y, (newHeight / imageSize.height) * 100)),
        };
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, imageSize, boxPercent]);

  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${boxPercent.x}%`,
    top: `${boxPercent.y}%`,
    width: `${boxPercent.width}%`,
    height: `${boxPercent.height}%`,
    border: '3px solid #3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const resizeHandleStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    width: '16px',
    height: '16px',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'nwse-resize',
  };

  const handleSave = () => {
    // Convert percentage box to pixel coordinates for storage
    const pixelBox = {
      x: (boxPercent.x / 100) * imageSize.width,
      y: (boxPercent.y / 100) * imageSize.height,
      width: (boxPercent.width / 100) * imageSize.width,
      height: (boxPercent.height / 100) * imageSize.height,
    };
    onBoxChange(pixelBox);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Edit Bounding Box</h3>
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
          
          <div className="relative inline-block" ref={containerRef}>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Edit bounding box"
              className="max-w-full h-auto"
              onLoad={() => {
                if (imageRef.current) {
                  const width = imageRef.current.offsetWidth || imageRef.current.naturalWidth;
                  const height = imageRef.current.offsetHeight || imageRef.current.naturalHeight;
                  setImageSize({ width, height });
                }
              }}
            />
            {imageSize.width > 0 && imageSize.height > 0 && (
              <div
                style={boxStyle}
                onMouseDown={(e) => handleMouseDown(e, 'drag')}
              >
                <div
                  style={resizeHandleStyle}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'resize');
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>• Click and drag the blue box to move it</p>
            <p>• Drag the blue circle in the bottom-right corner to resize</p>
            <p>• Click Save to apply changes</p>
            {imageSize.width > 0 && imageSize.height > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Box: {boxPercent.x.toFixed(1)}%, {boxPercent.y.toFixed(1)}% | 
                Size: {boxPercent.width.toFixed(1)}% × {boxPercent.height.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
