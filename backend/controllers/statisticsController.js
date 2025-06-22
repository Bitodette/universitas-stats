const { Op } = require('sequelize');
const { 
  AcademicYear, 
  AdmissionPath, 
  Faculty, 
  Program, 
  AdmissionStatistics 
} = require('../models/Statistics');

// @desc    Get all academic years
// @route   GET /api/statistics/years
// @access  Public
exports.getAllYears = async (req, res, next) => {
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

// @desc    Get statistics for a specific year
// @route   GET /api/statistics/year/:year
// @access  Public
exports.getYearlyStatistics = async (req, res, next) => {
  try {
    const { year } = req.params;

    // Find academic year id
    const academicYear = await AcademicYear.findOne({
      where: { year }
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: `Data tahun ${year} tidak ditemukan`
      });
    }

    // Get all admission paths
    const admissionPaths = await AdmissionPath.findAll();
    
    // Get all statistics for this year
    const statistics = await AdmissionStatistics.findAll({
      where: { academicYearId: academicYear.id },
      include: [
        { model: Program, include: [Faculty] },
        { model: AdmissionPath }
      ]
    });

    // Aggregate data by admission path
    const admissionPathStats = admissionPaths.map(path => {
      const pathStats = statistics.filter(stat => stat.AdmissionPath.id === path.id);
      
      return {
        pathId: path.id,
        pathName: path.name,
        totalApplicants: pathStats.reduce((sum, stat) => sum + stat.totalApplicants, 0),
        totalAccepted: pathStats.reduce((sum, stat) => sum + stat.totalAccepted, 0),
        maleApplicants: pathStats.reduce((sum, stat) => sum + stat.maleApplicants, 0),
        femaleApplicants: pathStats.reduce((sum, stat) => sum + stat.femaleApplicants, 0),
        maleAccepted: pathStats.reduce((sum, stat) => sum + stat.maleAccepted, 0),
        femaleAccepted: pathStats.reduce((sum, stat) => sum + stat.femaleAccepted, 0),
        kipApplicants: pathStats.reduce((sum, stat) => sum + stat.kipApplicants, 0),
        kipRecipients: pathStats.reduce((sum, stat) => sum + stat.kipRecipients, 0)
      };
    });

    // Aggregate data by faculty
    const faculties = await Faculty.findAll({
      include: [{
        model: Program
      }]
    });
    
    const facultyStats = faculties.map(faculty => {
      const programIds = faculty.Programs.map(program => program.id);
      const facultyStats = statistics.filter(stat => programIds.includes(stat.ProgramId));
      
      return {
        facultyId: faculty.id,
        facultyName: faculty.name,
        abbreviation: faculty.abbreviation,
        totalApplicants: facultyStats.reduce((sum, stat) => sum + stat.totalApplicants, 0),
        totalAccepted: facultyStats.reduce((sum, stat) => sum + stat.totalAccepted, 0),
        maleAccepted: facultyStats.reduce((sum, stat) => sum + stat.maleAccepted, 0),
        femaleAccepted: facultyStats.reduce((sum, stat) => sum + stat.femaleAccepted, 0),
        kipRecipients: facultyStats.reduce((sum, stat) => sum + stat.kipRecipients, 0)
      };
    });

    // Get overall statistics
    const overallStats = {
      totalApplicants: statistics.reduce((sum, stat) => sum + stat.totalApplicants, 0),
      totalAccepted: statistics.reduce((sum, stat) => sum + stat.totalAccepted, 0),
      maleApplicants: statistics.reduce((sum, stat) => sum + stat.maleApplicants, 0),
      femaleApplicants: statistics.reduce((sum, stat) => sum + stat.femaleApplicants, 0),
      maleAccepted: statistics.reduce((sum, stat) => sum + stat.maleAccepted, 0),
      femaleAccepted: statistics.reduce((sum, stat) => sum + stat.femaleAccepted, 0),
      kipApplicants: statistics.reduce((sum, stat) => sum + stat.kipApplicants, 0),
      kipRecipients: statistics.reduce((sum, stat) => sum + stat.kipRecipients, 0)
    };

    res.json({
      success: true,
      data: {
        year: academicYear.year,
        overallStats,
        admissionPathStats,
        facultyStats,
        rawData: statistics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get statistics for a specific faculty
// @route   GET /api/statistics/faculty/:facultyId
// @access  Public
exports.getStatisticsByFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    
    const faculty = await Faculty.findByPk(facultyId, {
      include: [{ model: Program }]
    });
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Fakultas tidak ditemukan'
      });
    }
    
    const programIds = faculty.Programs.map(program => program.id);
    
    const statistics = await AdmissionStatistics.findAll({
      where: {
        ProgramId: {
          [Op.in]: programIds
        }
      },
      include: [
        { model: Program },
        { model: AdmissionPath },
        { model: AcademicYear }
      ],
      order: [
        [{ model: AcademicYear }, 'year', 'DESC']
      ]
    });
    
    // Group by program and then by year
    const programStats = {};
    
    statistics.forEach(stat => {
      if (!programStats[stat.Program.name]) {
        programStats[stat.Program.name] = {};
      }
      
      if (!programStats[stat.Program.name][stat.AcademicYear.year]) {
        programStats[stat.Program.name][stat.AcademicYear.year] = {
          byAdmissionPath: {}
        };
      }
      
      const pathName = stat.AdmissionPath.name;
      programStats[stat.Program.name][stat.AcademicYear.year].byAdmissionPath[pathName] = {
        totalApplicants: stat.totalApplicants,
        totalAccepted: stat.totalAccepted,
        maleAccepted: stat.maleAccepted,
        femaleAccepted: stat.femaleAccepted,
        kipRecipients: stat.kipRecipients
      };
    });
    
    res.json({
      success: true,
      data: {
        faculty: {
          name: faculty.name,
          abbreviation: faculty.abbreviation
        },
        programStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare statistics between two years
// @route   GET /api/statistics/compare/:year1/:year2
// @access  Public
exports.getComparisonData = async (req, res, next) => {
  try {
    const { year1, year2 } = req.params;
    
    // Get academic year IDs
    const academicYears = await AcademicYear.findAll({
      where: {
        year: {
          [Op.in]: [year1, year2]
        }
      }
    });
    
    if (academicYears.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'Satu atau kedua tahun yang diminta tidak ditemukan'
      });
    }
    
    // Get all admission paths
    const admissionPaths = await AdmissionPath.findAll();
    
    // Get statistics for both years
    const statistics = await AdmissionStatistics.findAll({
      where: {
        AcademicYearId: {
          [Op.in]: academicYears.map(year => year.id)
        }
      },
      include: [
        { model: Program, include: [Faculty] },
        { model: AdmissionPath },
        { model: AcademicYear }
      ]
    });
    
    // Split statistics by year
    const year1Stats = statistics.filter(stat => stat.AcademicYear.year === year1);
    const year2Stats = statistics.filter(stat => stat.AcademicYear.year === year2);
    
    // Compare overall stats
    const compareOverall = {
      year1: {
        totalApplicants: year1Stats.reduce((sum, stat) => sum + stat.totalApplicants, 0),
        totalAccepted: year1Stats.reduce((sum, stat) => sum + stat.totalAccepted, 0)
      },
      year2: {
        totalApplicants: year2Stats.reduce((sum, stat) => sum + stat.totalApplicants, 0),
        totalAccepted: year2Stats.reduce((sum, stat) => sum + stat.totalAccepted, 0)
      },
      change: {
        totalApplicants: 0,
        totalAccepted: 0
      }
    };
    
    // Calculate percentage changes
    compareOverall.change.totalApplicants = 
      ((compareOverall.year2.totalApplicants - compareOverall.year1.totalApplicants) / 
       compareOverall.year1.totalApplicants * 100).toFixed(2);
       
    compareOverall.change.totalAccepted = 
      ((compareOverall.year2.totalAccepted - compareOverall.year1.totalAccepted) / 
       compareOverall.year1.totalAccepted * 100).toFixed(2);
    
    // Compare by admission path
    const compareByPath = {};
    
    admissionPaths.forEach(path => {
      const pathYear1 = year1Stats.filter(stat => stat.AdmissionPathId === path.id);
      const pathYear2 = year2Stats.filter(stat => stat.AdmissionPathId === path.id);
      
      compareByPath[path.name] = {
        year1: {
          totalApplicants: pathYear1.reduce((sum, stat) => sum + stat.totalApplicants, 0),
          totalAccepted: pathYear1.reduce((sum, stat) => sum + stat.totalAccepted, 0)
        },
        year2: {
          totalApplicants: pathYear2.reduce((sum, stat) => sum + stat.totalApplicants, 0),
          totalAccepted: pathYear2.reduce((sum, stat) => sum + stat.totalAccepted, 0)
        },
        change: {}
      };
      
      // Calculate percentage changes if year1 values are not zero
      const y1Apps = compareByPath[path.name].year1.totalApplicants;
      const y1Acc = compareByPath[path.name].year1.totalAccepted;
      
      compareByPath[path.name].change.totalApplicants = y1Apps ? 
        (((compareByPath[path.name].year2.totalApplicants - y1Apps) / y1Apps) * 100).toFixed(2) : 'N/A';
      
      compareByPath[path.name].change.totalAccepted = y1Acc ? 
        (((compareByPath[path.name].year2.totalAccepted - y1Acc) / y1Acc) * 100).toFixed(2) : 'N/A';
    });
    
    res.json({
      success: true,
      data: {
        years: { year1, year2 },
        compareOverall,
        compareByPath
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new statistics entry
// @route   POST /api/statistics
// @access  Private/Admin
exports.createStatisticsEntry = async (req, res, next) => {
  try {
    const {
      academicYearId,
      programId,
      admissionPathId,
      totalApplicants,
      maleApplicants,
      femaleApplicants,
      totalAccepted,
      maleAccepted,
      femaleAccepted,
      kipApplicants,
      kipRecipients
    } = req.body;
    
    // Check if entry already exists
    const existingEntry = await AdmissionStatistics.findOne({
      where: {
        academicYearId,
        programId,
        admissionPathId
      }
    });
    
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Data untuk tahun, program, dan jalur masuk ini sudah ada'
      });
    }
    
    const newEntry = await AdmissionStatistics.create({
      academicYearId: academicYearId, // Changed from AcademicYearId to academicYearId
      programId: programId, // Changed from ProgramId to programId
      admissionPathId: admissionPathId, // Changed from AdmissionPathId to admissionPathId
      totalApplicants,
      maleApplicants,
      femaleApplicants,
      totalAccepted,
      maleAccepted,
      femaleAccepted,
      kipApplicants,
      kipRecipients
    });
    
    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update statistics entry
// @route   PUT /api/statistics/:id
// @access  Private/Admin
exports.updateStatisticsEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const entry = await AdmissionStatistics.findByPk(id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Data statistik tidak ditemukan'
      });
    }
    
    const updatedEntry = await entry.update(req.body);
    
    res.json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete statistics entry
// @route   DELETE /api/statistics/:id
// @access  Private/Admin
exports.deleteStatisticsEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const entry = await AdmissionStatistics.findByPk(id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Data statistik tidak ditemukan'
      });
    }
    
    await entry.destroy();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all statistics entries
// @route   GET /api/statistics/entries
// @access  Private/Admin
exports.getAllEntries = async (req, res, next) => {
  try {
    const entries = await AdmissionStatistics.findAll({
      include: [
        { 
          model: Program,
          include: [Faculty]
        },
        { model: AdmissionPath },
        { model: AcademicYear }
      ],
      order: [
        [{ model: AcademicYear }, 'year', 'DESC'],
        [{ model: Program }, 'name', 'ASC'],
        [{ model: AdmissionPath }, 'name', 'ASC']
      ]
    });
    
    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};