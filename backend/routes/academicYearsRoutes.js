const express = require('express');
const { 
  getAcademicYears, 
  createAcademicYear, 
  updateAcademicYear,
  deleteAcademicYear 
} = require('../controllers/academicYearController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAcademicYears);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createAcademicYear);
router.put('/:id', protect, authorize('admin'), updateAcademicYear);
router.delete('/:id', protect, authorize('admin'), deleteAcademicYear);

module.exports = router;
