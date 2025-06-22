const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Tahun akademik
const AcademicYear = sequelize.define('AcademicYear', {
  year: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'AcademicYears'  // Make sure this matches
});

// Jalur masuk
const AdmissionPath = sequelize.define('AdmissionPath', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'AdmissionPaths'  // Make sure this matches
});

// Fakultas
const Faculty = sequelize.define('Faculty', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  abbreviation: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Faculties'  // Make sure this matches
});

// Program studi
const Program = sequelize.define('Program', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Programs'  // Make sure this matches
});

// Statistik penerimaan
const AdmissionStatistics = sequelize.define('AdmissionStatistics', {
  totalApplicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maleApplicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  femaleApplicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalAccepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maleAccepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  femaleAccepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kipApplicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kipRecipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'AdmissionStatistics'  // Make sure this matches
});

// Relasi
Faculty.hasMany(Program);
Program.belongsTo(Faculty);

Program.hasMany(AdmissionStatistics, {
  foreignKey: 'programId' // Explicitly define foreign key name
});
AdmissionStatistics.belongsTo(Program, {
  foreignKey: 'programId' // Explicitly define foreign key name
});

AcademicYear.hasMany(AdmissionStatistics, {
  foreignKey: 'academicYearId' // Explicitly define foreign key name
});
AdmissionStatistics.belongsTo(AcademicYear, {
  foreignKey: 'academicYearId' // Explicitly define foreign key name
});

AdmissionPath.hasMany(AdmissionStatistics, {
  foreignKey: 'admissionPathId' // Explicitly define foreign key name
});
AdmissionStatistics.belongsTo(AdmissionPath, {
  foreignKey: 'admissionPathId' // Explicitly define foreign key name
});

module.exports = {
  AcademicYear,
  AdmissionPath,
  Faculty,
  Program,
  AdmissionStatistics
};