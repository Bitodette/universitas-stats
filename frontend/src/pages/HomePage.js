import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatisticsContext } from '../context/StatisticsContext';
import { getYearlyStatistics } from '../services/statisticsService';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


//=================================================================
// 1. KOMPONEN UI INTERNAL (Disalin dari StatisticsPage untuk konsistensi)
//=================================================================

const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 ${className}`}>
    {title && <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>}
    {children}
  </div>
);

const StatCard = ({ icon, title, value, detail, color = 'sky' }) => {
  const colorClasses = {
    sky: { text: 'text-sky-600', bg: 'bg-sky-100' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-100' },
  };

  return (
    <Section className="flex items-start space-x-4 hover:shadow-lg hover:scale-[1.02] transform-gpu">
      <div className={`p-3 ${colorClasses[color]?.bg || colorClasses.sky.bg} rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-3xl font-bold ${colorClasses[color]?.text || colorClasses.sky.text}`}>{value}</p>
        {detail && <p className="text-xs text-slate-400 mt-1">{detail}</p>}
      </div>
    </Section>
  );
};

const CustomSpinner = () => (
  <div className="flex flex-col justify-center items-center h-80">
    <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-600">Memuat data...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <Section className="text-center">
    <div className="mx-auto w-12 h-12 text-rose-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="mt-2 text-lg font-medium text-slate-800">Gagal Memuat Data</h3>
    <p className="mt-1 text-sm text-slate-500">Error: {message}</p>
  </Section>
);


//=================================================================
// 2. KOMPONEN UTAMA: HomePage
//=================================================================

const HomePage = () => {
  const { activeYear, loading: yearLoading } = useContext(StatisticsContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeYear) return;
      try {
        setLoading(true);
        const response = await getYearlyStatistics(activeYear);
        setStats(response.data);
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeYear]);

  // Ikon yang akan digunakan di halaman ini
  const ICONS = {
    users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 5.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    kip: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.042m15.622 0l.07.042m-15.692 0l-2.133.587m19.956 0l2.133.587m-15.482 0l.042.022m15.622 0l-.042.022m-15.622-1.725a44.963 44.963 0 0115.622 0" /></svg>,
  };

  if (yearLoading || loading) {
    return <div className="bg-slate-50 min-h-screen"><CustomSpinner /></div>;
  }

  if (error) {
    return <div className="bg-slate-50 min-h-screen p-8"><ErrorDisplay message={error} /></div>;
  }

  if (!stats) {
    return <div className="bg-slate-50 min-h-screen p-8"><Section><p className="text-center text-slate-500">Data tidak tersedia.</p></Section></div>;
  }

  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [stats.overallStats.maleAccepted, stats.overallStats.femaleAccepted],
        backgroundColor: ['#0ea5e9', '#ec4899'], // Sky & Pink
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const pathData = {
    labels: stats.admissionPathStats.map(path => path.pathName),
    datasets: [
      {
        label: 'Pendaftar',
        data: stats.admissionPathStats.map(path => path.totalApplicants),
        backgroundColor: 'rgba(14, 165, 233, 0.6)', // Sky
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diterima',
        data: stats.admissionPathStats.map(path => path.totalAccepted),
        backgroundColor: 'rgba(16, 185, 129, 0.6)', // Emerald
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(203, 213, 225, 0.5)', // slate-300
            },
        },
        x: {
            grid: {
                display: false,
            },
        },
    },
  };

  return (
    <div className="bg-slate-0 min-h-screen">
        <div className="container mx-auto px-3 py-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800">Dashboard Statistik Penerimaan</h1>
            <p className="text-xl text-slate-600 mt-2">Tahun Akademik {activeYear}</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard icon={ICONS.users} title="Total Pendaftar" value={stats.overallStats.totalApplicants.toLocaleString()} color="sky" />
            <StatCard icon={ICONS.check} title="Total Diterima" value={stats.overallStats.totalAccepted.toLocaleString()} detail={`${((stats.overallStats.totalAccepted / stats.overallStats.totalApplicants) * 100).toFixed(1)}% dari pendaftar`} color="emerald" />
            <StatCard icon={ICONS.kip} title="Penerima KIP" value={stats.overallStats.kipRecipients.toLocaleString()} detail={`${((stats.overallStats.kipRecipients / stats.overallStats.kipApplicants) * 100).toFixed(1)}% dari pendaftar KIP`} color="indigo" />
        </div>  

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            <Section title="Sebaran Jenis Kelamin (Diterima)" className="lg:col-span-2">
                <div className="h-80 w-full max-w-sm mx-auto">
                    <Pie data={genderData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </Section>
            
            <Section title="Statistik Jalur Masuk" className="lg:col-span-3">
                <div className="h-80">
                    <Bar data={pathData} options={chartOptions} />
                </div>
            </Section>
        </div>

        <div className="text-center">
          <Link to="/statistics" className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-all duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5">
            Lihat Statistik Lengkap
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;