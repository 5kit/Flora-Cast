import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Weather from "./Weather";
import "./App.css";
import logo from "./Logo.png";
import bgSpring from "./backgrounds/BackgroundSpring.png";
import bgSummer from "./backgrounds/backgroundSUMMER.png";
import bgAutumn from "./backgrounds/BackgroundAutumn.png";
import bgWinter from "./backgrounds/BackgroundWinter.png";

// 1. Preset Locations for testing different hemispheres and temperatures
const LOCATION_PRESETS = [
  { name: "London", lat: 51.5074, lon: -0.1278, hemisphere: "northern" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, hemisphere: "southern" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, hemisphere: "northern" },
];

const IslandTile = ({ title, children, className }) => {
  return (
    <div className={`island-container ${className}`}>
      <div className="island-tab">{title}</div>
      <div className="island-content">{children}</div>
    </div>
  );
};

function getSeason(date = new Date(), hemisphere = "northern") {
  const month = date.getMonth() + 1;
  let season = "winter";

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
  const [userCity, setUserCity] = useState("London");

  // 2. Automatic Geolocation on Mount
  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setHemisphere(latitude >= 0 ? "northern" : "southern");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          const city =
            data.address.city || data.address.town || data.address.village;
          if (city) setUserCity(city);
        } catch (error) {
          console.error("Geocoding failed", error);
        }
      });
    }
  }, []);

  const season = getSeason(new Date(), hemisphere);
  const seasonBackgrounds = {
    spring: bgSpring,
    summer: bgSummer,
    autumn: bgAutumn,
    winter: bgWinter,
  };
  const currentSeasonBackground = seasonBackgrounds[season] || bgSpring;

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favouritePlants");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    Papa.parse("/plants.csv", {
      download: true,
      header: true,
      complete: (results) => setAllPlants(results.data),
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("favouritePlants", JSON.stringify(favorites));
  }, [favorites]);

  // 3. Location Change Handler
  const handleLocationChange = (e) => {
    const selectedName = e.target.value;
    const location = LOCATION_PRESETS.find((loc) => loc.name === selectedName);
    if (location) {
      setUserCity(location.name);
      setHemisphere(location.hemisphere);
    }
  };

  const toggleFavorite = (plant) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.some((p) => p.name === plant.name);
      return isAlreadyFav
        ? prev.filter((p) => p.name !== plant.name)
        : [...prev, plant];
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
      style={{ backgroundImage: `url(${currentSeasonBackground})` }}
    >
      <img src={logo} alt="Flora-Cast logo" className="app-logo" />

      {/* 4. New Location & Season Header Section */}
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
            <p style={{ textAlign: "center", opacity: 0.8 }}>
              Best plants for {season} in the {hemisphere}...
            </p>
          </IslandTile>

          <br></br>

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
                          alt=""
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
