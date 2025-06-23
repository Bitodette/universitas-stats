// A script to verify data persistence and consistency in the database
require('dotenv').config();
const { sequelize } = require('../config/db');
const { AcademicYear, AdmissionPath, Faculty, Program, AdmissionStatistics } = require('../models/Statistics');
const User = require('../models/User');

/**
 * Main function to verify database data and check consistency
 */
const verifyDatabase = async () => {
  console.log('Connecting to database...');
  
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connection established successfully.\n');
    
    // Step 1: Verify data existence
    await verifyDataExistence();
    
    // Step 2: Check data consistency
    await checkDataConsistency();
    
    console.log('\nDatabase verification completed successfully.');
  } catch (error) {
    console.error('Error during database verification:', error);
  } finally {
    // Close connection only once at the end
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

/**
 * Verify the existence of required data in the database
 */
const verifyDataExistence = async () => {
  console.log('=== CHECKING TABLES ===');
  
  // Users
  const userCount = await User.count();
  console.log(`Users: ${userCount}`);
  if (userCount > 0) {
    const admins = await User.count({ where: { role: 'admin' } });
    console.log(`- Admin users: ${admins}`);
    
    if (admins === 0) {
      console.log('⚠️ WARNING: No admin users found. You may want to run the seedAdmin.js script.');
    } else {
      console.log('✅ Admin users exist.');
    }
  } else {
    console.log('⚠️ WARNING: No users found. You may want to run the seedAdmin.js script.');
  }
  
  // Academic Years
  const yearCount = await AcademicYear.count();
  console.log(`Academic Years: ${yearCount}`);
  if (yearCount > 0) {
    const activeYears = await AcademicYear.count({ where: { isActive: true } });
    console.log(`- Active years: ${activeYears}`);
    
    const years = await AcademicYear.findAll({ order: [['year', 'DESC']] });
    console.log(`- Available years: ${years.map(y => y.year).join(', ')}`);
    
    if (activeYears === 0) {
      console.log('⚠️ WARNING: No active academic year set.');
    } else if (activeYears > 1) {
      console.log('⚠️ WARNING: Multiple active academic years found. Only one should be active.');
    } else {
      console.log('✅ Academic years properly configured.');
    }
  } else {
    console.log('⚠️ WARNING: No academic years found.');
  }
  
  // Admission Paths
  const pathCount = await AdmissionPath.count();
  console.log(`Admission Paths: ${pathCount}`);
  if (pathCount > 0) {
    const paths = await AdmissionPath.findAll();
    console.log(`- Available paths: ${paths.map(p => p.name).join(', ')}`);
    console.log('✅ Admission paths exist.');
  } else {
    console.log('⚠️ WARNING: No admission paths found.');
  }
  
  // Faculties
  const facultyCount = await Faculty.count();
  console.log(`Faculties: ${facultyCount}`);
  if (facultyCount > 0) {
    console.log('✅ Faculties exist.');
  } else {
    console.log('⚠️ WARNING: No faculties found.');
  }
  
  // Programs
  const programCount = await Program.count();
  console.log(`Programs: ${programCount}`);
  if (programCount > 0) {
    console.log('✅ Programs exist.');
  } else {
    console.log('⚠️ WARNING: No programs found.');
  }
  
  // Statistics
  const statCount = await AdmissionStatistics.count();
  console.log(`Statistics Entries: ${statCount}`);
  if (statCount > 0) {
    console.log('✅ Statistics entries exist.');
  } else {
    console.log('⚠️ WARNING: No statistics entries found.');
  }
  
  console.log('\nData verification complete.');
};

/**
 * Check data consistency across statistics entries
 */
const checkDataConsistency = async () => {
  console.log('\n=== CHECKING DATA CONSISTENCY ===');
  console.log('Memeriksa konsistensi data...');
  
  try {
    const statistics = await AdmissionStatistics.findAll();
    
    let issuesFound = 0;
    
    // Check each statistic entry for consistency
    for (const stat of statistics) {
      const entryId = stat.id;
      let entryHasIssues = false;
      
      // 1. Check if totalApplicants = maleApplicants + femaleApplicants
      if (stat.totalApplicants !== (stat.maleApplicants + stat.femaleApplicants)) {
        console.log(`❌ [${entryId}] totalApplicants (${stat.totalApplicants}) !== maleApplicants (${stat.maleApplicants}) + femaleApplicants (${stat.femaleApplicants})`);
        entryHasIssues = true;
      }
      
      // 2. Check if totalAccepted = maleAccepted + femaleAccepted
      if (stat.totalAccepted !== (stat.maleAccepted + stat.femaleAccepted)) {
        console.log(`❌ [${entryId}] totalAccepted (${stat.totalAccepted}) !== maleAccepted (${stat.maleAccepted}) + femaleAccepted (${stat.femaleAccepted})`);
        entryHasIssues = true;
      }
      
      // 3. Check if accepted <= applicants
      if (stat.totalAccepted > stat.totalApplicants) {
        console.log(`❌ [${entryId}] Total accepted (${stat.totalAccepted}) > Total applicants (${stat.totalApplicants})`);
        entryHasIssues = true;
      }
      
      // 4. Check if KIP recipients <= KIP applicants
      if (stat.kipRecipients > stat.kipApplicants) {
        console.log(`❌ [${entryId}] KIP recipients (${stat.kipRecipients}) > KIP applicants (${stat.kipApplicants})`);
        entryHasIssues = true;
      }
      
      // 5. Check if KIP applicants <= total applicants
      if (stat.kipApplicants > stat.totalApplicants) {
        console.log(`❌ [${entryId}] KIP applicants (${stat.kipApplicants}) > Total applicants (${stat.totalApplicants})`);
        entryHasIssues = true;
      }
      
      // 6. Check if registeredDocs <= totalAccepted
      if (stat.registeredDocs > stat.totalAccepted) {
        console.log(`❌ [${entryId}] Registered docs (${stat.registeredDocs}) > Total accepted (${stat.totalAccepted})`);
        entryHasIssues = true;
      }
      
      // 7. Check if registeredPayment <= totalAccepted
      if (stat.registeredPayment > stat.totalAccepted) {
        console.log(`❌ [${entryId}] Registered payment (${stat.registeredPayment}) > Total accepted (${stat.totalAccepted})`);
        entryHasIssues = true;
      }
      
      // 8. Check if registeredPayment <= registeredDocs
      if (stat.registeredPayment > stat.registeredDocs) {
        console.log(`⚠️ [${entryId}] Registered payment (${stat.registeredPayment}) > Registered docs (${stat.registeredDocs})`);
        entryHasIssues = true;
      }
      
      if (entryHasIssues) {
        issuesFound++;
      }
    }
    
    // Check totals per year for consistency
    console.log('\n=== CHECKING YEARLY TOTALS ===');
    
    const years = await AcademicYear.findAll();
    
    for (const year of years) {
      const yearStats = statistics.filter(stat => stat.academicYearId === year.id);
      
      if (yearStats.length === 0) {
        console.log(`Year ${year.year}: No data found`);
        continue;
      }
      
      // Calculate totals
      const totals = {
        totalApplicants: yearStats.reduce((sum, stat) => sum + stat.totalApplicants, 0),
        totalAccepted: yearStats.reduce((sum, stat) => sum + stat.totalAccepted, 0),
        kipApplicants: yearStats.reduce((sum, stat) => sum + stat.kipApplicants, 0),
        kipRecipients: yearStats.reduce((sum, stat) => sum + stat.kipRecipients, 0)
      };
      
      console.log(`\nYear ${year.year}:`);
      console.log(`- Total Applicants: ${totals.totalApplicants.toLocaleString()}`);
      console.log(`- Total Accepted: ${totals.totalAccepted.toLocaleString()} (${((totals.totalAccepted / totals.totalApplicants) * 100).toFixed(2)}%)`);
      console.log(`- KIP Applicants: ${totals.kipApplicants.toLocaleString()} (${((totals.kipApplicants / totals.totalApplicants) * 100).toFixed(2)}% of total applicants)`);
      console.log(`- KIP Recipients: ${totals.kipRecipients.toLocaleString()} (${((totals.kipRecipients / totals.kipApplicants) * 100).toFixed(2)}% of KIP applicants)`);
      
      // Check KIP recipients <= total accepted
      if (totals.kipRecipients > totals.totalAccepted) {
        console.log(`❌ Year ${year.year}: KIP recipients (${totals.kipRecipients}) > Total accepted (${totals.totalAccepted})`);
        issuesFound++;
      }
    }
    
    console.log('\n=== SUMMARY ===');
    if (issuesFound === 0) {
      console.log('✅ No data consistency issues found!');
    } else {
      console.log(`⚠️ Found ${issuesFound} data consistency issues that need attention.`);
      console.log('Run the fixDataConsistency script to attempt automatic fixes or correct the data manually.');
    }
    
  } catch (error) {
    if (error.code === '42P01') {
      console.error('Tabel AdmissionStatistics tidak ditemukan. Pastikan untuk menjalankan migrasi database terlebih dahulu.');
    } else {
      console.error('Error checking data consistency:', error);
    }
    // Rethrow the error to be caught by the main function
    throw error;
  }
};

// Run the main verification function
verifyDatabase();