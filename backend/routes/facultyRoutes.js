const express = require('express');
const { getFaculties, getPrograms } = require('../controllers/facultyController');

const router = express.Router();

// Get all faculties
router.get('/', getFaculties);

// Get programs for a specific faculty
router.get('/:id/programs', getPrograms);

module.exports = router;
