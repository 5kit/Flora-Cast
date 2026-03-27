import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=3c55a281d6b83372a349a206cccae9e3`,
      );
      setWeatherData(response.data);
      console.log(response.data); //You can see all the weather data in console log
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="weather-container">
      <form onSubmit={handleSubmit} className="weather-form">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={handleInputChange}
          className="weather-input"
        />
        <button type="submit" className="weather-button">
          Get Weather
        </button>
      </form>

      {weatherData ? (
        <div className="weather-card">
          <h2>{weatherData.name}</h2>
          <p className="temp">{weatherData.main.temp}°C</p>
          <p className="desc">{weatherData.weather[0].description}</p>

          <div className="details">
            <p>Feels like: {weatherData.main.feels_like}°C</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Pressure: {weatherData.main.pressure}</p>
            <p>Wind: {weatherData.wind.speed} m/s</p>
          </div>
        </div>
      ) : (
        <p className="loading">Search for a city 🌍</p>
      )}
    </div>
  );
};
export default Weather;
