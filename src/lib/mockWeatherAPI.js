// Mock Weather API for Bangladesh Districts

const districtWeatherBase = {
  "Dhaka": { temp: 32, humidity: 75, rainBase: 20 },
  "Rajshahi": { temp: 36, humidity: 60, rainBase: 10 },
  "Sylhet": { temp: 28, humidity: 90, rainBase: 85 },
  "Chittagong": { temp: 31, humidity: 85, rainBase: 60 },
  "Khulna": { temp: 34, humidity: 80, rainBase: 40 },
  "Barisal": { temp: 30, humidity: 88, rainBase: 70 },
  "Rangpur": { temp: 29, humidity: 70, rainBase: 30 },
};

export const fetchMockWeather = async (district) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Determine base weather or default to Dhaka
  const base = districtWeatherBase[district] || districtWeatherBase["Dhaka"];
  
  const forecast = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add some random noise to the forecast
    const tempNoise = Math.floor(Math.random() * 5) - 2;
    const humNoise = Math.floor(Math.random() * 10) - 5;
    const rainNoise = Math.floor(Math.random() * 30) - 15;

    forecast.push({
      date: date.toISOString().split('T')[0],
      dayNameEn: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNameBn: getBanglaDay(date.getDay()),
      temperature: Math.max(20, base.temp + tempNoise),
      humidity: Math.min(100, Math.max(40, base.humidity + humNoise)),
      rainProbability: Math.min(100, Math.max(0, base.rainBase + rainNoise))
    });
  }

  return forecast;
};

const getBanglaDay = (dayIndex) => {
  const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
  return days[dayIndex];
};
