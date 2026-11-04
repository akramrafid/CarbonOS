// City-level model output, not farm observations or a validated crop-risk forecast.
const CITIES = {
  Dhaka: [23.8103, 90.4125], Rajshahi: [24.3636, 88.6241], Sylhet: [24.8949, 91.8687],
  Chittagong: [22.3569, 91.7832], Khulna: [22.8456, 89.5403], Barisal: [22.7010, 90.3535], Rangpur: [25.7508, 89.2467],
};

export async function fetchCityWeather(city, signal) {
  const coordinates = CITIES[city];
  if (!coordinates) throw new Error('Choose a supported weather city.');
  const params = new URLSearchParams({
    latitude: String(coordinates[0]), longitude: String(coordinates[1]),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
    wind_speed_unit: 'ms', timezone: 'Asia/Dhaka', forecast_days: '1',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error('Weather service is unavailable.');
  const data = await response.json();
  const current = data.current;
  const values = [current?.temperature_2m, current?.relative_humidity_2m, current?.wind_speed_10m];
  if (!values.every((value) => typeof value === 'number' && Number.isFinite(value)) ||
      values[0] < -90 || values[0] > 70 || values[1] < 0 || values[1] > 100 || values[2] < 0 ||
      typeof current?.time !== 'string' || !Number.isFinite(Date.parse(current.time)) ||
      data.timezone !== 'Asia/Dhaka' || data.current_units?.temperature_2m !== '°C' ||
      data.current_units?.relative_humidity_2m !== '%' || data.current_units?.wind_speed_10m !== 'm/s') {
    throw new Error('Weather service returned incomplete or unsupported data.');
  }
  return { temp: Math.round(values[0]), humidity: values[1], wind: values[2], time: current.time };
}
