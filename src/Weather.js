import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Weather.css";

// Passing 'city' as a prop allows other components (like your search bar)
// to control what weather is displayed.
const Weather = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if a city name actually exists
      if (!city) return;

      try {
        setError(false);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=3c55a281d6b83372a349a206cccae9e3`,
        );
        setWeatherData(response.data);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchData();
  }, [city]); // This hook runs every time the 'city' argument changes

  // The Hazard Interpreter: Translating raw data into advice for beginners
  const renderWeatherNotice = () => {
    if (!weatherData) return null;

    const temp = weatherData.main.temp;
    const wind = weatherData.wind.speed;

    if (temp <= 2) return "Frost risk tonight, cover your plants";
    if (wind > 10) return "Strong winds - protect young plants";
    return "Current weather is good for your plants";
  };

  if (!city) return <p className="loading">Detecting location... 🌍</p>;

  return (
    <div className="weather-container">
      {weatherData ? (
        <div className="weather-card">
          <h2>{weatherData.name}</h2>
          {/* Largest number on the left as per design requirements */}
          <p className="temp">{Math.round(weatherData.main.temp)}°C</p>
          <p className="desc">{weatherData.weather[0].description}</p>

          <div className="weather-notice-box">
            <strong>Weather Notice:</strong>
            <p>{renderWeatherNotice()}</p>
          </div>

          <div className="details">
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Wind: {weatherData.wind.speed} m/s</p>
          </div>
        </div>
      ) : (
        <p className="loading">
          {error ? "City not found" : "Loading weather..."}
        </p>
      )}
    </div>
  );
};

export default Weather;
