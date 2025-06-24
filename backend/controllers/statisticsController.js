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
      
      // Fix case sensitivity - use programId instead of ProgramId
      const facultyStats = statistics.filter(stat => programIds.includes(stat.programId));
      
      // Debug: Log the number of stats per faculty
      console.log(`Faculty ${faculty.name} has ${facultyStats.length} statistics entries`);
      console.log(`KIP recipients: ${facultyStats.reduce((sum, stat) => sum + stat.kipRecipients, 0)}`);
      
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

    // Add registration statistics
    const registrationStats = {
      registeredDocs: statistics.reduce((sum, stat) => sum + (stat.registeredDocs || 0), 0),
      registeredPayment: statistics.reduce((sum, stat) => sum + (stat.registeredPayment || 0), 0)
    };

    // NEW: Calculate program competitiveness statistics
    const programs = await Program.findAll({
      include: [Faculty]
    });
    
    const programCompetitiveness = [];
    
    // Group statistics by program
    const programStatsMap = {};
    statistics.forEach(stat => {
      if (!programStatsMap[stat.programId]) {
        programStatsMap[stat.programId] = {
          totalApplicants: 0,
          totalAccepted: 0,
          programName: stat.Program.name,
          facultyName: stat.Program.Faculty.name,
          facultyAbbreviation: stat.Program.Faculty.abbreviation
        };
      }
      
      programStatsMap[stat.programId].totalApplicants += stat.totalApplicants;
      programStatsMap[stat.programId].totalAccepted += stat.totalAccepted;
    });
    
    // Calculate competitiveness metrics for each program
    Object.keys(programStatsMap).forEach(programId => {
      const stats = programStatsMap[programId];
      const ratio = stats.totalAccepted > 0 
        ? (stats.totalApplicants / stats.totalAccepted).toFixed(2) 
        : null;
        
      const acceptanceRate = stats.totalApplicants > 0 
        ? ((stats.totalAccepted / stats.totalApplicants) * 100).toFixed(2) 
        : null;
        
      programCompetitiveness.push({
        programId,
        programName: stats.programName,
        facultyName: stats.facultyName,
        facultyAbbreviation: stats.facultyAbbreviation,
        totalApplicants: stats.totalApplicants,
        totalAccepted: stats.totalAccepted,
        competitivenessRatio: ratio,
        acceptanceRate
      });
    });
    
    // Sort by competitiveness ratio (highest to lowest)
    programCompetitiveness.sort((a, b) => 
      b.competitivenessRatio - a.competitivenessRatio
    );

    res.json({
      success: true,
      data: {
        year: academicYear.year,
        overallStats,
        registrationStats, // Add this to the response
        admissionPathStats,
        facultyStats,
        programCompetitiveness, // Add this to the response
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
        programId: {  // Fix: Changed from ProgramId to programId
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
    
    // Check if both years exist in database (separately instead of using length check)
    const year1Data = await AcademicYear.findOne({
      where: { year: year1 }
    });
    
    const year2Data = await AcademicYear.findOne({
      where: { year: year2 }
    });
    
    if (!year1Data || !year2Data) {
      return res.status(404).json({
        success: false,
        message: 'Satu atau kedua tahun yang diminta tidak ditemukan'
      });
    }
    
    // Get all admission paths
    const admissionPaths = await AdmissionPath.findAll();
    
    // Get statistics for both years - note we need to query with both year IDs even if they're the same
    const statistics = await AdmissionStatistics.findAll({
      where: {
        academicYearId: {
          [Op.in]: [year1Data.id, year2Data.id]
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
    
    // Get numeric years to determine which is newer
    const year1Num = parseInt(year1);
    const year2Num = parseInt(year2);
    
    // Determine which year is newer to calculate percentage change correctly
    let newerYearStats, olderYearStats, newerYearNum, olderYearNum;
    if (year1Num > year2Num) {
      newerYearStats = year1Stats;
      olderYearStats = year2Stats;
      newerYearNum = year1Num;
      olderYearNum = year2Num;
    } else {
      newerYearStats = year2Stats;
      olderYearStats = year1Stats;
      newerYearNum = year2Num;
      olderYearNum = year1Num;
    }
    
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
    
    // Calculate percentage changes - FIXED to always go from older year to newer year
    const olderYearApplicants = olderYearStats.reduce((sum, stat) => sum + stat.totalApplicants, 0);
    const newerYearApplicants = newerYearStats.reduce((sum, stat) => sum + stat.totalApplicants, 0);
    
    const olderYearAccepted = olderYearStats.reduce((sum, stat) => sum + stat.totalAccepted, 0);
    const newerYearAccepted = newerYearStats.reduce((sum, stat) => sum + stat.totalAccepted, 0);
    
    compareOverall.change.totalApplicants = 
      ((newerYearApplicants - olderYearApplicants) / 
       olderYearApplicants * 100).toFixed(2);
       
    compareOverall.change.totalAccepted = 
      ((newerYearAccepted - olderYearAccepted) / 
       olderYearAccepted * 100).toFixed(2);
    
    // Compare by admission path
    const compareByPath = {};
    
    admissionPaths.forEach(path => {
      const pathYear1 = year1Stats.filter(stat => stat.admissionPathId === path.id);
      const pathYear2 = year2Stats.filter(stat => stat.admissionPathId === path.id);
      
      // Determine newer and older stats for this path
      let pathOlderYearStats, pathNewerYearStats;
      if (year1Num > year2Num) {
        pathNewerYearStats = pathYear1;
        pathOlderYearStats = pathYear2;
      } else {
        pathNewerYearStats = pathYear2;
        pathOlderYearStats = pathYear1;
      }
      
      const pathOlderApplicants = pathOlderYearStats.reduce((sum, stat) => sum + stat.totalApplicants, 0);
      const pathNewerApplicants = pathNewerYearStats.reduce((sum, stat) => sum + stat.totalApplicants, 0);
      
      const pathOlderAccepted = pathOlderYearStats.reduce((sum, stat) => sum + stat.totalAccepted, 0);
      const pathNewerAccepted = pathNewerYearStats.reduce((sum, stat) => sum + stat.totalAccepted, 0);
      
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
      
      // Calculate percentage changes from older year to newer year
      compareByPath[path.name].change.totalApplicants = pathOlderApplicants ? 
        (((pathNewerApplicants - pathOlderApplicants) / pathOlderApplicants) * 100).toFixed(2) : 'N/A';
      
      compareByPath[path.name].change.totalAccepted = pathOlderAccepted ? 
        (((pathNewerAccepted - pathOlderAccepted) / pathOlderAccepted) * 100).toFixed(2) : 'N/A';
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
    
    // Add additional validation for KIP statistics
    if (kipApplicants > totalApplicants) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah pendaftar KIP tidak boleh melebihi total pendaftar'
      });
    }
    
    if (kipRecipients > kipApplicants) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah penerima KIP tidak boleh melebihi jumlah pendaftar KIP'
      });
    }

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
      academicYearId: academicYearId,
      programId: programId,
      admissionPathId: admissionPathId,
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
    
    // Add KIP validation if data is being updated
    if (req.body.kipApplicants !== undefined && req.body.totalApplicants !== undefined) {
      if (req.body.kipApplicants > req.body.totalApplicants) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah pendaftar KIP tidak boleh melebihi total pendaftar'
        });
      }
    }
    
    if (req.body.kipRecipients !== undefined && req.body.kipApplicants !== undefined) {
      if (req.body.kipRecipients > req.body.kipApplicants) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah penerima KIP tidak boleh melebihi jumlah pendaftar KIP'
        });
      }
    }

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