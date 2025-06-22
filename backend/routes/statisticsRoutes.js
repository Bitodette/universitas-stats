const express = require('express');
const { 
  getYearlyStatistics, 
  getStatisticsByFaculty,
  getAllYears,
  getComparisonData,
  getAllEntries,
  createStatisticsEntry,
  updateStatisticsEntry,
  deleteStatisticsEntry
} = require('../controllers/statisticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/years', getAllYears);
router.get('/year/:year', getYearlyStatistics);
router.get('/faculty/:facultyId', getStatisticsByFaculty);
router.get('/compare/:year1/:year2', getComparisonData);

// Protected routes (admin only)
router.get('/entries', protect, authorize('admin'), getAllEntries);
router.post('/', protect, authorize('admin'), createStatisticsEntry);
router.put('/:id', protect, authorize('admin'), updateStatisticsEntry);
router.delete('/:id', protect, authorize('admin'), deleteStatisticsEntry);

module.exports = router;
