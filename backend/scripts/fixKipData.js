require('dotenv').config();
const { sequelize } = require('../config/db');
const { AdmissionStatistics } = require('../models/Statistics');
const { Op } = require('sequelize');

const fixKipData = async () => {
  console.log('Memulai perbaikan data KIP yang tidak konsisten...');
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Fix 1: kipRecipients > totalAccepted
    const overKipTotal = await AdmissionStatistics.findAll({
      where: {
        kipRecipients: { [Op.gt]: sequelize.col('totalAccepted') }
      },
      transaction
    });
    console.log(`Ditemukan ${overKipTotal.length} record dengan kipRecipients > totalAccepted`);
    for (const record of overKipTotal) {
      console.log(`Memperbaiki record ID ${record.id}: kipRecipients ${record.kipRecipients} -> totalAccepted ${record.totalAccepted}`);
      record.kipRecipients = record.totalAccepted;
      await record.save({ transaction });
    }

    // Fix 2: kipRecipients > kipApplicants
    // Ganti field menjadi camelCase dan gunakan tanda kutip ganda
    const overKipApplicants = await AdmissionStatistics.findAll({
      where: sequelize.literal('"kipRecipients" > "kipApplicants"'),
      transaction
    });
    console.log(`Ditemukan ${overKipApplicants.length} record dengan kipRecipients > kipApplicants`);
    for (const stat of overKipApplicants) {
      console.log(`Memperbaiki record ID ${stat.id}: kipRecipients ${stat.kipRecipients} -> kipApplicants ${stat.kipApplicants}`);
      stat.kipRecipients = stat.kipApplicants;
      await stat.save({ transaction });
    }

    await transaction.commit();
    console.log('Semua perbaikan telah berhasil diterapkan.');
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Terjadi error saat memperbaiki data KIP:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

fixKipData();