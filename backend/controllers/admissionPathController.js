const { AdmissionPath } = require('../models/Statistics');

// @desc    Get all admission paths
// @route   GET /api/admission-paths
// @access  Public
exports.getAdmissionPaths = async (req, res, next) => {
  try {
    const paths = await AdmissionPath.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: paths
    });
  } catch (error) {
    next(error);
  }
};
