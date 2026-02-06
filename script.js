const geoUrl = "https://geocoding-api.open-meteo.com/v1/search";
const weatherUrl = "https://api.open-meteo.com/v1/forecast";

const cityInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const tempEl = document.querySelector(".temp");
const cityEl = document.querySelector(".city");
const humidityEl = document.querySelector("p.humidity");
const windEl = document.querySelector("p.wind");
const weatherIconEl = document.querySelector(".weatherImg img");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json();
}

async function getCityLocation(name) {
  const url = `${geoUrl}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const data = await fetchJson(url);
  if (!data.results || data.results.length === 0) {
    return null;
  }
  return data.results[0];
}

async function getWeather(lat, lon) {
  const url = `${weatherUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;
  const data = await fetchJson(url);
  return data.current;
}

function updateUI(city, current) {
  const cityName = city.admin1 ? `${city.name}, ${city.admin1}` : city.name;
  cityEl.textContent = cityName;
  tempEl.innerHTML = `${Math.round(current.temperature_2m)}<sup>o</sup>C`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  updateWeatherIcon(current.weather_code);
}

function updateWeatherIcon(code) {
  // Open-Meteo weather codes: map to simple icons
  const iconMap = [
    { codes: [0], icon: "sun" },
    { codes: [1, 2], icon: "cloud-sun" },
    { codes: [3], icon: "cloud" },
    { codes: [45, 48], icon: "cloud-fog" },
    { codes: [51, 53, 55, 56, 57], icon: "cloud-drizzle" },
    { codes: [61, 63, 65, 66, 67], icon: "cloud-rain" },
    { codes: [71, 73, 75, 77], icon: "cloud-snow" },
    { codes: [80, 81, 82], icon: "cloud-rain-wind" },
    { codes: [85, 86], icon: "cloud-snow" },
    { codes: [95, 96, 99], icon: "cloud-lightning" },
  ];

  const match = iconMap.find((item) => item.codes.includes(code));
  const iconName = match ? match.icon : "cloud";
  weatherIconEl.src = `https://unpkg.com/lucide-static@latest/icons/${iconName}.svg`;
  weatherIconEl.alt = "Weather icon";
}

async function searchCity() {
  const name = cityInput.value.trim();
  if (!name) return;

  try {
    const city = await getCityLocation(name);
    if (!city) {
      cityEl.textContent = "City not found";
      return;
    }

    const current = await getWeather(city.latitude, city.longitude);
    updateUI(city, current);
  } catch (err) {
    cityEl.textContent = "Error fetching weather";
  }
}

searchBtn.addEventListener("click", searchCity);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchCity();
});
