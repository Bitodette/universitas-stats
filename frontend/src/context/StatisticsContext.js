import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAllYears } from '../services/statisticsService';

export const StatisticsContext = createContext();

export const StatisticsProvider = ({ children }) => {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchYears = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllYears();
      setYears(response.data);
      
      // Set active year to the most recent one or the marked active one
      const activeYearData = response.data.find(year => year.isActive);
      if (activeYearData) {
        setActiveYear(activeYearData.year);
      } else if (response.data.length > 0) {
        // If no active year is marked, use the newest one (assuming descending order by year)
        const sortedYears = [...response.data].sort((a, b) => b.year - a.year);
        setActiveYear(sortedYears[0].year);
      } else {
        // Reset active year if there are no years available
        setActiveYear(null);
      }
      
      setError(null);
    } catch (error) {
      setError(error.message || 'Failed to fetch years');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  return (
    <StatisticsContext.Provider value={{ 
      years, 
      activeYear,
      setActiveYear,
      loading,
      error,
      refreshYears: fetchYears
    }}>
      {children}
    </StatisticsContext.Provider>
  );
};
