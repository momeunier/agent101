"use client";

import { useState, useEffect, useRef } from "react";

export default function AutoCompleteTextarea({
  value,
  onChange,
  placeholder,
  className,
  suggestions,
  required,
}) {
  const [cursorPosition, setCursorPosition] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "{") {
      e.preventDefault(); // Prevent the { from being typed
      setShowSuggestions(true);
      const position = e.target.selectionStart;
      setCursorPosition(position);
      setFilteredSuggestions(suggestions);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    const text = e.target.value;
    const position = e.target.selectionStart;

    // Check if we're typing inside curly braces
    if (cursorPosition) {
      const currentInput = text.slice(cursorPosition, position);
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(currentInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  };

  const insertSuggestion = (suggestion) => {
    if (cursorPosition === null) return;

    const before = value.slice(0, cursorPosition);
    const after = value.slice(textareaRef.current.selectionStart);
    const newValue = before + "{" + suggestion + "}" + after;

    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
    setCursorPosition(null);

    // Focus back on textarea
    textareaRef.current.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        required={required}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-64 max-h-48 overflow-y-auto bg-gray-900 rounded-lg border border-white/10 shadow-xl"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 focus:outline-none font-mono"
              onClick={() => insertSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
