import React, { useState, useContext, useEffect } from 'react';
import { StatisticsContext } from '../context/StatisticsContext';
import { getComparisonData } from '../services/statisticsService';
import { Bar } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//=================================================================
// 1. KOMPONEN UI INTERNAL (Konsisten dengan halaman lain)
//=================================================================

const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 ${className}`}>
    {title && <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>}
    {children}
  </div>
);

const CustomSpinner = () => (
  <div className="flex justify-center items-center h-80">
    <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
  </div>
);

const Alert = ({ message, type = 'info' }) => {
    const ICONS = {
        info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>,
        warning: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
        error: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    const colors = {
        info: 'bg-sky-100 border-sky-500 text-sky-800',
        warning: 'bg-amber-100 border-amber-500 text-amber-800',
        error: 'bg-rose-100 border-rose-500 text-rose-800',
    };
    return (
        <div className={`flex items-start gap-4 p-4 mt-6 rounded-lg border-l-4 ${colors[type]}`} role="alert">
            <div className="flex-shrink-0">{ICONS[type]}</div>
            <div>{message}</div>
        </div>
    );
};

//=================================================================
// 2. KOMPONEN UTAMA: ComparisonPage
//=================================================================

const ComparisonPage = () => {
  const { years, loading: yearsLoading } = useContext(StatisticsContext);
  const [year1, setYear1] = useState(null);
  const [year2, setYear2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (years && years.length >= 2 && !year1 && !year2) {
      setYear1(years[years.length - 2].year);
      setYear2(years[years.length - 1].year);
    }
  }, [years, year1, year2]);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!year1 || !year2 || year1 === year2) {
        setComparisonData(null);
        return;
      }
      try {
        setLoading(true);
        const response = await getComparisonData(year1, year2);
        setComparisonData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Gagal mengambil data perbandingan');
        setComparisonData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchComparisonData();
  }, [year1, year2]);

  const handleYearChange = (setter) => (e) => {
    setter(e.target.value || null);
  };
  
  const renderChangeIndicator = (changeValue) => {
    const ICONS = {
      up: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.03 9.83a.75.75 0 0 1-1.06-1.06l5.25-5.25a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 1 1-1.06 1.06L10.75 5.612V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg>,
      down: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l4.22-4.22a.75.75 0 1 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 1 1 1.06-1.06l4.22 4.22V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" /></svg>,
    };
    if (changeValue === 'N/A' || changeValue === null) return <span className="text-slate-500">N/A</span>;
    const numValue = parseFloat(changeValue);
    if (numValue > 0) return <span className="flex items-center justify-center gap-1 font-semibold text-emerald-600">+{changeValue}% {ICONS.up}</span>;
    if (numValue < 0) return <span className="flex items-center justify-center gap-1 font-semibold text-rose-600">{changeValue}% {ICONS.down}</span>;
    return <span className="text-slate-600">0%</span>;
  };

  if (yearsLoading) return <div className="bg-slate-50 min-h-screen"><main className="pt-16 flex items-center justify-center"><CustomSpinner /></main></div>;
  if (years.length < 2) return <div className="bg-slate-50 min-h-screen"><main className="pt-16 p-8"><Alert type="warning" message="Minimal diperlukan data dari 2 tahun akademik untuk membuat perbandingan." /></main></div>;
  
  const chartData = comparisonData ? {
    labels: ['Total Pendaftar', 'Total Diterima', 'Pendaftar KIP', 'Penerima KIP'],
    datasets: [
      {
        label: year1,
        data: [
          comparisonData.compareOverall.year1.totalApplicants,
          comparisonData.compareOverall.year1.totalAccepted,
          comparisonData.compareOverall.year1.kipApplicants,
          comparisonData.compareOverall.year1.kipRecipients,
        ],
        backgroundColor: 'rgba(14, 165, 233, 0.6)', // sky-500
      },
      {
        label: year2,
        data: [
          comparisonData.compareOverall.year2.totalApplicants,
          comparisonData.compareOverall.year2.totalAccepted,
          comparisonData.compareOverall.year2.kipApplicants,
          comparisonData.compareOverall.year2.kipRecipients,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.6)', // emerald-500
      },
    ],
  } : null;

  return (
    <div className="bg-slate-0 min-h-screen">
      {/* FIXED: main wrapper added to fix the gap */}
      <main className="pt-1">
        <div className="container mx-auto px-3 py-0 space-y-6">
            <h1 className="text-4xl font-bold text-slate-800 text-center">
                Perbandingan Statistik Antar Tahun
            </h1>

            <Section title="Pilih Tahun Pembanding">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="year1" className="block text-sm font-medium text-slate-700 mb-1">Tahun Pertama:</label>
                    <div className="relative">
                        <select 
                            id="year1" 
                            value={year1 || ''} 
                            onChange={handleYearChange(setYear1)} 
                            className="appearance-none w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8"
                        >
                            <option value="">Pilih Tahun</option>
                            {years.map(y => (<option key={`y1-${y.id}`} value={y.year}>{y.year}</option>))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="year2" className="block text-sm font-medium text-slate-700 mb-1">Tahun Kedua:</label>
                     <div className="relative">
                        <select 
                            id="year2" 
                            value={year2 || ''} 
                            onChange={handleYearChange(setYear2)} 
                            className="appearance-none w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8"
                        >
                            <option value="">Pilih Tahun</option>
                            {years.map(y => (<option key={`y2-${y.id}`} value={y.year}>{y.year}</option>))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            {error && <Alert type="error" message={error} />}
            {year1 && year2 && year1 === year2 && <Alert type="warning" message="Pilih dua tahun yang berbeda untuk perbandingan." />}
            {(!year1 || !year2) && !error && <Alert type="info" message="Pilih kedua tahun untuk melihat data perbandingan." />}
            </Section>
            
            {loading && <CustomSpinner />}

            {!loading && comparisonData && (
                <>
                    <Section title="Perbandingan Keseluruhan">
                        <div className="h-96 max-w-4xl mx-auto mb-8">
                            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Metrik</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">{year1}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">{year2}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {Object.entries(comparisonData.compareOverall.change).map(([key, change]) => (
                                        <tr key={key} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{comparisonData.compareOverall.year1[key]?.toLocaleString() || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{comparisonData.compareOverall.year2[key]?.toLocaleString() || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-center">{renderChangeIndicator(change)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                    <Section title="Perbandingan per Jalur Masuk">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jalur Masuk</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Pendaftar {year1}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Pendaftar {year2}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Perubahan</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Diterima {year1}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Diterima {year2}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {Object.entries(comparisonData.compareByPath).map(([path, data]) => (
                                        <tr key={path} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{path}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{data.year1.totalApplicants.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{data.year2.totalApplicants.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-center">{renderChangeIndicator(data.change.totalApplicants)}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{data.year1.totalAccepted.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{data.year2.totalAccepted.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-center">{renderChangeIndicator(data.change.totalAccepted)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </>
            )}
        </div>
      </main>
    </div>
  );
};

export default ComparisonPage;