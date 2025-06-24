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

const seedData = async () => {
  try {
    // Sync all models (drop & create)
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    });
    if (!created) {
      // Update password and role if already exists
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
    }
    console.log('Admin user created or updated');

    // Academic years
    await AcademicYear.bulkCreate([
      { year: '2023', isActive: false },
      { year: '2024', isActive: true }
    ]);
    console.log('Academic years created');

    // Admission paths
    await AdmissionPath.bulkCreate([
      { name: 'SNBP', description: 'Seleksi Nasional Berdasarkan Prestasi' },
      { name: 'SNBT', description: 'Seleksi Nasional Berdasarkan Tes' },
      { name: 'Mandiri', description: 'Jalur Seleksi Mandiri Universitas' }
    ]);
    console.log('Admission paths created');

    // Faculties
    await Faculty.bulkCreate([
      { name: 'Fakultas Hukum', abbreviation: 'FH' },
      { name: 'Fakultas Keguruan dan Ilmu Pendidikan', abbreviation: 'FKIP' },
      { name: 'Fakultas Teknik', abbreviation: 'FT' },
      { name: 'Fakultas Pertanian', abbreviation: 'FAPERTA' },
      { name: 'Fakultas Ekonomi dan Bisnis', abbreviation: 'FEB' },
      { name: 'Fakultas Ilmu Sosial dan Ilmu Politik', abbreviation: 'FISIP' },
      { name: 'Fakultas Kedokteran dan Ilmu Kesehatan', abbreviation: 'FKIK' }
    ]);
    console.log('Faculties created');

    // Programs
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

    // Fakultas profile
    const facultyProfiles = {
      1: { applicantBase: { min: 400, max: 600 }, acceptanceRate: 0.17, genderRatio: 0.35, kipApplicantRate: 0.20, kipAcceptanceRate: 0.60, registrationRate: 0.98, paymentRate: 0.94 },
      2: { applicantBase: { min: 250, max: 550 }, acceptanceRate: 0.20, genderRatio: 0.30, kipApplicantRate: 0.30, kipAcceptanceRate: 0.70, registrationRate: 0.97, paymentRate: 0.93 },
      3: { applicantBase: { min: 450, max: 750 }, acceptanceRate: 0.10, genderRatio: 0.80, kipApplicantRate: 0.25, kipAcceptanceRate: 0.65, registrationRate: 0.97, paymentRate: 0.95 },
      4: { applicantBase: { min: 150, max: 300 }, acceptanceRate: 0.20, genderRatio: 0.60, kipApplicantRate: 0.35, kipAcceptanceRate: 0.75, registrationRate: 0.95, paymentRate: 0.90 },
      5: { applicantBase: { min: 350, max: 900 }, acceptanceRate: 0.15, genderRatio: 0.40, kipApplicantRate: 0.22, kipAcceptanceRate: 0.60, registrationRate: 0.97, paymentRate: 0.96 },
      6: { applicantBase: { min: 450, max: 800 }, acceptanceRate: 0.08, genderRatio: 0.45, kipApplicantRate: 0.25, kipAcceptanceRate: 0.65, registrationRate: 0.99, paymentRate: 0.94 },
      7: { applicantBase: { min: 500, max: 700 }, acceptanceRate: 0.03, genderRatio: 0.35, kipApplicantRate: 0.15, kipAcceptanceRate: 0.50, registrationRate: 1.00, paymentRate: 0.98 },
    };

    // Statistics
    const statisticsEntries = [];
    // 2023
    for (const program of programs) {
      const facultyId = program.FacultyId;
      const profile = facultyProfiles[facultyId];

      for (let pathId = 1; pathId <= 3; pathId++) {
        const baseApplicants = Math.floor(Math.random() * (profile.applicantBase.max - profile.applicantBase.min) + profile.applicantBase.min);
        const pathModifiers = { 1: 0.7, 2: 1.0, 3: 0.8 };
        const totalApplicants = Math.floor(baseApplicants * pathModifiers[pathId]);
        const maleApplicants = Math.floor(totalApplicants * profile.genderRatio);
        const femaleApplicants = totalApplicants - maleApplicants;
        const pathAcceptanceModifiers = { 1: 1.2, 2: 1.0, 3: 0.8 };
        const adjustedAcceptanceRate = profile.acceptanceRate * pathAcceptanceModifiers[pathId];
        const totalAccepted = Math.floor(totalApplicants * adjustedAcceptanceRate);
        const acceptedGenderRatio = profile.genderRatio * (Math.random() * 0.2 + 0.9);
        const maleAccepted = Math.min(maleApplicants, Math.floor(totalAccepted * acceptedGenderRatio));
        const femaleAccepted = totalAccepted - maleAccepted;
        const kipApplicants = Math.floor(totalApplicants * profile.kipApplicantRate);
        const kipRecipients = Math.floor(kipApplicants * profile.kipAcceptanceRate);
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
    // 2024
    const yearlyGrowthFactors = { 1: 1.10, 2: 1.05, 3: 1.25, 4: 1.15, 5: 1.18, 6: 1.12, 7: 1.08 };
    for (const program of programs) {
      const facultyId = program.FacultyId;
      const profile = facultyProfiles[facultyId];
      const growthFactor = yearlyGrowthFactors[facultyId];

      for (let pathId = 1; pathId <= 3; pathId++) {
        const baseApplicants = Math.floor(Math.random() * (profile.applicantBase.max - profile.applicantBase.min) + profile.applicantBase.min);
        const pathModifiers = { 1: 0.7, 2: 1.0, 3: 0.9 };
        const totalApplicants = Math.floor(baseApplicants * pathModifiers[pathId] * growthFactor);
        const maleApplicants = Math.floor(totalApplicants * profile.genderRatio);
        const femaleApplicants = totalApplicants - maleApplicants;
        const pathAcceptanceModifiers = { 1: 1.2, 2: 1.0, 3: 0.85 };
        const yearlyAcceptanceAdjustment = 0.95;
        const adjustedAcceptanceRate = profile.acceptanceRate * pathAcceptanceModifiers[pathId] * yearlyAcceptanceAdjustment;
        const totalAccepted = Math.floor(totalApplicants * adjustedAcceptanceRate);
        const acceptedGenderRatio = profile.genderRatio * (Math.random() * 0.2 + 0.9);
        const maleAccepted = Math.min(maleApplicants, Math.floor(totalAccepted * acceptedGenderRatio));
        const femaleAccepted = totalAccepted - maleAccepted;
        const kipGrowth = 1.15;
        const kipApplicants = Math.floor(totalApplicants * profile.kipApplicantRate * kipGrowth);
        const kipRecipients = Math.floor(kipApplicants * profile.kipAcceptanceRate);
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
    await AdmissionStatistics.bulkCreate(statisticsEntries);
    console.log(`Created ${statisticsEntries.length} statistics entries`);
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
};

seedData();