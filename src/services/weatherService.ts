import axios from 'axios'

export interface CurrentWeather {
  location: string
  date: string
  temperature: number
  description: string
  icon: string
  feelsLike: number
  humidity: number
  precipitation: number
  windSpeed: number
  fineDust: string
  ultraFineDust: string
}

export interface HourlyWeather {
  time: string
  temp: number
  rain: number
  icon: string
  desc: string
}

export interface DailyWeather {
  day: string
  date: string
  maxTemp: number
  minTemp: number
  rain: number
  fillPercent: number
  icon: string
  desc: string
}

export interface WeatherData {
  current: CurrentWeather
  hourly: HourlyWeather[]
  daily: DailyWeather[]
}

// 날씨 코드를 아이콘 및 설명으로 변환
function getWeatherInfo(code: number): { icon: string; desc: string } {
  const weatherMap: Record<number, { icon: string; desc: string }> = {
    0: { icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' },
    1: { icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '대체로 맑음' },
    2: { icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', desc: '구름 조금' },
    3: { icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '흐림' },
    45: { icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '안개' },
    48: { icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '안개' },
    51: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675876.png', desc: '가벼운 이슬비' },
    53: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675876.png', desc: '이슬비' },
    55: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675876.png', desc: '강한 이슬비' },
    61: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '약한 비' },
    63: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '비' },
    65: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '강한 비' },
    71: { icon: 'https://cdn-icons-png.flaticon.com/512/2315/2315377.png', desc: '약한 눈' },
    73: { icon: 'https://cdn-icons-png.flaticon.com/512/2315/2315377.png', desc: '눈' },
    75: { icon: 'https://cdn-icons-png.flaticon.com/512/2315/2315377.png', desc: '강한 눈' },
    80: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '소나기' },
    81: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '소나기' },
    82: { icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '강한 소나기' },
    95: { icon: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', desc: '뇌우' },
    96: { icon: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', desc: '우박을 동반한 뇌우' },
    99: { icon: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', desc: '강한 우박을 동반한 뇌우' }
  }

  return weatherMap[code] || { icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '알 수 없음' }
}

// 체감온도 계산 (풍속과 온도 기반)
function calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  // 간단한 체감온도 공식
  if (temp <= 10 && windSpeed > 1.3) {
    // 추운 날씨의 체감온도 (Wind Chill)
    return Math.round(
      13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed * 3.6, 0.16) +
      0.3965 * temp * Math.pow(windSpeed * 3.6, 0.16)
    )
  } else if (temp >= 27) {
    // 더운 날씨의 체감온도 (Heat Index)
    const heatIndex =
      -8.78469475556 +
      1.61139411 * temp +
      2.33854883889 * humidity -
      0.14611605 * temp * humidity
    return Math.round(heatIndex)
  }
  return Math.round(temp)
}

// PM 수치를 등급으로 변환
function getPMLevel(pm10: number | undefined, pm25: number | undefined, type: 'pm10' | 'pm25'): string {
  const value = type === 'pm10' ? (pm10 || 0) : (pm25 || 0)

  if (type === 'pm10') {
    if (value <= 30) return '좋음'
    if (value <= 80) return '보통'
    if (value <= 150) return '나쁨'
    return '매우나쁨'
  } else {
    if (value <= 15) return '좋음'
    if (value <= 35) return '보통'
    if (value <= 75) return '나쁨'
    return '매우나쁨'
  }
}

// 위치명을 주소로 변환 (Geocoding Reverse)
async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    // Open-Meteo의 Geocoding API 사용
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: `${lat},${lon}`,
        count: 1,
        language: 'ko',
        format: 'json'
      }
    })

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0]
      return result.name || '위치 정보 없음'
    }
  } catch (error) {
    console.error('Failed to get location name:', error)
  }

  // 기본값: 좌표 표시
  return `위도 ${lat.toFixed(2)}°, 경도 ${lon.toFixed(2)}°`
}

// 사용자 위치 가져오기
export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // 위치 권한 거부 시 서울 기본값
          resolve({ lat: 37.5665, lon: 126.9780 })
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      // Geolocation을 지원하지 않는 브라우저
      resolve({ lat: 37.5665, lon: 126.9780 })
    }
  })
}

// 현재 날씨 및 예보 데이터 가져오기
export async function getWeatherData(lat?: number, lon?: number): Promise<WeatherData> {
  try {
    // 위치가 제공되지 않으면 사용자 위치 가져오기
    let location = { lat: lat || 37.5665, lon: lon || 126.9780 }
    if (!lat || !lon) {
      location = await getUserLocation()
    }

    // 날씨 데이터 가져오기
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: location.lat,
        longitude: location.lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
        timezone: 'Asia/Seoul',
        forecast_days: 7
      }
    })

    // 대기질 데이터 가져오기
    let airQualityData = { current: { pm10: undefined, pm2_5: undefined } }
    try {
      const airQualityResponse = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: location.lat,
          longitude: location.lon,
          current: 'pm10,pm2_5',
          timezone: 'Asia/Seoul'
        }
      })
      airQualityData = airQualityResponse.data
    } catch (error) {
      console.warn('Air quality data not available:', error)
    }

    const weatherData = weatherResponse.data
    const locationName = await getLocationName(location.lat, location.lon)

    // 현재 날씨 데이터 변환
    const currentWeatherCode = weatherData.current.weather_code
    const currentWeatherInfo = getWeatherInfo(currentWeatherCode)
    const currentTemp = Math.round(weatherData.current.temperature_2m)
    const feelsLike = weatherData.current.apparent_temperature
      ? Math.round(weatherData.current.apparent_temperature)
      : calculateFeelsLike(currentTemp, weatherData.current.wind_speed_10m, weatherData.current.relative_humidity_2m)

    const current: CurrentWeather = {
      location: locationName,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      temperature: currentTemp,
      description: currentWeatherInfo.desc,
      icon: currentWeatherInfo.icon,
      feelsLike: feelsLike,
      humidity: Math.round(weatherData.current.relative_humidity_2m),
      precipitation: Math.round(weatherData.current.precipitation || 0),
      windSpeed: Math.round(weatherData.current.wind_speed_10m * 10) / 10,
      fineDust: getPMLevel(airQualityData.current.pm10, airQualityData.current.pm2_5, 'pm10'),
      ultraFineDust: getPMLevel(airQualityData.current.pm10, airQualityData.current.pm2_5, 'pm25')
    }

    // 시간별 예보 (다음 8시간)
    const hourly: HourlyWeather[] = []
    const currentHour = new Date().getHours()

    for (let i = 0; i < 8; i++) {
      const hourIndex = currentHour + i
      if (hourIndex < weatherData.hourly.time.length) {
        const weatherInfo = getWeatherInfo(weatherData.hourly.weather_code[hourIndex])
        const hour = new Date(weatherData.hourly.time[hourIndex]).getHours()

        hourly.push({
          time: i === 0 ? '지금' : `${hour}시`,
          temp: Math.round(weatherData.hourly.temperature_2m[hourIndex]),
          rain: Math.round(weatherData.hourly.precipitation_probability[hourIndex] || 0),
          icon: weatherInfo.icon,
          desc: weatherInfo.desc
        })
      }
    }

    // 주간 예보 (7일)
    const daily: DailyWeather[] = []
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    for (let i = 0; i < 7; i++) {
      if (i < weatherData.daily.time.length) {
        const date = new Date(weatherData.daily.time[i])
        const weatherInfo = getWeatherInfo(weatherData.daily.weather_code[i])
        const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i])
        const minTemp = Math.round(weatherData.daily.temperature_2m_min[i])

        // 온도 범위를 퍼센트로 계산 (시각화용)
        const tempRange = 40 // 가정: -10°C ~ 30°C
        const fillPercent = Math.round(((maxTemp + 10) / tempRange) * 100)

        daily.push({
          day: i === 0 ? '오늘' : dayNames[date.getDay()],
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          maxTemp: maxTemp,
          minTemp: minTemp,
          rain: Math.round(weatherData.daily.precipitation_probability_max[i] || 0),
          fillPercent: Math.max(0, Math.min(100, fillPercent)),
          icon: weatherInfo.icon,
          desc: weatherInfo.desc
        })
      }
    }

    return {
      current,
      hourly,
      daily
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    throw new Error('날씨 데이터를 가져오는데 실패했습니다.')
  }
}

// 도시 이름으로 위치 검색
export async function searchLocation(cityName: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: cityName,
        count: 1,
        language: 'ko',
        format: 'json'
      }
    })

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0]
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name
      }
    }
    return null
  } catch (error) {
    console.error('Failed to search location:', error)
    return null
  }
}
