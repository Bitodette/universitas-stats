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
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// Public routes
router.get('/years', getAllYears);
router.get('/year/:year', getYearlyStatistics);
router.get('/faculty/:facultyId', getStatisticsByFaculty);
router.get('/compare/:year1/:year2', getComparisonData);

// Protected routes with role-based access and audit logging
router.get('/entries', protect, authorize('admin', 'editor', 'viewer'), getAllEntries);
router.post('/', 
  protect, 
  authorize('admin', 'editor'),
  auditLog('create', 'statistics'),
  createStatisticsEntry
);
router.put('/:id', 
  protect, 
  authorize('admin', 'editor'),
  auditLog('update', 'statistics'),
  updateStatisticsEntry
);
router.delete('/:id', 
  protect, 
  authorize('admin'),
  auditLog('delete', 'statistics'),
  deleteStatisticsEntry
);

module.exports = router;
