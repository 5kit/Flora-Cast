import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Weather from "./Weather";
import "./App.css";
import logo from "./Logo.png";
import bgSpring from "./backgrounds/BackgroundSpring.png";
import bgSummer from "./backgrounds/backgroundSUMMER.png";
import bgAutumn from "./backgrounds/BackgroundAutumn.png";
import bgWinter from "./backgrounds/BackgroundWinter.png";

const IslandTile = ({ title, children, className }) => {
  return (
    <div className={`island-container ${className}`}>
      <div className="island-tab">{title}</div>
      <div className="island-content">{children}</div>
    </div>
  );
};

function getSeason(date = new Date(), hemisphere = "northern") {
  const month = date.getMonth() + 1; // JS months 0-11
  let season = "winter"; // default

  if (month >= 3 && month <= 5) season = "spring";
  else if (month >= 6 && month <= 8) season = "summer";
  else if (month >= 9 && month <= 11) season = "autumn";

  if (hemisphere === "southern") {
    const swap = {
      spring: "autumn",
      summer: "winter",
      autumn: "spring",
      winter: "summer",
    };
    season = swap[season] || season;
  }

  return season;
}

function App() {
  const [plantSearch, setPlantSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [hemisphere, setHemisphere] = useState("northern");

  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.latitude >= 0) {
            setHemisphere("northern");
          } else {
            setHemisphere("southern");
          }
        },
        () => {
          // permission denied or error: keep default
        },
      );
    }
  }, []);

  const season = getSeason(new Date(), hemisphere);
  const seasonBackgrounds = {
    spring: bgSpring,
    summer: bgSummer,
    autumn: bgAutumn,
    winter: bgWinter,
  };
  const currentSeasonBackground = seasonBackgrounds[season] || bgSummer;

  // 1. Initialize favorites from localStorage (Cache)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favouritePlants");
    return saved ? JSON.parse(saved) : [];
  });

  // Load CSV data on mount
  useEffect(() => {
    Papa.parse("/plants.csv", {
      download: true,
      header: true,
      complete: (results) => {
        setAllPlants(results.data);
      },
    });
  }, []);

  // 2. Sync favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favouritePlants", JSON.stringify(favorites));
  }, [favorites]);

  // 3. Toggle Favorite Logic
  const toggleFavorite = (plant) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.some((p) => p.name === plant.name);
      if (isAlreadyFav) {
        // Remove if exists
        return prev.filter((p) => p.name !== plant.name);
      } else {
        // Add if new
        return [...prev, plant];
      }
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = plantSearch.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }
    const results = allPlants.filter((plant) =>
      plant.name?.toLowerCase().includes(query),
    );
    setSearchResults(results);
  };

  return (
    <div
      className="app-background"
      style={{
        backgroundImage: `url(${currentSeasonBackground})`,
      }}
    >
      <img src={logo} alt="Flora-Cast logo" className="app-logo" />
      <div className="season-chip">Season: {season.charAt(0).toUpperCase() + season.slice(1)}</div>      <div className="hemisphere-selector">
        <label htmlFor="hemisphere-select">Hemisphere</label>
        <select
          id="hemisphere-select"
          value={hemisphere}
          onChange={(e) => setHemisphere(e.target.value)}
        >
          <option value="northern">Northern Hemisphere</option>
          <option value="southern">Southern Hemisphere</option>
        </select>
      </div>      <div className="dashboard-grid">
        <IslandTile title="Weather" className="weather-main">
          <Weather city="London" />
        </IslandTile>

        <div className="sidebar-section">
          <IslandTile title="Plants of the Season">
            {/* Seasonal logic */}
          </IslandTile>

          <br></br>

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

            <div className="plant-result-grid">
              {searchResults.map((plant, index) => {
                // Check if this specific plant is in favorites
                const isFav = favorites.some((p) => p.name === plant.name);

                return (
                  <div key={index} className="plant-result-row">
                    <div
                      className={`plant-star-circle ${isFav ? "active" : ""}`}
                      onClick={() => toggleFavorite(plant)}
                    >
                      <button className="star-btn">{isFav ? "★" : "☆"}</button>
                    </div>

                    <a
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
                        <div className="plant-info">
                          <span className="plant-name">{plant.name}</span>
                          <i className="plant-type">{plant.type}</i>
                        </div>
                      </article>
                    </a>
                  </div>
                );
              })}
            </div>
          </IslandTile>
        </div>

        {/* 4. Display Favorites in the Footer */}
        <IslandTile title="Favourite Plants" className="favorites-footer">
          <div className="favorites-horizontal-list">
            {favorites.length > 0 ? (
              favorites.map((plant, index) => (
                <div key={index} className="fav-card">
                  {/* Remove button at the top right of the card */}
                  <button
                    className="fav-card-remove"
                    onClick={() => toggleFavorite(plant)}
                  >
                    ×
                  </button>
                  <a href={plant.wiki}>
                    <img src={plant.image} alt="" className="fav-card-img" />
                    <div className="fav-card-info">
                      <span className="fav-card-name">{plant.name}</span>
                      <span className="fav-card-type">{plant.type}</span>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <p className="no-favs-text">
                Your garden is empty. Start by starring some plants!
              </p>
            )}
          </div>
        </IslandTile>
      </div>
    </div>
  );
}

export default App;
