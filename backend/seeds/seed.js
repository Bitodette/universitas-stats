require('dotenv').config();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const { 
  AcademicYear, 
  AdmissionPath, 
  Faculty, 
  Program, 
  AdmissionStatistics 
} = require('../models/Statistics');
const bcrypt = require('bcryptjs');
const { debug } = require('../utils/debugger');

const seedData = async () => {
  try {
    // Force sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
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
      { name: 'Fakultas Hukum', abbreviation: 'FH' },
      { name: 'Fakultas Keguruan dan Ilmu Pendidikan', abbreviation: 'FKIP' },
      { name: 'Fakultas Teknik', abbreviation: 'FT' },
      { name: 'Fakultas Pertanian', abbreviation: 'FAPERTA' },
      { name: 'Fakultas Ekonomi dan Bisnis', abbreviation: 'FEB' },
      { name: 'Fakultas Ilmu Sosial dan Ilmu Politik', abbreviation: 'FISIP' },
      { name: 'Fakultas Kedokteran dan Ilmu Kesehatan', abbreviation: 'FKIK' }
    ]);
    console.log('Faculties created');

    // Create programs
    const programData = [
      // Fakultas Hukum
      { name: 'Hukum', FacultyId: 1 },
      
      // FKIP
      { name: 'Bimbingan Dan Konseling', FacultyId: 2 },
      { name: 'Pendidikan Bahasa Indonesia', FacultyId: 2 },
      { name: 'Pendidikan Bahasa Inggris', FacultyId: 2 },
      { name: 'Pendidikan Biologi', FacultyId: 2 },
      { name: 'Pendidikan Fisika', FacultyId: 2 },
      { name: 'Pendidikan Guru Pendidikan Anak Usia Dini', FacultyId: 2 },
      { name: 'Pendidikan Guru Sekolah Dasar', FacultyId: 2 },
      { name: 'Pendidikan Ilmu Pengetahuan Alam', FacultyId: 2 },
      { name: 'Pendidikan Khusus', FacultyId: 2 },
      { name: 'Pendidikan Kimia', FacultyId: 2 },
      { name: 'Pendidikan Matematika', FacultyId: 2 },
      { name: 'Pendidikan Non Formal', FacultyId: 2 },
      { name: 'Pendidikan Pancasila dan Kewarganegaraan', FacultyId: 2 },
      { name: 'Pendidikan Sejarah', FacultyId: 2 },
      { name: 'Pendidikan Seni Pertunjukan', FacultyId: 2 },
      { name: 'Pendidikan Sosiologi', FacultyId: 2 },
      { name: 'Pendidikan Vokasional Teknik Elektro', FacultyId: 2 },
      { name: 'Pendidikan Vokasional Teknik Mesin', FacultyId: 2 },
      
      // Fakultas Teknik
      { name: 'Informatika', FacultyId: 3 },
      { name: 'Statistika', FacultyId: 3 },
      { name: 'Teknik Elektro', FacultyId: 3 },
      { name: 'Teknik Industri', FacultyId: 3 },
      { name: 'Teknik Kimia', FacultyId: 3 },
      { name: 'Teknik Mesin', FacultyId: 3 },
      { name: 'Teknik Metalurgi', FacultyId: 3 },
      { name: 'Teknik Sipil', FacultyId: 3 },
      
      // Fakultas Pertanian
      { name: 'Agribisnis', FacultyId: 4 },
      { name: 'Agroekoteknologi', FacultyId: 4 },
      { name: 'Ilmu Kelautan', FacultyId: 4 },
      { name: 'Ilmu Perikanan', FacultyId: 4 },
      { name: 'Peternakan', FacultyId: 4 },
      { name: 'Teknologi Pangan', FacultyId: 4 },
      
      // FEB
      { name: 'Administrasi Pajak', FacultyId: 5 },
      { name: 'Akuntansi (D3)', FacultyId: 5 },
      { name: 'Keuangan Dan Perbankan', FacultyId: 5 },
      { name: 'Manajemen Pemasaran', FacultyId: 5 },
      { name: 'Akuntansi', FacultyId: 5 },
      { name: 'Ekonomi Pembangunan', FacultyId: 5 },
      { name: 'Ekonomi Syariah', FacultyId: 5 },
      { name: 'Manajemen', FacultyId: 5 },
      
      // FISIP
      { name: 'Administrasi Publik', FacultyId: 6 },
      { name: 'Ilmu Komunikasi', FacultyId: 6 },
      { name: 'Ilmu Pemerintahan', FacultyId: 6 },
      
      // FKIK
      { name: 'Gizi', FacultyId: 7 },
      { name: 'Ilmu Keolahragaan', FacultyId: 7 },
      { name: 'Kedokteran', FacultyId: 7 },
      { name: 'Keperawatan', FacultyId: 7 }
    ];
    
    const programs = await Program.bulkCreate(programData);
    console.log('Programs created');

    // Define seed data parameters
    // Use faculty-specific data to create more realistic statistics
    const facultyProfiles = {
      1: { // Fakultas Hukum - Medium applicants, medium acceptance rate
        applicantBase: { min: 400, max: 600 },
        acceptanceRate: 0.17,
        genderRatio: 0.35, // 35% male
        kipApplicantRate: 0.20, 
        kipAcceptanceRate: 0.60,
        registrationRate: 0.98, // Document registration rate
        paymentRate: 0.94 // Payment registration rate
      },
      2: { // FKIP - High applicants, varied acceptance rate
        applicantBase: { min: 250, max: 550 },
        acceptanceRate: 0.20,
        genderRatio: 0.30, // 30% male
        kipApplicantRate: 0.30, 
        kipAcceptanceRate: 0.70,
        registrationRate: 0.97,
        paymentRate: 0.93
      },
      3: { // FT - High applicants, low acceptance rate
        applicantBase: { min: 450, max: 750 },
        acceptanceRate: 0.10,
        genderRatio: 0.80, // 80% male
        kipApplicantRate: 0.25, 
        kipAcceptanceRate: 0.65,
        registrationRate: 0.97,
        paymentRate: 0.95
      },
      4: { // FAPERTA - Medium applicants, higher acceptance rate
        applicantBase: { min: 150, max: 300 },
        acceptanceRate: 0.20,
        genderRatio: 0.60, // 60% male
        kipApplicantRate: 0.35, 
        kipAcceptanceRate: 0.75,
        registrationRate: 0.95,
        paymentRate: 0.90
      },
      5: { // FEB - Very high applicants, low acceptance rate
        applicantBase: { min: 350, max: 900 },
        acceptanceRate: 0.15,
        genderRatio: 0.40, // 40% male
        kipApplicantRate: 0.22, 
        kipAcceptanceRate: 0.60,
        registrationRate: 0.97,
        paymentRate: 0.96
      },
      6: { // FISIP - High applicants, low acceptance rate
        applicantBase: { min: 450, max: 800 },
        acceptanceRate: 0.08,
        genderRatio: 0.45, // 45% male
        kipApplicantRate: 0.25, 
        kipAcceptanceRate: 0.65,
        registrationRate: 0.99,
        paymentRate: 0.94
      },
      7: { // FKIK - Medium applicants, very low acceptance rate
        applicantBase: { min: 500, max: 700 },
        acceptanceRate: 0.03,
        genderRatio: 0.35, // 35% male
        kipApplicantRate: 0.15, 
        kipAcceptanceRate: 0.50,
        registrationRate: 1.00,
        paymentRate: 0.98
      }
    };

    // Create sample statistics for 2023
    console.log('Creating statistics for 2023...');
    const statisticsEntries = [];

    for (const program of programs) {
      const facultyId = program.FacultyId;
      const profile = facultyProfiles[facultyId];

      for (let pathId = 1; pathId <= 3; pathId++) {
        // Create base number of applicants for this program & path
        const baseApplicants = Math.floor(
          Math.random() * (profile.applicantBase.max - profile.applicantBase.min) + 
          profile.applicantBase.min
        );
        
        // Apply path-specific modifiers (SNBP gets fewer applicants than SNBT or Mandiri)
        const pathModifiers = {
          1: 0.7,  // SNBP: fewer applicants
          2: 1.0,  // SNBT: baseline
          3: 0.8   // Mandiri: slightly fewer than SNBT
        };
        
        const totalApplicants = Math.floor(baseApplicants * pathModifiers[pathId]);
        
        // Determine gender split
        const maleApplicants = Math.floor(totalApplicants * profile.genderRatio);
        const femaleApplicants = totalApplicants - maleApplicants;
        
        // Calculate accepted students
        // Different paths have different acceptance rates
        const pathAcceptanceModifiers = {
          1: 1.2,  // SNBP: higher acceptance rate
          2: 1.0,  // SNBT: baseline
          3: 0.8   // Mandiri: lower acceptance rate
        };
        
        const adjustedAcceptanceRate = profile.acceptanceRate * pathAcceptanceModifiers[pathId];
        const totalAccepted = Math.floor(totalApplicants * adjustedAcceptanceRate);
        
        // Gender ratio might differ slightly between applicants and accepted students
        const acceptedGenderRatio = profile.genderRatio * (Math.random() * 0.2 + 0.9);
        const maleAccepted = Math.min(maleApplicants, Math.floor(totalAccepted * acceptedGenderRatio));
        const femaleAccepted = totalAccepted - maleAccepted;
        
        // Calculate KIP students
        const kipApplicants = Math.floor(totalApplicants * profile.kipApplicantRate);
        const kipRecipients = Math.floor(kipApplicants * profile.kipAcceptanceRate);
        
        // Calculate registration stats
        const registeredDocs = Math.floor(totalAccepted * profile.registrationRate);
        const registeredPayment = Math.floor(registeredDocs * profile.paymentRate);
        
        statisticsEntries.push({
          academicYearId: 1, // 2023
          programId: program.id,
          admissionPathId: pathId,
          totalApplicants,
          maleApplicants,
          femaleApplicants,
          totalAccepted,
          maleAccepted,
          femaleAccepted,
          kipApplicants,
          kipRecipients,
          registeredDocs,
          registeredPayment
        });
      }
    }

    // Create sample statistics for 2024 with growth patterns
    console.log('Creating statistics for 2024...');
    
    // Apply yearly growth factors to reflect trends
    const yearlyGrowthFactors = {
      // Faculty-specific growth from 2023 to 2024
      1: 1.10, // Fakultas Hukum - Moderate growth
      2: 1.05, // FKIP - Slight growth
      3: 1.25, // FT - Strong growth (tech fields)
      4: 1.15, // FAPERTA - Good growth
      5: 1.18, // FEB - Strong growth
      6: 1.12, // FISIP - Good growth
      7: 1.08  // FKIK - Moderate growth
    };

    for (const program of programs) {
      const facultyId = program.FacultyId;
      const profile = facultyProfiles[facultyId];
      const growthFactor = yearlyGrowthFactors[facultyId];

      for (let pathId = 1; pathId <= 3; pathId++) {
        // Create base number of applicants with growth from 2023
        const baseApplicants = Math.floor(
          Math.random() * (profile.applicantBase.max - profile.applicantBase.min) + 
          profile.applicantBase.min
        );
        
        // Apply path-specific modifiers and growth factor
        const pathModifiers = {
          1: 0.7,  // SNBP: fewer applicants
          2: 1.0,  // SNBT: baseline
          3: 0.9   // Mandiri: slightly more applicants than in 2023
        };
        
        const totalApplicants = Math.floor(baseApplicants * pathModifiers[pathId] * growthFactor);
        
        // Determine gender split
        const maleApplicants = Math.floor(totalApplicants * profile.genderRatio);
        const femaleApplicants = totalApplicants - maleApplicants;
        
        // Calculate accepted students
        // Different paths have different acceptance rates, with adjustments for 2024
        const pathAcceptanceModifiers = {
          1: 1.2,  // SNBP: higher acceptance rate
          2: 1.0,  // SNBT: baseline
          3: 0.85  // Mandiri: slightly higher acceptance rate than in 2023
        };
        
        // Adjust acceptance rates for 2024 (slightly more selective overall)
        const yearlyAcceptanceAdjustment = 0.95; // 5% more selective
        
        const adjustedAcceptanceRate = profile.acceptanceRate * 
                                      pathAcceptanceModifiers[pathId] * 
                                      yearlyAcceptanceAdjustment;
                                      
        const totalAccepted = Math.floor(totalApplicants * adjustedAcceptanceRate);
        
        // Gender ratio might differ slightly
        const acceptedGenderRatio = profile.genderRatio * (Math.random() * 0.2 + 0.9);
        const maleAccepted = Math.min(maleApplicants, Math.floor(totalAccepted * acceptedGenderRatio));
        const femaleAccepted = totalAccepted - maleAccepted;
        
        // Calculate KIP students (with slight increase in KIP rate for 2024)
        const kipGrowth = 1.15; // 15% more KIP students
        const kipApplicants = Math.floor(totalApplicants * profile.kipApplicantRate * kipGrowth);
        const kipRecipients = Math.floor(kipApplicants * profile.kipAcceptanceRate);
        
        // Calculate registration stats - slightly better in 2024
        const registeredDocs = Math.floor(totalAccepted * Math.min(profile.registrationRate + 0.01, 1.0));
        const registeredPayment = Math.floor(registeredDocs * Math.min(profile.paymentRate + 0.02, 1.0));
        
        statisticsEntries.push({
          academicYearId: 2, // 2024
          programId: program.id,
          admissionPathId: pathId,
          totalApplicants,
          maleApplicants,
          femaleApplicants,
          totalAccepted,
          maleAccepted,
          femaleAccepted,
          kipApplicants,
          kipRecipients,
          registeredDocs,
          registeredPayment
        });
      }
    }

    // Bulk create all statistics entries
    await AdmissionStatistics.bulkCreate(statisticsEntries);
    console.log(`Created ${statisticsEntries.length} statistics entries`);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
};

// Execute the seed function
seedData();
