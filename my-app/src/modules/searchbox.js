// src/components/SearchBox.js
import { useState } from "react";

function SearchBox({ markers, onSelect }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setHighlightIndex(-1);
      return;
    }

    const filtered = markers.filter((m) => m.name.includes(value));
    setSearchResults(filtered);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? searchResults.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      handleSelect(searchResults[highlightIndex]);
    }
  };

  const handleSelect = (station) => {
    setSearch(station.name);
    setSearchResults([]);
    setHighlightIndex(-1);

    // ✅ 부모(App.js)로 선택 전달
    onSelect(station);
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        placeholder="역 이름 입력"
        style={{ width: "100%", marginBottom: "10px", padding: "4px", boxSizing: "border-box"}}
      />

      {searchResults.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {searchResults.map((r, idx) => (
            <li
              key={idx}
              style={{
                cursor: "pointer",
                padding: "6px",
                background: idx === highlightIndex ? "#1976d2" : "#fff",
                color: idx === highlightIndex ? "#fff" : "#000",
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
              onClick={() => handleSelect(r)}
            >
              {r.name} ({r.ho})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
