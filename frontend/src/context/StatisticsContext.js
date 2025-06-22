import React, { createContext, useState, useEffect } from 'react';
import { getAllYears } from '../services/statisticsService';

export const StatisticsContext = createContext();

export const StatisticsProvider = ({ children }) => {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        const response = await getAllYears();
        setYears(response.data);
        
        // Set active year to the most recent one
        const activeYearData = response.data.find(year => year.isActive);
        if (activeYearData) {
          setActiveYear(activeYearData.year);
        } else if (response.data.length > 0) {
          setActiveYear(response.data[0].year);
        }
        
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to fetch years');
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  return (
    <StatisticsContext.Provider value={{ 
      years, 
      activeYear,
      setActiveYear,
      loading,
      error
    }}>
      {children}
    </StatisticsContext.Provider>
  );
};
