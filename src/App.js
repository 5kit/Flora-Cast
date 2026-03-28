import React from "react";
import Weather from "./Weather";
import "./App.css";

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
  return (
    <div>
      <h1>Flora-Cast</h1>
      <div className="dashboard-grid">
        {/* 1. Main Weather Section */}
        <IslandTile title="Weather" className="weather-main">
          {/* Weather data goes here (Temp, Forecast, Weather Notice) */}
          <Weather city="London" />
        </IslandTile>

        {/* 2. Side Tiles (Stacked) */}
        <div className="sidebar-section">
          <IslandTile title="Plants of the Season">
            {/* List of seasonal plants */}
          </IslandTile>

          <br />

          <IslandTile title="Search for a Plant">
            {/* Search bar and results */}
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
