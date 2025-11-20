'use client';

import { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface AdvancedAnnotationEditorProps {
  imageUrl: string;
  imageId: string;
  initialPoints?: Point[];
  onPointsChange: (points: Point[]) => void;
  onClose: () => void;
}

export default function AdvancedAnnotationEditor({
  imageUrl,
  imageId,
  initialPoints,
  onPointsChange,
  onClose,
}: AdvancedAnnotationEditorProps) {
  const [points, setPoints] = useState<Point[]>(
    initialPoints || [
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 80, y: 80 },
      { x: 20, y: 80 },
    ]
  );
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current && imageSize.width > 0 && imageSize.height > 0 && initialPoints && initialPoints.length > 0) {
      // Convert pixel coordinates to percentages if needed
      if (initialPoints[0].x > 100 || initialPoints[0].y > 100) {
        setPoints(
          initialPoints.map(p => ({
            x: (p.x / imageSize.width) * 100,
            y: (p.y / imageSize.height) * 100,
          }))
        );
      } else {
        setPoints(initialPoints);
      }
    } else if (!initialPoints || initialPoints.length === 0) {
      // Default polygon if no initial points
      setPoints([
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 80, y: 80 },
        { x: 20, y: 80 },
      ]);
    }
  }, [imageSize.width, imageSize.height, initialPoints]);

  const handlePointMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingPoint(index);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingPoint !== null && imageRef.current && containerRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const scaleX = imageSize.width / rect.width;
      const scaleY = imageSize.height / rect.height;
      
      const deltaX = (e.clientX - dragStart.x) * scaleX;
      const deltaY = (e.clientY - dragStart.y) * scaleY;
      
      setPoints((prev) => {
        const newPoints = [...prev];
        const currentPoint = newPoints[draggingPoint];
        newPoints[draggingPoint] = {
          x: Math.max(0, Math.min(100, currentPoint.x + (deltaX / imageSize.width) * 100)),
          y: Math.max(0, Math.min(100, currentPoint.y + (deltaY / imageSize.height) * 100)),
        };
        return newPoints;
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  useEffect(() => {
    if (draggingPoint !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingPoint, dragStart, imageSize]);

  const addPoint = (e: React.MouseEvent) => {
    if (!imageRef.current || draggingPoint !== null) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Find the closest edge to insert the point
    let insertIndex = points.length;
    let minDist = Infinity;
    
    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      const dist = distanceToLineSegment(
        { x, y },
        points[i],
        next
      );
      if (dist < minDist) {
        minDist = dist;
        insertIndex = i + 1;
      }
    }
    
    const newPoints = [...points];
    newPoints.splice(insertIndex, 0, { x, y });
    setPoints(newPoints);
  };

  const removePoint = (index: number) => {
    if (points.length > 3) {
      setPoints(points.filter((_, i) => i !== index));
    }
  };

  const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };


  const handleSave = () => {
    // Convert percentage points to pixel coordinates
    const pixelPoints = points.map(p => ({
      x: (p.x / 100) * imageSize.width,
      y: (p.y / 100) * imageSize.height,
    }));
    onPointsChange(pixelPoints);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Advanced Annotation (Polygon with Control Points)</h3>
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
              alt="Edit annotation"
              className="max-w-full h-auto relative"
              style={{ zIndex: 0 }}
              onLoad={() => {
                if (imageRef.current) {
                  const width = imageRef.current.offsetWidth || imageRef.current.naturalWidth;
                  const height = imageRef.current.offsetHeight || imageRef.current.naturalHeight;
                  setImageSize({ width, height });
                }
              }}
              onClick={addPoint}
            />
            {imageSize.width > 0 && imageSize.height > 0 && (
              <>
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                  viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                  preserveAspectRatio="none"
                >
                  <path
                    d={points.map((p, i) => {
                      const x = (p.x / 100) * imageSize.width;
                      const y = (p.y / 100) * imageSize.height;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ') + ' Z'}
                    fill="rgba(34, 197, 94, 0.2)"
                    stroke="#22c55e"
                    strokeWidth="3"
                  />
                </svg>
                <svg
                  className="absolute inset-0 w-full h-full"
                  style={{ zIndex: 2, pointerEvents: 'none' }}
                  viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                  preserveAspectRatio="none"
                >
                  {points.map((point, index) => {
                    const x = (point.x / 100) * imageSize.width;
                    const y = (point.y / 100) * imageSize.height;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r={hoveredPoint === index ? 8 : 6}
                          fill={draggingPoint === index ? "#ef4444" : "#22c55e"}
                          stroke="white"
                          strokeWidth="2"
                          style={{ pointerEvents: 'all', cursor: 'grab' }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handlePointMouseDown(e as any, index);
                          }}
                          onMouseEnter={() => setHoveredPoint(index)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {points.length > 3 && (
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="transparent"
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                            onDoubleClick={() => removePoint(index)}
                            onMouseEnter={() => setHoveredPoint(index)}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>• <strong>Drag blue dots</strong> to adjust the boundary precisely</p>
            <p>• <strong>Click on the edge</strong> to add a new control point</p>
            <p>• <strong>Double-click a dot</strong> to remove it (minimum 3 points)</p>
            <p>• <strong>Follow object boundaries</strong> by placing points along edges</p>
            <p>• Click Save to apply changes</p>
            {imageSize.width > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Points: {points.length} | Click edges to add more control points
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

