import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Weather.css";

const Weather = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(false);
  const API_KEY = "3c55a281d6b83372a349a206cccae9e3";

  useEffect(() => {
    const fetchAllWeather = async () => {
      if (!city) return;
      try {
        setError(false);
        // Fetch Current Weather
        const currentRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
        );
        setWeatherData(currentRes.data);

        // Fetch 5-Day Forecast [cite: 53]
        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`,
        );

        // Filter to get one reading per day (roughly mid-day)
        const dailyData = forecastRes.data.list
          .filter((reading) => reading.dt_txt.includes("12:00:00"))
          .slice(0, 6); // Get next 6 days [cite: 89]

        setForecast(dailyData);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchAllWeather();
  }, [city]);

  const renderWeatherNotice = () => {
    if (!weatherData) return null;
    const temp = weatherData.main.temp;
    const wind = weatherData.wind.speed;

    if (temp <= 2) return "Frost risk tonight, cover your plants";
    if (wind > 10) return "Strong winds - protect young plants";
    return "Current weather is good for your plants";
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  if (!city) return <p className="loading">Detecting location... </p>;

  return (
    <div className="weather-container">
      {weatherData ? (
        <div className="weather-content-wrapper">
          {/* 1. TOP ROW: Current Data (Left) & Forecast (Right) */}
          <div className="weather-top-row">
            <div className="current-brief">
              <h2>{weatherData.name}</h2>
              <p className="temp">{Math.round(weatherData.main.temp)}°C</p>
              <p className="desc">{weatherData.weather[0].description}</p>
            </div>

            <div className="forecast-row">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-box">
                  <span className="forecast-day">{getDayName(day.dt_txt)}</span>
                  <span className="forecast-temp">
                    {Math.round(day.main.temp)}°C
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt="icon"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. BOTTOM ROW: Spans full width */}
          <div className="weather-bottom-row">
            <div className="weather-notice-box">
              <strong>Weather Notice:</strong>
              <p>{renderWeatherNotice()}</p>
            </div>

            <div className="details">
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} m/s</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="loading">{error ? "City not found" : "Loading..."}</p>
      )}
    </div>
  );
};

export default Weather;
