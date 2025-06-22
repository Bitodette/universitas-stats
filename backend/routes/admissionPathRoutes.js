const express = require('express');
const { getAdmissionPaths } = require('../controllers/admissionPathController');

const router = express.Router();

router.get('/', getAdmissionPaths);

module.exports = router;
