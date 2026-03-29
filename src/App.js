import React, { useState } from "react";
import Weather from "./Weather";
import "./App.css";
import logo from "./Logo.png";
import spinachImg from "./plantImg/spinach.jpg";

function PlantIsland({ title, children }) {
  return (
    <div className="island-container">
      <div className="island-tab">{title}</div>
      <div className="plant-grid">{children}</div>
    </div>
  );
}

const IslandTile = ({ title, children, className }) => {
  return (
    <div className={`island-container ${className}`}>
      <div className="island-tab">{title}</div>
      <div className="island-content">{children}</div>
    </div>
  );
};

function App() {
  const [plantSearch, setPlantSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const plants = [
    "Aloe Vera",
    "Monstera",
    "Fern",
    "Basil",
    "Snake Plant",
    "Spider Plant",
    "Cactus",
    "Peace Lily",
    "Succulent",
    "Spinach",
  ];

  const plantImages = {
    "Aloe Vera": "https://via.placeholder.com/96?text=Aloe+Vera",
    Monstera: "https://via.placeholder.com/96?text=Monstera",
    Fern: "https://via.placeholder.com/96?text=Fern",
    Basil: "https://via.placeholder.com/96?text=Basil",
    "Snake Plant": "https://via.placeholder.com/96?text=Snake+Plant",
    "Spider Plant": "https://via.placeholder.com/96?text=Spider+Plant",
    Cactus: "https://via.placeholder.com/96?text=Cactus",
    "Peace Lily": "https://via.placeholder.com/96?text=Peace+Lily",
    Succulent: "https://via.placeholder.com/96?text=Succulent",
    Spinach: spinachImg,
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = plantSearch.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const results = plants.filter((plant) =>
      plant.toLowerCase().includes(query)
    );

    setSearchResults(results);
  };

  return (
    <div className="app-background">
      <img src={logo} alt="Flora-Cast logo" className="app-logo" />
      <div className="dashboard-grid">
        {/* 1. Main Weather Section */}
        <IslandTile title="Weather" className="weather-main">
          <Weather city="London" />
        </IslandTile>

        {/* 2. Side Tiles (Stacked) */}
        <div className="sidebar-section">
          <IslandTile title="Plants of the Season">
            {/* List of seasonal plants */}
          </IslandTile>

          <br />

          <IslandTile title="Search for a Plant">
            <form className="plant-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                value={plantSearch}
                onChange={(e) => setPlantSearch(e.target.value)}
                placeholder="Type plant name..."
                className="plant-search-input"
              />
              <button type="submit" className="plant-search-btn">
                Search
              </button>
            </form>

            <div className="plant-search-results">
              {searchResults.length === 0 ? (
                <p>No results yet</p>
              ) : (
                <div className="plant-result-grid">
                  {searchResults.map((plant) => (
                    <article key={plant} className="plant-card">
                      <img
                        src={plantImages[plant]}
                        alt={`${plant} thumbnail`}
                        className="plant-card-img"
                      />
                      <div className="plant-card-label">{plant}</div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </IslandTile>
        </div>

        {/* 3. Bottom Tile */}
        <IslandTile title="Favourite Plants" className="favorites-footer">
          {/* Horizontal scroll of favorites */}
        </IslandTile>
      </div>
    </div>
  );
}

export default App;
