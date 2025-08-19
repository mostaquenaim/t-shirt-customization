'use client'
import React, { useState, useRef } from 'react';
import { Upload, Type, Move, RotateCcw, Trash2, Download } from 'lucide-react';

const TeeCustomization = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [imageElements, setImageElements] = useState([]);
  const [tshirtColor, setTshirtColor] = useState('#ffffff');
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const fileInputRef = useRef(null);
  const tshirtRef = useRef(null);

  const addTextElement = () => {
    if (newText.trim()) {
      const newElement = {
        id: Date.now(),
        text: newText,
        x: 150,
        y: 200,
        fontSize: 24,
        color: '#000000',
        fontFamily: 'Arial',
        rotation: 0
      };
      setTextElements([...textElements, newElement]);
      setNewText('');
      setShowTextInput(false);
      setSelectedElement({ type: 'text', id: newElement.id });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement = {
          id: Date.now(),
          src: e.target.result,
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          rotation: 0
        };
        setImageElements([...imageElements, newElement]);
        setSelectedElement({ type: 'image', id: newElement.id });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTextElement = (id, updates) => {
    setTextElements(textElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const updateImageElement = (id, updates) => {
    setImageElements(imageElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (type, id) => {
    if (type === 'text') {
      setTextElements(textElements.filter(el => el.id !== id));
    } else {
      setImageElements(imageElements.filter(el => el.id !== id));
    }
    setSelectedElement(null);
  };

  const handleElementStart = (e, type, id) => {
    // Prevent default for both touch and mouse
    e.preventDefault();
    setSelectedElement({ type, id });
    
    // Get initial position based on input type
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (clientX === undefined || clientY === undefined) return;
    
    const startX = clientX;
    const startY = clientY;
    const element = type === 'text' 
      ? textElements.find(el => el.id === id)
      : imageElements.find(el => el.id === id);
    
    const startElementX = element.x;
    const startElementY = element.y;

    const handleMove = (moveEvent) => {
      // Get current position based on input type
      const moveClientX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      const moveClientY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
      
      if (moveClientX === undefined || moveClientY === undefined) return;
      
      const deltaX = moveClientX - startX;
      const deltaY = moveClientY - startY;
      const newX = startElementX + deltaX;
      const newY = startElementY + deltaY;

      if (type === 'text') {
        updateTextElement(id, { x: newX, y: newY });
      } else {
        updateImageElement(id, { x: newX, y: newY });
      }
    };

    const handleEnd = () => {
      // Remove both mouse and touch listeners
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };

    // Add both mouse and touch listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const getSelectedElement = () => {
    if (!selectedElement) return null;
    
    if (selectedElement.type === 'text') {
      return textElements.find(el => el.id === selectedElement.id);
    } else {
      return imageElements.find(el => el.id === selectedElement.id);
    }
  };

  const selectedEl = getSelectedElement();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6 md:mb-8">
          Customize Your T-Shirt
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Design Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Design Canvas</h2>
              
              {/* T-Shirt Color Selector */}
              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium mb-1 md:mb-2">T-Shirt Color:</label>
                <div className="flex gap-2 flex-wrap">
                  {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 md:w-8 md:h-8 rounded border-2 ${tshirtColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTshirtColor(color)}
                    />
                  ))}
                  <input
                    type="color"
                    value={tshirtColor}
                    onChange={(e) => setTshirtColor(e.target.value)}
                    className="w-6 h-6 md:w-8 md:h-8 rounded border-2 border-gray-300"
                  />
                </div>
              </div>

              {/* T-Shirt Preview */}
              <div className="relative mx-auto" style={{ width: '100%', maxWidth: '400px', height: '500px' }}>
                {/* T-Shirt Base */}
                <svg
                  ref={tshirtRef}
                  width="100%"
                  height="500"
                  viewBox="0 0 400 500"
                  className="border border-gray-300 rounded-lg"
                  style={{ backgroundColor: '#f9f9f9' }}
                >
                  {/* T-Shirt Shape */}
                  <path
                    d="M100 80 L100 60 C100 50 110 40 120 40 L140 40 C150 30 160 20 170 20 L230 20 C240 20 250 30 260 40 L280 40 C290 40 300 50 300 60 L300 80 L320 100 L320 140 L300 140 L300 480 L100 480 L100 140 L80 140 L80 100 Z"
                    fill={tshirtColor}
                    stroke="#ddd"
                    strokeWidth="2"
                  />
                  
                  {/* Design Area Outline */}
                  <rect
                    x="120"
                    y="120"
                    width="160"
                    height="200"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                </svg>

                {/* Overlay for Text and Images */}
                <div className="absolute inset-0 touch-none">
                  {/* Text Elements */}
                  {textElements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move select-none touch-none ${
                        selectedElement?.type === 'text' && selectedElement?.id === element.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        fontSize: element.fontSize,
                        color: element.color,
                        fontFamily: element.fontFamily,
                        transform: `rotate(${element.rotation}deg)`,
                        transformOrigin: 'center'
                      }}
                      onMouseDown={(e) => handleElementStart(e, 'text', element.id)}
                      onTouchStart={(e) => handleElementStart(e, 'text', element.id)}
                    >
                      {element.text}
                    </div>
                  ))}

                  {/* Image Elements */}
                  {imageElements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move touch-none ${
                        selectedElement?.type === 'image' && selectedElement?.id === element.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        transformOrigin: 'center'
                      }}
                      onMouseDown={(e) => handleElementStart(e, 'image', element.id)}
                      onTouchStart={(e) => handleElementStart(e, 'image', element.id)}
                    >
                      <img
                        src={element.src}
                        alt="Custom design"
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4 md:space-y-6">
            {/* Add Elements */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Add Elements</h3>
              
              {/* Add Text */}
              <div className="mb-3 md:mb-4">
                {!showTextInput ? (
                  <button
                    onClick={() => setShowTextInput(true)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Type size={20} />
                    Add Text
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Enter your text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addTextElement}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowTextInput(false);
                          setNewText('');
                        }}
                        className="flex-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Image */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload size={20} />
                  Upload Image
                </button>
              </div>
            </div>

            {/* Element Properties */}
            {selectedEl && (
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                  Edit {selectedElement.type === 'text' ? 'Text' : 'Image'}
                </h3>

                {selectedElement.type === 'text' && (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Text:</label>
                      <input
                        type="text"
                        value={selectedEl.text}
                        onChange={(e) => updateTextElement(selectedEl.id, { text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Size:</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedEl.fontSize}
                        onChange={(e) => updateTextElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-600">{selectedEl.fontSize}px</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Color:</label>
                      <input
                        type="color"
                        value={selectedEl.color}
                        onChange={(e) => updateTextElement(selectedEl.id, { color: e.target.value })}
                        className="w-full h-8 md:h-10 rounded-lg border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Family:</label>
                      <select
                        value={selectedEl.fontFamily}
                        onChange={(e) => updateTextElement(selectedEl.id, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'image' && (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Width:</label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={selectedEl.width}
                        onChange={(e) => updateImageElement(selectedEl.id, { width: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-600">{selectedEl.width}px</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Height:</label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={selectedEl.height}
                        onChange={(e) => updateImageElement(selectedEl.id, { height: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-600">{selectedEl.height}px</span>
                    </div>
                  </div>
                )}

                {/* Common Properties */}
                <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rotation:</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedEl.rotation}
                      onChange={(e) => {
                        const rotation = parseInt(e.target.value);
                        if (selectedElement.type === 'text') {
                          updateTextElement(selectedEl.id, { rotation });
                        } else {
                          updateImageElement(selectedEl.id, { rotation });
                        }
                      }}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{selectedEl.rotation}°</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedElement.type === 'text') {
                          updateTextElement(selectedEl.id, { rotation: 0 });
                        } else {
                          updateImageElement(selectedEl.id, { rotation: 0 });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                    <button
                      onClick={() => deleteElement(selectedElement.type, selectedEl.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Design Tips */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Design Tips</h3>
              <ul className="space-y-1 md:space-y-2 text-sm text-gray-600">
                <li>• Click and drag elements to move them around</li>
                <li>• Select an element to edit its properties</li>
                <li>• Keep text within the dotted design area</li>
                <li>• Use high-resolution images for best results</li>
                <li>• Consider contrast between text and T-shirt color</li>
              </ul>
            </div>

            {/* Elements List */}
            {(textElements.length > 0 || imageElements.length > 0) && (
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Design Elements</h3>
                <div className="space-y-2">
                  {textElements.map((element) => (
                    <div
                      key={element.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedElement?.type === 'text' && selectedElement?.id === element.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedElement({ type: 'text', id: element.id })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Text: "{element.text}"</span>
                        <Type size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                  
                  {imageElements.map((element) => (
                    <div
                      key={element.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedElement?.type === 'image' && selectedElement?.id === element.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedElement({ type: 'image', id: element.id })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Image</span>
                        <div className="flex items-center gap-2">
                          <img
                            src={element.src}
                            alt="Design element"
                            className="w-6 h-6 object-cover rounded"
                          />
                          <Upload size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <div className="space-y-2 md:space-y-3">
                <button className="w-full bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Add to Cart - $24.99
                </button>
                <button className="w-full bg-gray-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  Save Design
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 md:mt-8 bg-blue-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-blue-800 mb-2">How to Use:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm text-blue-700">
            <div>
              <strong>1. Add Elements:</strong> Click "Add Text" to add custom text or "Upload Image" to add your own graphics.
            </div>
            <div>
              <strong>2. Position & Style:</strong> Drag elements to position them, then select to modify properties like size, color, and rotation.
            </div>
            <div>
              <strong>3. Customize:</strong> Change the T-shirt color and fine-tune your design until it's perfect!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeeCustomization;