import React from 'react';
import { Link } from 'react-router-dom';

//=================================================================
// 1. KOMPONEN UI INTERNAL (Konsisten dengan halaman lain)
//=================================================================

const Section = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-sky-600">{icon}</div>}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{title}</h1>
      </div>
    )}
    {children}
  </div>
);

//=================================================================
// 2. KOMPONEN UTAMA: AboutPage
//=================================================================

const AboutPage = () => {
    // Definisikan ikon yang akan digunakan
    const ICONS = {
        info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>,
        // FIXED: Ikon kontak diganti dengan yang valid (ikon kartu identitas/kontak)
        contact: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
        database: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>,
        feature: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sky-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-16 space-y-8">
        <div className="max-w-3xl mx-auto space-y-8">
            
          <Section title="Tentang Aplikasi" icon={ICONS.info}>
            <p className="text-slate-600 mb-6 text-base leading-relaxed">
              Universitas Stats adalah aplikasi yang menyajikan visualisasi data statistik penerimaan mahasiswa dari berbagai jalur masuk di universitas kami. Aplikasi ini dibuat untuk memberikan transparansi dan kemudahan akses informasi bagi calon mahasiswa, orang tua, dan masyarakat umum.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-4">Fitur Utama</h2>
            <ul className="space-y-3">
              {[
                "Visualisasi data statistik penerimaan mahasiswa per tahun",
                "Perincian data berdasarkan fakultas dan program studi",
                "Informasi statistik berdasarkan jalur masuk (SNBP, SNBT, Mandiri)",
                "Perbandingan data antar tahun akademik",
                "Informasi sebaran gender dan penerima KIP"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1">{ICONS.feature}</span>
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Cara Penggunaan</h2>
            <p className="text-slate-600 mb-4">
              Pada halaman beranda, Anda dapat melihat ringkasan statistik untuk tahun akademik terkini. Untuk melihat detail lebih lanjut:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-2">
              <li>Kunjungi halaman <Link to="/statistics" className="font-medium text-sky-600 hover:underline">Statistik</Link> untuk melihat data lengkap per tahun akademik.</li>
              <li>Gunakan halaman <Link to="/comparison" className="font-medium text-sky-600 hover:underline">Perbandingan</Link> untuk membandingkan data antar tahun.</li>
              <li>Lihat data berdasarkan fakultas, jalur masuk, atau keketatan pada tab-tab yang tersedia di halaman Statistik.</li>
            </ol>
          </Section>
          
          <Section title="Kontak" icon={ICONS.contact}>
            <p className="text-slate-600 mb-4">
              Jika Anda memiliki pertanyaan atau saran terkait data yang disajikan, silakan hubungi:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <p className="text-slate-800 font-semibold">Bagian Akademik Universitas</p>
              <p className="text-slate-600 mt-1">Email: <a href="mailto:akademik@universitas.ac.id" className="text-sky-600 hover:underline">akademik@universitas.ac.id</a></p>
              <p className="text-slate-600">Telepon: <a href="tel:0217654321" className="text-sky-600 hover:underline">(021) 7654321</a></p>
            </div>
          </Section>
          
          <Section title="Sumber Data" icon={ICONS.database}>
            <p className="text-slate-600 mb-4">
              Data yang ditampilkan merupakan data resmi yang diperoleh dari Bagian Akademik dan Penerimaan Mahasiswa Baru Universitas. Data diperbarui setelah proses seleksi penerimaan mahasiswa baru setiap tahunnya.
            </p>
            <p className="text-sm text-slate-500 italic">
              Terakhir diperbarui: Juli 2024
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;