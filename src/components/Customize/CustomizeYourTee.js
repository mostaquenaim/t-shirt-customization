"use client";
import React, { useState, useRef } from "react";
import { Upload, Type, Move, RotateCcw, Trash2, Download } from "lucide-react";

const TeeCustomization = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [tshirtColor, setTshirtColor] = useState("#ffffff");
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState("");
  
  const tshirtRef = useRef(null);

  const addTextElement = () => {
    if (newText.trim()) {
      const newElement = {
        id: Date.now(),
        text: newText,
        x: 150,
        y: 200,
        fontSize: 24,
        color: "#000000",
        fontFamily: "Arial",
        rotation: 0,
      };
      setTextElements([...textElements, newElement]);
      setNewText("");
      setShowTextInput(false);
      setSelectedElement({ type: "text", id: newElement.id });
    }
  };

  const updateTextElement = (id, updates) => {
    setTextElements(
      textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
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
    const element =
      type === "text"
        && textElements.find((el) => el.id === id)

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

      if (type === "text") {
        updateTextElement(id, { x: newX, y: newY });
      } 
    };

    const handleEnd = () => {
      // Remove both mouse and touch listeners
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };

    // Add both mouse and touch listeners
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Design Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              {/* T-Shirt Preview */}
              <div
                className="relative mx-auto"
                style={{ width: "100%", maxWidth: "400px", height: "500px" }}
              >
                {/* T-Shirt Base */}
                <svg
                  ref={tshirtRef}
                  width="100%"
                  height="500"
                  viewBox="0 0 400 500"
                  className="border border-gray-300 rounded-lg"
                  style={{ backgroundColor: "#f9f9f9" }}
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
                        selectedElement?.type === "text" &&
                        selectedElement?.id === element.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        fontSize: element.fontSize,
                        color: element.color,
                        fontFamily: element.fontFamily,
                        transform: `rotate(${element.rotation}deg)`,
                        transformOrigin: "center",
                      }}
                      onMouseDown={(e) =>
                        handleElementStart(e, "text", element.id)
                      }
                      onTouchStart={(e) =>
                        handleElementStart(e, "text", element.id)
                      }
                    >
                      {element.text}
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
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                Add Elements
              </h3>

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
                      onKeyPress={(e) => e.key === "Enter" && addTextElement()}
                      autoFocus
                    />
                    {/* add and cancel  */}
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
                          setNewText("");
                        }}
                        className="flex-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeeCustomization;
