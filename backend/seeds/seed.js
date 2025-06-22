const { sequelize } = require('../config/db');
const User = require('../models/User');
const { 
  AcademicYear, 
  AdmissionPath, 
  Faculty, 
  Program, 
  AdmissionStatistics 
} = require('../models/Statistics');

const seedData = async () => {
  try {
    // Force sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create academic years
    const years = await AcademicYear.bulkCreate([
      { year: '2023', isActive: false },
      { year: '2024', isActive: true }
    ]);
    console.log('Academic years created');

    // Create admission paths
    const paths = await AdmissionPath.bulkCreate([
      { name: 'SNBP', description: 'Seleksi Nasional Berdasarkan Prestasi' },
      { name: 'SNBT', description: 'Seleksi Nasional Berdasarkan Tes' },
      { name: 'Mandiri', description: 'Jalur Seleksi Mandiri Universitas' }
    ]);
    console.log('Admission paths created');

    // Create faculties
    const faculties = await Faculty.bulkCreate([
      { name: 'Fakultas Ilmu Komputer', abbreviation: 'FASILKOM' },
      { name: 'Fakultas Ekonomi dan Bisnis', abbreviation: 'FEB' },
      { name: 'Fakultas Teknik', abbreviation: 'FT' },
      { name: 'Fakultas Kedokteran', abbreviation: 'FK' }
    ]);
    console.log('Faculties created');

    // Create programs
    const programs = await Program.bulkCreate([
      { name: 'Ilmu Komputer', FacultyId: 1 },
      { name: 'Sistem Informasi', FacultyId: 1 },
      { name: 'Manajemen', FacultyId: 2 },
      { name: 'Akuntansi', FacultyId: 2 },
      { name: 'Teknik Sipil', FacultyId: 3 },
      { name: 'Teknik Elektro', FacultyId: 3 },
      { name: 'Kedokteran', FacultyId: 4 }
    ]);
    console.log('Programs created');

    // Create sample statistics for 2023
    for (let programId = 1; programId <= 7; programId++) {
      for (let pathId = 1; pathId <= 3; pathId++) {
        const maleApplicants = Math.floor(Math.random() * 300) + 150;
        const femaleApplicants = Math.floor(Math.random() * 300) + 100;
        const totalApplicants = maleApplicants + femaleApplicants;
        
        const maleAccepted = Math.floor(maleApplicants * 0.3);
        const femaleAccepted = Math.floor(femaleApplicants * 0.3);
        const totalAccepted = maleAccepted + femaleAccepted;
        
        const kipApplicants = Math.floor(totalApplicants * 0.2);
        const kipRecipients = Math.floor(kipApplicants * 0.4);
        
        await AdmissionStatistics.create({
          academicYearId: 1,
          programId: programId,
          admissionPathId: pathId,
          totalApplicants,
          maleApplicants,
          femaleApplicants,
          totalAccepted,
          maleAccepted,
          femaleAccepted,
          kipApplicants,
          kipRecipients
        });
      }
    }

    // Create sample statistics for 2024 (with slight increases)
    for (let programId = 1; programId <= 7; programId++) {
      for (let pathId = 1; pathId <= 3; pathId++) {
        const maleApplicants = Math.floor(Math.random() * 350) + 170;
        const femaleApplicants = Math.floor(Math.random() * 350) + 120;
        const totalApplicants = maleApplicants + femaleApplicants;
        
        const maleAccepted = Math.floor(maleApplicants * 0.32);
        const femaleAccepted = Math.floor(femaleApplicants * 0.32);
        const totalAccepted = maleAccepted + femaleAccepted;
        
        const kipApplicants = Math.floor(totalApplicants * 0.25);
        const kipRecipients = Math.floor(kipApplicants * 0.45);
        
        await AdmissionStatistics.create({
          academicYearId: 2,
          programId: programId,
          admissionPathId: pathId,
          totalApplicants,
          maleApplicants,
          femaleApplicants,
          totalAccepted,
          maleAccepted,
          femaleAccepted,
          kipApplicants,
          kipRecipients
        });
      }
    }
    console.log('Statistics created');

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
};

// Execute the seed function
seedData();
