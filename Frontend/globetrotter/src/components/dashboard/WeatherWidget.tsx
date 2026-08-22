import React, { useState, useEffect } from 'react';
import { api, WeatherData } from '../../services/api.ts';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Luggage,
  Sparkles,
} from 'lucide-react';

interface WeatherWidgetProps {
  locationName: string;
  lat?: number;
  lon?: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  locationName,
  lat,
  lon,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        const data = await api.getWeather(locationName, lat, lon);
        setWeather(data);
      } catch {
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [locationName, lat, lon]);

  if (loading) {
    return (
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-5 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e0e0d5]" />
          <div>
            <div className="w-24 h-4 bg-[#e0e0d5] rounded-md mb-1" />
            <div className="w-32 h-3 bg-[#e0e0d5] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center text-2xl shadow-xs">
            {weather.emoji}
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#5d6d5a]">
              <Sparkles className="w-3 h-3 text-[#d4a373]" />
              Live Destination Climate
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2d3436]">
              {weather.location}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            {weather.temperature}°C
          </div>
          <div className="text-xs text-[#7f8c8d]">
            {weather.condition} • Feels like {weather.feelsLike}°C
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
          <div>
            <span className="text-[10px] text-[#7f8c8d] block">Humidity</span>
            <span className="text-xs font-bold text-[#2d3436]">{weather.humidity}%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] flex items-center gap-2">
          <Wind className="w-4 h-4 text-[#5d6d5a] shrink-0" />
          <div>
            <span className="text-[10px] text-[#7f8c8d] block">Wind Speed</span>
            <span className="text-xs font-bold text-[#2d3436]">{weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-[#d4a373] shrink-0" />
          <div>
            <span className="text-[10px] text-[#7f8c8d] block">Precipitation</span>
            <span className="text-xs font-bold text-[#2d3436]">{weather.precipitation} mm</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Row */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="pt-2 border-t border-[#e0e0d5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d] block mb-2">
            5-Day Travel Forecast
          </span>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {weather.forecast.map((day, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] flex flex-col items-center justify-between"
              >
                <span className="text-[10px] font-bold text-[#7f8c8d]">{day.dayName}</span>
                <span className="text-lg my-1">{day.emoji}</span>
                <span className="text-xs font-bold text-[#2d3436]">{day.maxTemp}°</span>
                <span className="text-[10px] text-[#7f8c8d]">{day.minTemp}°</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packing Advice Tip */}
      {weather.packingTip && (
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
          <Luggage className="w-4 h-4 shrink-0 text-amber-700" />
          <span>{weather.packingTip}</span>
        </div>
      )}
    </div>
  );
};
