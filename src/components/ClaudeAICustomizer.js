'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Type, Image, RotateCw, Trash2, Move, Square } from 'lucide-react';

const TShirtCustomizer = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragState, setDragState] = useState({ isDragging: false, offset: { x: 0, y: 0 } });
  const [resizeState, setResizeState] = useState({ isResizing: false, startSize: { width: 0, height: 0 }, startPos: { x: 0, y: 0 } });
  const fileInputRef = useRef(null);
  const designAreaRef = useRef(null);

  // Design area dimensions (customizable)
  const DESIGN_AREA = {
    width: 300,
    height: 350,
    top: 100,
    left: 150
  };

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Sample Text',
      x: DESIGN_AREA.left + 50,
      y: DESIGN_AREA.top + 50,
      width: 150,
      height: 40,
      rotation: 0,
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal'
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 150;
          const maxHeight = 150;
          const aspectRatio = img.width / img.height;
          
          let width = maxWidth;
          let height = maxWidth / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }

          const newElement = {
            id: Date.now(),
            type: 'image',
            content: e.target.result,
            x: DESIGN_AREA.left + 50,
            y: DESIGN_AREA.top + 50,
            width: width,
            height: height,
            rotation: 0
          };
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const rotateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { rotation: (element.rotation + 15) % 360 });
    }
  };

  const handleMouseDown = useCallback((e, elementId, action = 'drag') => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);

    if (action === 'drag') {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragState({
        isDragging: true,
        offset: {
          x: e.clientX - element.x,
          y: e.clientY - element.y
        }
      });
    } else if (action === 'resize') {
      setResizeState({
        isResizing: true,
        startSize: { width: element.width, height: element.height },
        startPos: { x: e.clientX, y: e.clientY }
      });
    }
  }, [elements]);

  const handleMouseMove = useCallback((e) => {
    if (dragState.isDragging && selectedElement) {
      const newX = e.clientX - dragState.offset.x;
      const newY = e.clientY - dragState.offset.y;
      updateElement(selectedElement, { x: newX, y: newY });
    }

    if (resizeState.isResizing && selectedElement) {
      const deltaX = e.clientX - resizeState.startPos.x;
      const deltaY = e.clientY - resizeState.startPos.y;
      const newWidth = Math.max(20, resizeState.startSize.width + deltaX);
      const newHeight = Math.max(20, resizeState.startSize.height + deltaY);
      updateElement(selectedElement, { width: newWidth, height: newHeight });
    }
  }, [dragState, resizeState, selectedElement]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, offset: { x: 0, y: 0 } });
    setResizeState({ isResizing: false, startSize: { width: 0, height: 0 }, startPos: { x: 0, y: 0 } });
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const isElementInBounds = (element) => {
    if (element.rotation === 0) {
      // Simple case - no rotation
      return element.x >= DESIGN_AREA.left &&
             element.y >= DESIGN_AREA.top &&
             element.x + element.width <= DESIGN_AREA.left + DESIGN_AREA.width &&
             element.y + element.height <= DESIGN_AREA.top + DESIGN_AREA.height;
    }
    
    // For rotated elements, calculate the four corners after rotation
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    const radians = (element.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // Calculate rotated corner positions
    const corners = [
      // Top-left corner
      {
        x: centerX + (-halfWidth * cos - -halfHeight * sin),
        y: centerY + (-halfWidth * sin + -halfHeight * cos)
      },
      // Top-right corner
      {
        x: centerX + (halfWidth * cos - -halfHeight * sin),
        y: centerY + (halfWidth * sin + -halfHeight * cos)
      },
      // Bottom-right corner
      {
        x: centerX + (halfWidth * cos - halfHeight * sin),
        y: centerY + (halfWidth * sin + halfHeight * cos)
      },
      // Bottom-left corner
      {
        x: centerX + (-halfWidth * cos - halfHeight * sin),
        y: centerY + (-halfWidth * sin + halfHeight * cos)
      }
    ];
    
    // Check if all corners are within the design area
    return corners.every(corner => 
      corner.x >= DESIGN_AREA.left &&
      corner.x <= DESIGN_AREA.left + DESIGN_AREA.width &&
      corner.y >= DESIGN_AREA.top &&
      corner.y <= DESIGN_AREA.top + DESIGN_AREA.height
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">T-Shirt Designer</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Control Panel */}
          <div className="lg:w-80 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Design Tools</h2>
            
            {/* Add Elements */}
            <div className="space-y-4 mb-6">
              <button
                onClick={addTextElement}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Type size={20} />
                Add Text
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Image size={20} />
                Add Image
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Element Properties */}
            {selectedElement && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Element Properties</h3>
                {(() => {
                  const element = elements.find(el => el.id === selectedElement);
                  if (!element) return null;

                  return (
                    <div className="space-y-4">
                      {element.type === 'text' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Text</label>
                            <input
                              type="text"
                              value={element.content}
                              onChange={(e) => updateElement(element.id, { content: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Size</label>
                            <input
                              type="range"
                              min="12"
                              max="72"
                              value={element.fontSize}
                              onChange={(e) => updateElement(element.id, { fontSize: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-600">{element.fontSize}px</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Color</label>
                            <input
                              type="color"
                              value={element.color}
                              onChange={(e) => updateElement(element.id, { color: e.target.value })}
                              className="w-full h-10 rounded-lg border"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Weight</label>
                            <select
                              value={element.fontWeight}
                              onChange={(e) => updateElement(element.id, { fontWeight: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Bold</option>
                            </select>
                          </div>
                        </>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => rotateElement(element.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <RotateCw size={16} />
                          Rotate
                        </button>
                        <button
                          onClick={() => deleteElement(element.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Position: ({Math.round(element.x)}, {Math.round(element.y)})
                        <br />
                        Size: {Math.round(element.width)}×{Math.round(element.height)}
                        <br />
                        Rotation: {element.rotation}°
                        <br />
                        <span className={isElementInBounds(element) ? 'text-green-600' : 'text-red-600'}>
                          {isElementInBounds(element) ? 'In bounds' : 'Out of bounds (clipped)'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* T-Shirt Canvas */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
            <div className="relative mx-auto" style={{ width: '600px', height: '700px' }}>
              {/* T-Shirt Background */}
              <svg
                width="600"
                height="700"
                viewBox="0 0 600 700"
                className="absolute inset-0"
                style={{ zIndex: 1 }}
              >
                {/* T-Shirt Shape */}
                <path
                  d="M150 100 L150 80 Q150 60 170 60 L200 60 Q220 40 380 40 Q400 60 430 60 L450 60 Q450 80 450 100 L500 120 L500 200 L480 200 L480 650 Q480 670 460 670 L140 670 Q120 670 120 650 L120 200 L100 200 L100 120 Z"
                  fill="#f8f9fa"
                  stroke="#e9ecef"
                  strokeWidth="2"
                />
              </svg>

              {/* Design Area Outline */}
              <div
                className="absolute border-2 border-dashed border-blue-300 bg-blue-50 bg-opacity-30"
                style={{
                  left: DESIGN_AREA.left,
                  top: DESIGN_AREA.top,
                  width: DESIGN_AREA.width,
                  height: DESIGN_AREA.height,
                  zIndex: 2
                }}
              >
                <div className="absolute -top-6 left-0 text-xs text-blue-600 font-medium">
                  Design Area ({DESIGN_AREA.width}×{DESIGN_AREA.height})
                </div>
              </div>

              {/* Clipping Container for Design Area */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: DESIGN_AREA.left,
                  top: DESIGN_AREA.top,
                  width: DESIGN_AREA.width,
                  height: DESIGN_AREA.height,
                  zIndex: 3
                }}
              >
                {/* Elements */}
                {elements.map((element) => (
                  <div key={element.id} className="absolute">
                    {element.type === 'text' ? (
                      <div
                        className={`absolute cursor-move select-none ${
                          selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{
                          left: element.x - DESIGN_AREA.left,
                          top: element.y - DESIGN_AREA.top,
                          width: element.width,
                          height: element.height,
                          transform: `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center center',
                          fontSize: element.fontSize,
                          color: element.color,
                          fontWeight: element.fontWeight,
                          overflow: 'hidden',
                          zIndex: selectedElement === element.id ? 10 : 5
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(element.id);
                        }}
                      >
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {element.content}
                        </div>
                        
                        {selectedElement === element.id && (
                          <>
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div
                              className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize"
                              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize')}
                            ></div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`absolute cursor-move ${
                          selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{
                          left: element.x - DESIGN_AREA.left,
                          top: element.y - DESIGN_AREA.top,
                          width: element.width,
                          height: element.height,
                          transform: `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center center',
                          zIndex: selectedElement === element.id ? 10 : 5
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(element.id);
                        }}
                      >
                        <img
                          src={element.content}
                          alt="Design element"
                          className="w-full h-full object-contain pointer-events-none"
                          draggable={false}
                        />
                        
                        {selectedElement === element.id && (
                          <>
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-move"></div>
                            <div
                              className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize"
                              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize')}
                            ></div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Click to deselect */}
              <div
                className="absolute inset-0 z-0"
                onClick={() => setSelectedElement(null)}
              ></div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Click elements to select • Drag to move • Use corner handles to resize</p>
              <p>Elements outside the design area will be clipped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShirtCustomizer;