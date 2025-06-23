const { AcademicYear } = require('../models/Statistics');
const { sequelize } = require('../config/db'); // Add this import
const { debug } = require('../utils/debugger');

// @desc    Get all academic years
// @route   GET /api/academic-years
// @access  Public
exports.getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.findAll({
      order: [['year', 'DESC']]
    });

    res.json({
      success: true,
      data: years
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new academic year
// @route   POST /api/academic-years
// @access  Private/Admin
exports.createAcademicYear = async (req, res, next) => {
  // Start transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { year, isActive } = req.body;
    
    debug(`Creating new academic year: ${year}, isActive: ${isActive}`);
    
    // Validate year format
    if (!/^\d{4}$/.test(year)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Format tahun akademik tidak valid (harus 4 digit)'
      });
    }
    
    // Check if year already exists more carefully
    const existingYear = await AcademicYear.findOne({
      where: { year: year.toString() },
      transaction
    });
    
    if (existingYear) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Tahun akademik ${year} sudah ada`
      });
    }
    
    // If this new year is set as active, deactivate all others
    if (isActive) {
      debug('Setting new year as active, deactivating all others');
      await AcademicYear.update(
        { isActive: false },
        { 
          where: {}, 
          transaction 
        }
      );
    }
    
    // Create new year with transaction
    const newYear = await AcademicYear.create({
      year,
      isActive
    }, { transaction });
    
    // Explicitly commit the transaction
    await transaction.commit();
    
    debug(`New academic year created: ${year}, ID: ${newYear.id}`);
    
    // Return success response
    res.status(201).json({
      success: true,
      data: newYear
    });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    debug('Error creating academic year:', error);
    
    // More detailed error message
    let errorMessage = 'Gagal menambahkan tahun akademik';
    if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = `Tahun akademik ${req.body.year} sudah ada`;
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors[0]?.message || 'Data tidak valid';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update an academic year
// @route   PUT /api/academic-years/:id
// @access  Private/Admin
exports.updateAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const year = await AcademicYear.findByPk(id);
    
    if (!year) {
      return res.status(404).json({
        success: false,
        message: 'Tahun akademik tidak ditemukan'
      });
    }
    
    // If setting this year as active, deactivate all others
    if (isActive) {
      await AcademicYear.update(
        { isActive: false },
        { where: {} }
      );
    }
    
    const updatedYear = await year.update(req.body);
    
    res.json({
      success: true,
      data: updatedYear
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an academic year
// @route   DELETE /api/academic-years/:id
// @access  Private/Admin
exports.deleteAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const year = await AcademicYear.findByPk(id);
    
    if (!year) {
      return res.status(404).json({
        success: false,
        message: 'Tahun akademik tidak ditemukan'
      });
    }
    
    // Check if this year has associated statistics
    const { AdmissionStatistics } = require('../models/Statistics');
    const stats = await AdmissionStatistics.findOne({
      where: { academicYearId: id }
    });
    
    if (stats) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus tahun akademik yang memiliki data statistik'
      });
    }
    
    await year.destroy();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
