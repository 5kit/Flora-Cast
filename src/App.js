import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // Import the parser
import Weather from "./Weather";
import "./App.css";
import logo from "./Logo.png";

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
  const [allPlants, setAllPlants] = useState([]); // Stores data from CSV

  // Load CSV data on mount
  useEffect(() => {
    Papa.parse("/plants.csv", {
      download: true,
      header: true,
      complete: (results) => {
        // results.data will be an array of objects: [{name: "Spinach", image: "..."}, ...]
        setAllPlants(results.data);
      },
    });
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = plantSearch.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      return;
    }

    // Filter from the CSV-loaded state
    const results = allPlants.filter((plant) =>
      plant.name?.toLowerCase().includes(query),
    );

    setSearchResults(results);
  };

  return (
    <div className="app-background">
      <img src={logo} alt="Flora-Cast logo" className="app-logo" />
      <div className="dashboard-grid">
        <IslandTile title="Weather" className="weather-main">
          <Weather city="London" />
        </IslandTile>

        <div className="sidebar-section">
          <IslandTile title="Plants of the Season">
            {/* Logic for seasonal filtering can go here */}
          </IslandTile>

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
                  {searchResults.map((plant, index) => (
                    /* Wrap the card in a link */
                    <a
                      key={index}
                      href={plant.wiki}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="plant-card-link"
                    >
                      <article className="plant-card">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="plant-card-img"
                        />
                        <div className="plant-card-label">{plant.name}</div>
                        <i>{plant.type}</i>
                      </article>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </IslandTile>
        </div>

        <IslandTile title="Favourite Plants" className="favorites-footer">
          {/* Horizontal scroll of favorites */}
        </IslandTile>
      </div>
    </div>
  );
}

export default App;
