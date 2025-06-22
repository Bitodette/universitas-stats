import api from './api';

// Get all academic years
export const getAllYears = async () => {
  try {
    const response = await api.get('/statistics/years');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching years' };
  }
};

// Get statistics for a specific year
export const getYearlyStatistics = async (year) => {
  try {
    const response = await api.get(`/statistics/year/${year}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching yearly statistics' };
  }
};

// Get faculty statistics
export const getFacultyStatistics = async (facultyId) => {
  try {
    const response = await api.get(`/statistics/faculty/${facultyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching faculty statistics' };
  }
};

// Get comparison data between two years
export const getComparisonData = async (year1, year2) => {
  try {
    const response = await api.get(`/statistics/compare/${year1}/${year2}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching comparison data' };
  }
};
