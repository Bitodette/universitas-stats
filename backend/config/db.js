const { Sequelize } = require('sequelize');
const config = require('./config');
const { debug } = require('../utils/debugger');

// Pastikan 'pg' dan 'pg-hstore' terinstal.
// Jalankan: npm install pg pg-hstore
require('pg');

let sequelize;

try {
  debug('Memulai inisialisasi koneksi database...');

  // Opsi konfigurasi dasar untuk Sequelize
  const dbConfig = {
    dialect: 'postgres',
    logging: config.env === 'development' ? console.log : false,
    pool: {
      max: 5, // Jumlah koneksi maksimum dalam pool
      min: 0, // Jumlah koneksi minimum dalam pool
      acquire: 30000, // Waktu maksimum (ms) untuk mendapatkan koneksi sebelum timeout
      idle: 10000, // Waktu maksimum (ms) koneksi bisa idle sebelum dilepaskan
    },
  };

  // Tambahkan konfigurasi SSL khusus untuk lingkungan produksi
  // Ini penting untuk koneksi aman ke layanan database seperti Vercel Postgres, Neon, dll.
  if (config.env === 'production' || process.env.VERCEL === '1') {
    debug('Menambahkan konfigurasi SSL untuk produksi.');
    dbConfig.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Sesuaikan jika Anda menggunakan sertifikat CA kustom
      },
    };
  }

  // Gunakan DATABASE_URL jika tersedia (umum di lingkungan Vercel/Heroku)
  // Jika tidak, gunakan konfigurasi dari file config.js
  const connectionString = process.env.DATABASE_URL || `postgres://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}`;

  if (!process.env.DATABASE_URL) {
      debug('Menggunakan konfigurasi dari file config.js');
  } else {
      debug('Menggunakan DATABASE_URL dari environment variable.');
  }

  sequelize = new Sequelize(connectionString, dbConfig);

} catch (error) {
  console.error('Terjadi kesalahan saat inisialisasi Sequelize:', error.message);
  debug('Error detail inisialisasi database:', error);

  // Jika error disebabkan oleh 'pg' yang belum terinstal, berikan pesan yang jelas.
  if (error.code === 'MODULE_NOT_FOUND' && error.message.includes("'pg'")) {
    console.error("Paket 'pg' tidak ditemukan. Mohon instal dengan menjalankan: npm install pg pg-hstore");
  }

  // Hentikan proses jika terjadi di lingkungan non-produksi agar error cepat terdeteksi.
  if (config.env !== 'production') {
    process.exit(1);
  }

  // Di produksi, jangan hentikan proses. Cukup log error.
  // Anda bisa menambahkan fallback di sini jika diperlukan.
  // Membuat instance dummy bisa berisiko, lebih baik membiarkannya 'undefined'
  // dan menangani koneksi yang gagal di level aplikasi.
}

/**
 * Mengautentikasi dan menyinkronkan koneksi database.
 */
const connectDB = async () => {
  // Hanya jalankan jika sequelize berhasil diinisialisasi
  if (!sequelize) {
    console.error('Koneksi database tidak dapat dilanjutkan karena Sequelize gagal diinisialisasi.');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil dibuat.');
    debug('Autentikasi database sukses.');

    // Sinkronisasi model dengan database.
    // 'alter: true' aman untuk pengembangan, ia akan mencoba mengubah tabel yang ada
    // agar sesuai dengan model tanpa menghapus data.
    // Untuk produksi, pertimbangkan menggunakan migrasi.
    const syncOptions = {
        alter: config.env === 'development', // Gunakan 'alter' hanya di development
        force: false // 'force: true' akan menghapus tabel, sangat tidak disarankan
    };

    await sequelize.sync(syncOptions);
    console.log(`Tabel database telah disinkronkan. (Mode: ${syncOptions.alter ? 'alter' : 'default'})`);
    debug('Sinkronisasi tabel berhasil.');

  } catch (error) {
    console.error('Gagal terhubung atau sinkronisasi ke database:', error.message);
    debug('Detail error koneksi/sinkronisasi:', error);

    // Jangan keluar dari proses di lingkungan serverless (seperti Vercel)
    // agar fungsi tidak crash dan dapat memberikan respons error.
    if (config.env !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };