import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Weather.css";

const Weather = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(false);

  // NEW: State to track temperature unit ('metric' for Celsius, 'imperial' for Fahrenheit)
  const [unit, setUnit] = useState("metric");

  const API_KEY = "3c55a281d6b83372a349a206cccae9e3";

  useEffect(() => {
    const fetchAllWeather = async () => {
      if (!city) return;
      try {
        setError(false);
        // FETCH 1: Current Weather - the 'units' parameter now uses our state
        const currentRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`,
        );
        setWeatherData(currentRes.data);

        // FETCH 2: 5-Day Forecast - units dynamically update here too
        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${API_KEY}`,
        );

        const dailyData = forecastRes.data.list
          .filter((reading) => reading.dt_txt.includes("12:00:00"))
          .slice(0, 6);

        setForecast(dailyData);
      } catch (err) {
        console.error("Weather fetch failed", err);
        setError(true);
      }
    };

    fetchAllWeather();
  }, [city, unit]); // Re-fetch when city OR unit changes

  /**
   * UNIT TOGGLE: Enhances UX by allowing the user to choose their preferred scale.
   * Matches the "Capability to retrieve data" requirement in the brief.
   */
  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  const renderWeatherNotice = () => {
    if (!weatherData) return null;
    // Note: We check Celsius values for logic, but display the current unit in UI
    // We convert the current temp to Celsius for the logic check if in imperial
    const tempInC =
      unit === "metric"
        ? weatherData.main.temp
        : ((weatherData.main.temp - 32) * 5) / 9;
    const wind = weatherData.wind.speed;

    if (tempInC <= 2) return "Frost risk tonight, cover your plants";
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
          <div className="weather-top-row">
            <div className="current-brief">
              <div className="location-header">
                <h2>{weatherData.name}</h2>
              </div>
              <p className="temp">
                {Math.round(weatherData.main.temp)}
                {unit === "metric" ? "°C" : "°F"}
              </p>
              {/* UNIT TOGGLE BUTTON */}
              <button className="unit-toggle" onClick={toggleUnit}>
                Displaying: {unit === "metric" ? "°C" : "°F"} (Switch)
              </button>
              <p className="desc">{weatherData.weather[0].description}</p>
            </div>

            <div className="forecast-row">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-box">
                  <span className="forecast-day">{getDayName(day.dt_txt)}</span>
                  <span className="forecast-temp">
                    {Math.round(day.main.temp)}
                    {unit === "metric" ? "°C" : "°F"}
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt="weather icon"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="weather-bottom-row">
            <div className="weather-notice-box">
              <strong>Weather Notice:</strong>
              <p>{renderWeatherNotice()}</p>
            </div>

            <div className="details">
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>
                Wind: {weatherData.wind.speed}{" "}
                {unit === "metric" ? "m/s" : "mph"}
              </p>
            </div>
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
