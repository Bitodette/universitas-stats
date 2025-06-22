const { Faculty, Program } = require('../models/Statistics');

// @desc    Get all faculties
// @route   GET /api/faculties
// @access  Public
exports.getFaculties = async (req, res, next) => {
  try {
    const faculties = await Faculty.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: faculties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get programs for a specific faculty
// @route   GET /api/faculties/:id/programs
// @access  Public
exports.getPrograms = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const programs = await Program.findAll({
      where: { FacultyId: id },
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    next(error);
  }
};
