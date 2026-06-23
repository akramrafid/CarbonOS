import requests

def get_open_meteo_data(lat, lng):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&hourly=temperature_2m,relative_humidity_2m,precipitation&timezone=auto"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Calculate daily averages for the next 2 days (48 hours)
        temps = data['hourly']['temperature_2m'][:48]
        humidities = data['hourly']['relative_humidity_2m'][:48]
        
        avg_temp = sum(temps) / len(temps) if temps else 25
        avg_humidity = sum(humidities) / len(humidities) if humidities else 70
        
        return avg_temp, avg_humidity
    except Exception as e:
        print(f"Open-Meteo error: {e}")
        return None, None

def get_agro_data(lat, lng, poly_id="mock_poly"):
    api_key = "062104651c60e66e0115c841bd40f62e"
    # Note: The OpenWeatherMap Agro API requires registering a polygon first to get a poly_id.
    # URL: http://api.agromonitoring.com/agro/1.0/soil?polyid={poly_id}&appid={api_key}
    # For this MVP, we will simulate the agro response since polygon registration requires MRV pipeline setup.
    return {
        "soil_temp": 28.5,
        "soil_moisture": 0.4
    }

def get_open_weather_data(lat, lng):
    api_key = "895284852c5a6104617a26ba3534b46c"
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={api_key}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        temp = data['main']['temp']
        humidity = data['main']['humidity']
        return temp, humidity
    except Exception as e:
        print(f"OpenWeather API error, falling back: {e}")
        return None, None

def calculate_disease_risk(lat, lng, species):
    avg_temp, avg_humidity = get_open_weather_data(lat, lng)
    
    if avg_temp is None or avg_humidity is None:
        avg_temp, avg_humidity = get_open_meteo_data(lat, lng)
    
    if avg_temp is None or avg_humidity is None:
        # Fallback if both APIs fail
        avg_temp, avg_humidity = 28.0, 75.0
        
    agro_data = get_agro_data(lat, lng)
    
    risk_index = 0.2
    summary = "আবহাওয়া স্বাভাবিক। রোগের ঝুঁকি কম।"
    disease_risk_type = "none"
    
    if species == 'rice':
        # Blast risk: High humidity + moderate temp
        if avg_humidity > 85 and 25 <= avg_temp <= 30:
            risk_index = 0.85
            disease_risk_type = "fungal_blast"
            summary = f"আগামী ২ দিন অতিরিক্ত আর্দ্রতার ({avg_humidity:.1f}%) কারণে ব্লাস্ট বা ছত্রাকজনিত রোগের ঝুঁকি বেশি। সতর্ক থাকুন।"
        elif avg_humidity > 75:
            risk_index = 0.50
            disease_risk_type = "fungal_moderate"
            summary = "মাঝারি আর্দ্রতা। নিয়মিত খেত পর্যবেক্ষণ করুন।"
            
    elif species in ['potato', 'tomato']:
        # Late blight: High humidity + cool temp
        if avg_humidity > 85 and avg_temp < 24:
            risk_index = 0.90
            disease_risk_type = "late_blight"
            summary = f"ঠান্ডা ও আর্দ্র আবহাওয়ার ({avg_temp:.1f}°C) কারণে লেট ব্লাইট রোগের মারাত্মক ঝুঁকি রয়েছে।"
            
    elif species in ['mango', 'jackfruit', 'guava', 'citrus']:
        # Anthracnose risk for Tier B trees
        if avg_humidity > 80 and avg_temp > 28:
            risk_index = 0.75
            disease_risk_type = "anthracnose"
            summary = f"গরম ও আর্দ্র আবহাওয়ার ({avg_temp:.1f}°C, {avg_humidity:.1f}%) কারণে অ্যানথ্রাকনোজ রোগের ঝুঁকি রয়েছে।"

    return risk_index, summary, disease_risk_type
