require('dotenv').config();
const { sequelize } = require('../config/db');
const { AdmissionStatistics } = require('../models/Statistics');
const { Op } = require('sequelize');

const fixKipData = async () => {
  console.log('Memulai perbaikan data KIP yang tidak konsisten...');
  try {
    // Cari semua record di mana kipRecipients > totalAccepted
    const records = await AdmissionStatistics.findAll({
      where: {
        kipRecipients: { [Op.gt]: sequelize.col('totalAccepted') }
      }
    });
    console.log(`Ditemukan ${records.length} record yang tidak konsisten`);
    for (const record of records) {
      console.log(`Memperbaiki record ID ${record.id}: kipRecipients ${record.kipRecipients} -> totalAccepted ${record.totalAccepted}`);
      record.kipRecipients = record.totalAccepted;
      await record.save();
    }
    console.log('Perbaikan selesai.');
  } catch (error) {
    console.error('Terjadi error saat memperbaiki data KIP:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

fixKipData();
          console.log(`Updated to: KIP applicants = ${stat.totalApplicants}`);
        }
      }
      
      // Find invalid KIP recipient data (kipRecipients > kipApplicants)
      const invalidKipRecipients = await AdmissionStatistics.findAll({
        where: sequelize.literal('kip_recipients > kip_applicants')
      });
      
      console.log(`Found ${invalidKipRecipients.length} entries with invalid KIP recipient data.`);
      
      if (invalidKipRecipients.length > 0) {
        for (const stat of invalidKipRecipients) {
          console.log(`Fixing entry ID ${stat.id}: KIP recipients (${stat.kipRecipients}) > KIP applicants (${stat.kipApplicants})`);
          
          // Set KIP recipients to KIP applicants
          await stat.update({
            kipRecipients: stat.kipApplicants
          }, { transaction });
          
          console.log(`Updated to: KIP recipients = ${stat.kipApplicants}`);
        }
      }
      
      // Commit the transaction
      await transaction.commit();
      console.log('All fixes have been applied successfully.');
      
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error during fix operation:', error);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

fixKipData();
