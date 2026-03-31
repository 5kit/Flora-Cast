import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Weather from "./Weather";
import "./App.css";
// Asset imports for dynamic UI scaling
import logo from "./Logo.png";
import bgSpring from "./backgrounds/BackgroundSpring.png";
import bgSummer from "./backgrounds/backgroundSUMMER.png";
import bgAutumn from "./backgrounds/BackgroundAutumn.png";
import bgWinter from "./backgrounds/BackgroundWinter.png";

/**
 * Preset locations used for cross-hemisphere testing and manual overrides.
 * Provides a seamless way to verify seasonal UI changes without physical travel.
 */
const LOCATION_PRESETS = [
  { name: "London", lat: 51.5074, lon: -0.1278, hemisphere: "northern" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, hemisphere: "southern" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, hemisphere: "northern" },
];

/**
 * Helper component for consistent UI layout.
 * Implements a "Tabbed Island" design for high readability.
 */
const IslandTile = ({ title, children, className }) => {
  return (
    <div className={`island-container ${className}`}>
      <div className="island-tab">{title}</div>
      <div className="island-content">{children}</div>
    </div>
  );
};

/**
 * Logic to determine the biological season based on calendar month and hemisphere.
 * Crucial for the "Plants of the Season" stakeholder requirement.
 */
function getSeason(date = new Date(), hemisphere = "northern") {
  const month = date.getMonth() + 1; // Convert JS 0-indexed months to 1-12
  let season = "winter";

  if (month >= 3 && month <= 5) season = "spring";
  else if (month >= 6 && month <= 8) season = "summer";
  else if (month >= 9 && month <= 11) season = "autumn";

  // Reverse logic for Southern Hemisphere stakeholders
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
  const [userCity, setUserCity] = useState("London");
  const [seasonalPlants, setSeasonalPlants] = useState([]);

  /**
   * EXTENSION: Automatic Geolocation & Reverse Geocoding.
   * Uses browser API to find coordinates, then Nominatim API to resolve the city name.
   */
  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Determine hemisphere based on the equator (0 latitude)
        setHemisphere(latitude >= 0 ? "northern" : "southern");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          // Fallback logic for different address formats in the OpenStreetMap API
          const city =
            data.address.city || data.address.town || data.address.village;
          if (city) setUserCity(city);
        } catch (error) {
          console.error("Geocoding failed", error);
        }
      });
    }
  }, []);

  // Determine current background based on calculated season
  const season = getSeason(new Date(), hemisphere);
  const seasonBackgrounds = {
    spring: bgSpring,
    summer: bgSummer,
    autumn: bgAutumn,
    winter: bgWinter,
  };
  const currentSeasonBackground = seasonBackgrounds[season] || bgSpring;

  /**
   * PERSISTENCE: Initialize favorites from LocalStorage.
   * Ensures the user's "Digital Garden" is saved across browser sessions.
   */
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favouritePlants");
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * DATA HANDLING: Load plant database from external CSV.
   * Uses PapaParse for efficient client-side data processing.
   */
  useEffect(() => {
    Papa.parse("/plants.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const allData = results.data;
        setAllPlants(allData);
        
        // Filter logic: Match "Year-long" or the current specific season
        const filtered = allData.filter(plant => {
          if (!plant.season) return false;
          const plantSeason = plant.season.toLowerCase();
          const currentSeason = season.toLowerCase();
          
          return plantSeason === "year-long" || 
                 plantSeason.includes(currentSeason);
        });
        setSeasonalPlants(filtered);
      },
    });
  }, [season]);

  // Sync favorites to LocalStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem("favouritePlants", JSON.stringify(favorites));
  }, [favorites]);

  /**
   * INTERACTION: Manual Location Selection.
   * Allows stakeholders to override auto-detection for planning/testing.
   */
  const handleLocationChange = (e) => {
    const selectedName = e.target.value;
    const location = LOCATION_PRESETS.find((loc) => loc.name === selectedName);
    if (location) {
      setUserCity(location.name);
      setHemisphere(location.hemisphere);
    }
  };

  /**
   * Toggle logic for adding/removing favorites.
   * Prevents duplicates by checking the plant name unique identifier.
   */
  const toggleFavorite = (plant) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.some((p) => p.name === plant.name);
      return isAlreadyFav
        ? prev.filter((p) => p.name !== plant.name)
        : [...prev, plant];
    });
  };

  // Basic filtering for the plant search bar
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
      style={{ backgroundImage: `url(${currentSeasonBackground})` }}
    >
      <img src={logo} alt="Flora-Cast logo" className="app-logo" />

      {/* Control Bar: Global settings for Location and Season visibility */}
      <div className="location-controls-bar">
        <div className="location-selector">
          <label htmlFor="location-select">Location:</label>
          <select
            id="location-select"
            value={userCity}
            onChange={handleLocationChange}
          >
            {!LOCATION_PRESETS.find((l) => l.name === userCity) && (
              <option value={userCity}>{userCity} (Detected)</option>
            )}
            {LOCATION_PRESETS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="season-chip">
          Season: {season.charAt(0).toUpperCase() + season.slice(1)}
        </div>
      </div>

      <div className="dashboard-grid">
        <IslandTile title="Weather" className="weather-main">
          <Weather city={userCity} />
        </IslandTile>

        <div className="sidebar-section">
          <IslandTile title="Plants of the Season">
            <p style={{ textAlign: "center", opacity: 0.8, marginBottom: "10px" }}>
              Best plants for {season} in the {hemisphere} hemisphere.
            </p>
            <div className="seasonal-plants-container">
              {seasonalPlants.length > 0 ? (
                seasonalPlants.slice(0, 3).map((plant, index) => (
                  <div key={index} className="seasonal-plant-row">
                    <img src={plant.image} alt={plant.name} className="seasonal-mini-img" />
                    <span>{plant.name}</span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", fontSize: "0.8em" }}>Loading seasonal plants...</p>
              )}
            </div>
          </IslandTile>

          <br />

          <IslandTile title="Search for a Plant" className="search-island">
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
                      rel="noreferrer"
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

        {/* PERSISTENT UI: The Digital Garden footer */}
        <IslandTile title="Favourite Plants" className="favorites-footer">
          <div className="favorites-horizontal-list">
            {favorites.length > 0 ? (
              favorites.map((plant, index) => (
                <div key={index} className="fav-card">
                  <button
                    className="fav-card-remove"
                    onClick={() => toggleFavorite(plant)}
                  >
                    ×
                  </button>
                  <a
                    href={plant.wiki}
                    target="_blank"
                    rel="noreferrer"
                    className="fav-card-inner"
                  >
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="fav-card-img"
                    />
                    <div className="fav-card-info">
                      <span className="fav-card-name">{plant.name}</span>
                      <span className="fav-card-type">{plant.type}</span>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <p className="no-favs-text">
                Your garden is empty. Start starring plants!
              </p>
            )}
          </div>
        </IslandTile>
      </div>
    </div>
  );
}

export default App;
