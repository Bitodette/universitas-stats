import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Tentang Aplikasi</h1>
            <p className="text-gray-600 mb-4">
              Universitas Stats adalah aplikasi yang menyajikan visualisasi data statistik penerimaan mahasiswa dari berbagai jalur masuk di universitas kami. Aplikasi ini dibuat untuk memberikan transparansi dan kemudahan akses informasi bagi masyarakat.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Fitur Utama</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Visualisasi data statistik penerimaan mahasiswa per tahun</li>
              <li>Perincian data berdasarkan fakultas dan program studi</li>
              <li>Informasi statistik berdasarkan jalur masuk (SNBP, SNBT, Mandiri)</li>
              <li>Perbandingan data antar tahun akademik</li>
              <li>Informasi sebaran gender dan penerima KIP</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Cara Penggunaan</h2>
            <p className="text-gray-600 mb-2">
              Pada halaman beranda, Anda dapat melihat ringkasan statistik untuk tahun akademik terkini. Untuk melihat detail lebih lanjut:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>Kunjungi halaman <Link to="/statistics" className="text-blue-600 hover:underline">Statistik</Link> untuk melihat data lengkap per tahun akademik</li>
              <li>Gunakan halaman <Link to="/comparison" className="text-blue-600 hover:underline">Perbandingan</Link> untuk membandingkan data antar tahun</li>
              <li>Lihat data berdasarkan fakultas, jalur masuk, atau statistik gender pada tab-tab yang tersedia</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Kontak</h2>
            <p className="text-gray-600 mb-4">
              Jika Anda memiliki pertanyaan atau saran terkait data yang disajikan, silakan hubungi:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Bagian Akademik Universitas</strong></p>
              <p className="text-gray-600">Email: akademik@universitas.ac.id</p>
              <p className="text-gray-600">Telepon: (021) 7654321</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sumber Data</h2>
            <p className="text-gray-600 mb-4">
              Data yang ditampilkan merupakan data resmi yang diperoleh dari Bagian Akademik dan Penerimaan Mahasiswa Baru Universitas. Data diperbarui setelah proses seleksi penerimaan mahasiswa baru setiap tahunnya.
            </p>
            <p className="text-gray-600">
              Terakhir diperbarui: Juli 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
