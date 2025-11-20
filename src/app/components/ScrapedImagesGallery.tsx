'use client';

import { ScrapedImage } from '../types';
import { useState, useRef, useEffect } from 'react';
import BoundingBoxEditor from './BoundingBoxEditor';
import AdvancedAnnotationEditor from './AdvancedAnnotationEditor';

interface ScrapedImagesGalleryProps {
  images: ScrapedImage[];
  onImagesUpdate?: (images: ScrapedImage[]) => void;
}

export default function ScrapedImagesGallery({ images, onImagesUpdate }: ScrapedImagesGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ScrapedImage | null>(null);
  const [editingBox, setEditingBox] = useState<ScrapedImage | null>(null);
  const [editingPolygon, setEditingPolygon] = useState<ScrapedImage | null>(null);
  const [imagesState, setImagesState] = useState<ScrapedImage[]>(images);

  const handleImageClick = (image: ScrapedImage) => {
    setSelectedImage(image);
  };

  const handleEditBox = (image: ScrapedImage) => {
    setEditingBox(image);
  };

  const handleEditPolygon = (image: ScrapedImage) => {
    setEditingPolygon(image);
  };

  const handleBoxChange = (imageId: string, box: { x: number; y: number; width: number; height: number }) => {
    const updated = imagesState.map(img => 
      img.id === imageId ? { ...img, boundingBox: box } : img
    );
    setImagesState(updated);
    if (onImagesUpdate) {
      onImagesUpdate(updated);
    }
  };

  const handlePolygonChange = (imageId: string, points: Array<{ x: number; y: number }>) => {
    const updated = imagesState.map(img => 
      img.id === imageId ? { ...img, polygonPoints: points } : img
    );
    setImagesState(updated);
    if (onImagesUpdate) {
      onImagesUpdate(updated);
    }
  };

  const ImageWithBox = ({ image }: { image: ScrapedImage }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState({ width: 200, height: 192 });

  useEffect(() => {
    const updateSize = () => {
      if (imgRef.current) {
        setImgSize({
          width: imgRef.current.offsetWidth || imgRef.current.naturalWidth,
          height: imgRef.current.offsetHeight || imgRef.current.naturalHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [image.url, image.boundingBox, image.polygonPoints]);

    const getBoxStyle = () => {
      if (!image.boundingBox) return null;
      const { x, y, width, height } = image.boundingBox;
      // Convert pixel coordinates to percentages
      return {
        position: 'absolute' as const,
        left: `${(x / imgSize.width) * 100}%`,
        top: `${(y / imgSize.height) * 100}%`,
        width: `${(width / imgSize.width) * 100}%`,
        height: `${(height / imgSize.height) * 100}%`,
        border: '2px solid #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointerEvents: 'none' as const,
      };
    };

    return (
      <div className="relative w-full h-48 overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
        <img
          ref={imgRef}
          src={image.url}
          alt={`Scraped ${image.id}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
          onLoad={() => {
            if (imgRef.current) {
              setImgSize({
                width: imgRef.current.offsetWidth,
                height: imgRef.current.offsetHeight,
              });
            }
          }}
        />
        {image.boundingBox && (
          <div style={getBoxStyle() || {}} className="absolute" />
        )}
        {image.polygonPoints && image.polygonPoints.length > 0 && (
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <path
              d={image.polygonPoints.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${(p.x / imgSize.width) * 100}% ${(p.y / imgSize.height) * 100}%`
              ).join(' ') + ' Z'}
              fill="rgba(34, 197, 94, 0.2)"
              stroke="#22c55e"
              strokeWidth="2"
            />
          </svg>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center p-2">
            <div>Similarity: {(image.similarity * 100).toFixed(1)}%</div>
            <div className="truncate">{image.source}</div>
            {image.boundingBox && (
              <div className="mt-1 text-blue-300">✓ Box set</div>
            )}
            {image.polygonPoints && image.polygonPoints.length > 0 && (
              <div className="mt-1 text-green-300">✓ Polygon set</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Scraped Images ({imagesState.length} found)
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {imagesState.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <ImageWithBox image={image} />
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBox(image);
                }}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
              >
                {image.boundingBox ? 'Edit Box' : 'Box'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPolygon(image);
                }}
                className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
              >
                {image.polygonPoints ? 'Edit Polygon' : 'Polygon'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">Image Details</h3>
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt="Selected"
                  className="w-full h-auto rounded-lg mb-4"
                  id={`detail-img-${selectedImage.id}`}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (selectedImage.boundingBox) {
                      // Box will be positioned correctly
                    }
                  }}
                />
                {selectedImage.boundingBox && (() => {
                  const img = document.getElementById(`detail-img-${selectedImage.id}`) as HTMLImageElement;
                  if (!img) return null;
                  const imgWidth = img.offsetWidth || img.naturalWidth;
                  const imgHeight = img.offsetHeight || img.naturalHeight;
                  const { x, y, width, height } = selectedImage.boundingBox;
                  return (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(x / imgWidth) * 100}%`,
                        top: `${(y / imgHeight) * 100}%`,
                        width: `${(width / imgWidth) * 100}%`,
                        height: `${(height / imgHeight) * 100}%`,
                        border: '3px solid #3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      }}
                    />
                  );
                })()}
                {selectedImage.polygonPoints && selectedImage.polygonPoints.length > 0 && (() => {
                  const img = document.getElementById(`detail-img-${selectedImage.id}`) as HTMLImageElement;
                  if (!img) return null;
                  const imgWidth = img.offsetWidth || img.naturalWidth;
                  const imgHeight = img.offsetHeight || img.naturalHeight;
                  return (
                    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                      <path
                        d={selectedImage.polygonPoints.map((p, i) => 
                          `${i === 0 ? 'M' : 'L'} ${(p.x / imgWidth) * 100}% ${(p.y / imgHeight) * 100}%`
                        ).join(' ') + ' Z'}
                        fill="rgba(34, 197, 94, 0.2)"
                        stroke="#22c55e"
                        strokeWidth="3"
                      />
                    </svg>
                  );
                })()}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Similarity:</strong> {(selectedImage.similarity * 100).toFixed(2)}%
                </div>
                <div>
                  <strong>Source:</strong> {selectedImage.source}
                </div>
                {selectedImage.boundingBox && (
                  <div>
                    <strong>Bounding Box:</strong> x: {selectedImage.boundingBox.x.toFixed(0)}, 
                    y: {selectedImage.boundingBox.y.toFixed(0)}, 
                    w: {selectedImage.boundingBox.width.toFixed(0)}, 
                    h: {selectedImage.boundingBox.height.toFixed(0)}
                  </div>
                )}
                {selectedImage.polygonPoints && selectedImage.polygonPoints.length > 0 && (
                  <div>
                    <strong>Polygon Points:</strong> {selectedImage.polygonPoints.length} control points
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBox(selectedImage);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selectedImage.boundingBox ? 'Edit Box' : 'Add Box'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPolygon(selectedImage);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {selectedImage.polygonPoints ? 'Edit Polygon' : 'Add Polygon'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBox && (
        <BoundingBoxEditor
          imageUrl={editingBox.url}
          imageId={editingBox.id}
          initialBox={editingBox.boundingBox}
          onBoxChange={(box) => {
            handleBoxChange(editingBox.id, box);
            setEditingBox(null);
            if (selectedImage?.id === editingBox.id) {
              setSelectedImage({ ...selectedImage, boundingBox: box });
            }
          }}
          onClose={() => setEditingBox(null)}
        />
      )}

      {editingPolygon && (
        <AdvancedAnnotationEditor
          imageUrl={editingPolygon.url}
          imageId={editingPolygon.id}
          initialPoints={editingPolygon.polygonPoints}
          onPointsChange={(points) => {
            handlePolygonChange(editingPolygon.id, points);
            setEditingPolygon(null);
            if (selectedImage?.id === editingPolygon.id) {
              setSelectedImage({ ...selectedImage, polygonPoints: points });
            }
          }}
          onClose={() => setEditingPolygon(null)}
        />
      )}
    </div>
  );
}
