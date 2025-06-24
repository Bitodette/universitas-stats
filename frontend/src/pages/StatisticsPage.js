import React, { useState, useEffect, useContext } from 'react';
import { StatisticsContext } from '../context/StatisticsContext';
import { getYearlyStatistics } from '../services/statisticsService';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title
} from 'chart.js';

// Register Chart.js components
Chart.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title
);

//=================================================================
// 1. KOMPONEN UI HELPER
//=================================================================
const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 ${className}`}>
    {title && <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>}
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
        <div className={`p-3 ${colorClasses[color]?.bg || colorClasses.sky.bg} rounded-lg`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-3xl font-bold ${colorClasses[color]?.text || colorClasses.sky.text}`}>{value}</p>
            {detail && <p className="text-xs text-slate-400 mt-1">{detail}</p>}
        </div>
        </Section>
    );
};

const CustomSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
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
// 2. KOMPONEN UTAMA: StatisticsPage
//=================================================================
const StatisticsPage = () => {
  const { years, activeYear, setActiveYear, loading: yearsLoading } = useContext(StatisticsContext);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('statisticsActiveTab') || 'overview');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [competitivenessSort, setCompetitivenessSort] = useState({ key: 'ratio', order: 'desc' });
  const [competitivenessFilter, setCompetitivenessFilter] = useState('overall');
  const [sortedPrograms, setSortedPrograms] = useState([]);

  useEffect(() => { localStorage.setItem('statisticsActiveTab', activeTab); }, [activeTab]);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!activeYear) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getYearlyStatistics(activeYear);
        setStatistics(response.data);
        if (response.data?.facultyStats && response.data.facultyStats.length > 0) {
          if (!selectedFaculty || !response.data.facultyStats.find(f => f.facultyId === selectedFaculty)) {
             setSelectedFaculty(response.data.facultyStats[0].facultyId);
          }
        } else {
          setSelectedFaculty(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics');
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [activeYear]);

  useEffect(() => {
    if (statistics?.programCompetitiveness) {
        const programsWithActiveData = statistics.programCompetitiveness.map(program => {
            let suffix;
            switch(competitivenessFilter) {
                case 'snbp': suffix = 'SNBP'; break;
                case 'snbt': suffix = 'SNBT'; break;
                case 'mandiri': suffix = 'Mandiri'; break;
                default: suffix = 'Overall';
            }
            const key = `competitiveness${suffix}`;
            return { ...program, activeCompetitiveness: program[key] || {} };
        });
        programsWithActiveData.sort((a, b) => {
            const dataA = a.activeCompetitiveness;
            const dataB = b.activeCompetitiveness;
            const valA = competitivenessSort.key === 'ratio' ? parseFloat(dataA.competitivenessRatio || 0) : parseFloat(dataA.acceptanceRate || 0);
            const valB = competitivenessSort.key === 'ratio' ? parseFloat(dataB.competitivenessRatio || 0) : parseFloat(dataB.acceptanceRate || 0);
            return competitivenessSort.order === 'asc' ? valA - valB : valB - valA;
        });
        setSortedPrograms(programsWithActiveData);
    }
  }, [competitivenessSort, competitivenessFilter, statistics]);

  const handleYearChange = (e) => setActiveYear(e.target.value);
  const handleTabChange = (tab) => setActiveTab(tab);
  const handleFacultyChange = (e) => setSelectedFaculty(Number(e.target.value));
  const handleSort = (key) => { setCompetitivenessSort(prev => ({ key, order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc' })); };
  
  const ICONS = {
    users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 5.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    kip: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.042m15.622 0l.07.042m-15.692 0l-2.133.587m19.956 0l2.133.587m-15.482 0l.042.022m15.622 0l-.042.022m-15.622-1.725a44.963 44.963 0 0115.622 0" /></svg>,
    sortAsc: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>,
    sortDesc: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'faculty', label: 'Fakultas' },
    { id: 'admissionPath', label: 'Jalur Masuk' },
    { id: 'competitiveness', label: 'Keketatan' },
  ];
  
  if (yearsLoading) return <div className="bg-slate-50 min-h-screen pt-16 flex items-center justify-center"><CustomSpinner /></div>;
  
  const renderContent = () => {
    if (loading) return <CustomSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!statistics) return <Section><p className="text-center text-slate-500">Data tidak tersedia.</p></Section>;
    
    const { 
        overallStats = {}, 
        facultyStats = [], 
        admissionPathStats = [], 
        registrationStats = null, 
        programCompetitiveness = [] 
    } = statistics;

    const selectedFacultyData = facultyStats.find(f => f.facultyId === selectedFaculty);
    const selectedFacultyObject = facultyStats.find(f => f.facultyId === selectedFaculty);
    const programsInSelectedFaculty = selectedFacultyObject && programCompetitiveness 
      ? programCompetitiveness.filter(p => p.facultyName === selectedFacultyObject.facultyName)
      : [];

    const facultyGenderData = selectedFacultyData ? { labels: ['Laki-laki', 'Perempuan'], datasets: [{ data: [selectedFacultyData.maleAccepted, selectedFacultyData.femaleAccepted], backgroundColor: ['#0ea5e9', '#ec4899'], borderWidth: 1 }] } : null;
    const pathData = { labels: admissionPathStats.map(p => p.pathName), datasets: [ { label: 'Pendaftar', data: admissionPathStats.map(p => p.totalApplicants), backgroundColor: 'rgba(54, 162, 235, 0.6)' }, { label: 'Diterima', data: admissionPathStats.map(p => p.totalAccepted), backgroundColor: 'rgba(75, 192, 192, 0.6)' } ] };
    const facultyData = { labels: facultyStats.map(f => f.abbreviation || f.facultyName), datasets: [ { label: 'Pendaftar', data: facultyStats.map(f => f.totalApplicants), backgroundColor: 'rgba(153, 102, 255, 0.6)' }, { label: 'Diterima', data: facultyStats.map(f => f.totalAccepted), backgroundColor: 'rgba(255, 159, 64, 0.6)' } ] };

    switch (activeTab) {
      case 'overview':
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={ICONS.users} title="Total Pendaftar" value={overallStats.totalApplicants.toLocaleString()} detail="Di semua jalur penerimaan" color="sky" />
                    <StatCard icon={ICONS.check} title="Total Diterima" value={overallStats.totalAccepted.toLocaleString()} detail={`${((overallStats.totalAccepted / overallStats.totalApplicants) * 100).toFixed(1)}% dari pendaftar`} color="emerald" />
                    <StatCard icon={ICONS.kip} title="Penerima KIP" value={overallStats.kipRecipients.toLocaleString()} detail={`${((overallStats.kipRecipients / overallStats.kipApplicants) * 100).toFixed(1)}% dari pendaftar KIP`} color="indigo" />
                </div>
                {registrationStats && (
                    <Section title="Status Registrasi Ulang">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-medium text-slate-700 mb-2">Registrasi Berkas</h3>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(registrationStats.registeredDocs / overallStats.totalAccepted) * 100}%` }}></div></div>
                                <div className="flex justify-between text-sm">
                                    <p>Sudah: <span className="font-bold text-emerald-600">{registrationStats.registeredDocs.toLocaleString()}</span></p>
                                    <p>Belum: <span className="font-bold text-rose-600">{(overallStats.totalAccepted - registrationStats.registeredDocs).toLocaleString()}</span></p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-700 mb-2">Registrasi UKT</h3>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2"><div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${(registrationStats.registeredPayment / overallStats.totalAccepted) * 100}%` }}></div></div>
                                <div className="flex justify-between text-sm">
                                    <p>Sudah: <span className="font-bold text-sky-600">{registrationStats.registeredPayment.toLocaleString()}</span></p>
                                    <p>Belum: <span className="font-bold text-rose-600">{(overallStats.totalAccepted - registrationStats.registeredPayment).toLocaleString()}</span></p>
                                </div>
                            </div>
                        </div>
                    </Section>
                )}
            </div>
        );
      case 'faculty':
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Section title="Pendaftar & Diterima per Fakultas" className="lg:col-span-2">
                        <div className="h-96"><Bar data={facultyData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} /></div>
                    </Section>
                    <Section title="Detail Fakultas">
                        <label htmlFor="faculty-select" className="block text-sm font-medium text-slate-700 mb-1">Pilih Fakultas:</label>
                        <div className="relative">
                            <select id="faculty-select" onChange={handleFacultyChange} value={selectedFaculty || ''} className="appearance-none w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8">
                                {facultyStats.map(f => <option key={f.facultyId} value={f.facultyId}>{f.facultyName}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                        {selectedFacultyData ? (
                            <div className="mt-6 space-y-4">
                               <div><p className="text-sm text-slate-500">Total Pendaftar Fakultas</p><p className="text-lg font-bold text-slate-800">{selectedFacultyData.totalApplicants.toLocaleString()}</p></div>
                               <div><p className="text-sm text-slate-500">Total Diterima Fakultas</p><p className="text-lg font-bold text-emerald-600">{selectedFacultyData.totalAccepted.toLocaleString()}</p></div>
                               <div className="pt-4 border-t border-slate-200"><h3 className="text-md font-medium mb-2 text-center">Sebaran Gender (Diterima)</h3><div className="max-w-xs mx-auto"><Doughnut data={facultyGenderData} options={{plugins: {legend: {position: 'bottom'}}}}/></div></div>
                            </div>
                        ) : <p className="text-center text-slate-400 py-8">Pilih fakultas untuk melihat detail.</p>}
                    </Section>
                </div>

                {selectedFacultyData && (
                    <Section title={`Rincian Program Studi di ${selectedFacultyData.facultyName}`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Program Studi</th>
                                        <th className="px-4 py-2 text-center font-semibold text-slate-600">Peminat</th>
                                        <th className="px-4 py-2 text-center font-semibold text-slate-600">Diterima</th>
                                        <th className="px-4 py-2 text-center font-semibold text-slate-600">Keketatan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {programsInSelectedFaculty.length > 0 ? programsInSelectedFaculty.map(prog => (
                                        <tr key={prog.programId} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 font-medium text-slate-800">{prog.programName}</td>
                                            <td className="px-4 py-2 text-center text-slate-600">{prog.competitivenessOverall?.totalApplicants || 0}</td>
                                            <td className="px-4 py-2 text-center text-slate-600">{prog.competitivenessOverall?.totalAccepted || 0}</td>
                                            <td className="px-4 py-2 text-center text-slate-600">{prog.competitivenessOverall?.competitivenessRatio ? `1 : ${prog.competitivenessOverall.competitivenessRatio}` : '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-slate-400">Tidak ada data program studi untuk fakultas ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                )}
            </div>
        );
      case 'admissionPath':
        return (
            <Section title="Statistik per Jalur Masuk">
              <div className="h-96 max-w-4xl mx-auto mb-8"><Bar data={pathData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} /></div>
              <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jalur</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pendaftar</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Diterima</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rasio Lulus</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{admissionPathStats.map(p => (<tr key={p.pathName} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.pathName}</td><td className="px-6 py-4 text-sm text-slate-600">{p.totalApplicants.toLocaleString()}</td><td className="px-6 py-4 text-sm text-slate-600">{p.totalAccepted.toLocaleString()}</td><td className="px-6 py-4 text-sm font-semibold text-emerald-600">{p.totalApplicants > 0 ? ((p.totalAccepted / p.totalApplicants) * 100).toFixed(2) : 0}%</td></tr>))}</tbody></table></div>
            </Section>
        );
      case 'competitiveness':
        return (
            <Section title={`Keketatan Program Studi ${activeYear}`}>
              <div className="mb-4 flex flex-wrap gap-2">{['Overall', 'SNBP', 'SNBT', 'Mandiri'].map(filter => (<button key={filter} onClick={() => setCompetitivenessFilter(filter.toLowerCase())} className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-200 ${competitivenessFilter === filter.toLowerCase() ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-600 hover:bg-sky-50'}`}>{filter}</button>))}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Program Studi</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fakultas</th>
                    <th onClick={() => handleSort('ratio')} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2">Rasio Keketatan {competitivenessSort.key === 'ratio' && (competitivenessSort.order === 'asc' ? ICONS.sortAsc : ICONS.sortDesc)}</div></th>
                    <th onClick={() => handleSort('acceptance')} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-2">% Diterima {competitivenessSort.key === 'acceptance' && (competitivenessSort.order === 'asc' ? ICONS.sortAsc : ICONS.sortDesc)}</div></th>
                  </tr></thead>
                  <tbody className="bg-white divide-y divide-slate-200">{sortedPrograms.map((program) => { const data = program.activeCompetitiveness; const ratio = parseFloat(data?.competitivenessRatio); let ratioColor = 'bg-emerald-100 text-emerald-800'; if(ratio > 10) ratioColor = 'bg-rose-100 text-rose-800'; else if(ratio > 5) ratioColor = 'bg-amber-100 text-amber-800'; return (<tr key={program.programId} className="hover:bg-slate-50 transition-colors duration-200"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{program.programName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{program.facultyAbbreviation || program.facultyName}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ratioColor}`}>{data?.competitivenessRatio ? `1 : ${data.competitivenessRatio}` : 'N/A'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><div className="flex items-center gap-2"><div className="w-20 bg-slate-200 rounded-full h-2"><div className="bg-sky-500 h-2 rounded-full" style={{ width: `${data?.acceptanceRate || 0}%` }}></div></div><span>{data?.acceptanceRate ? `${data.acceptanceRate}%` : 'N/A'}</span></div></td></tr>);})}</tbody>
                </table>
              </div>
            </Section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-60 min-h-screen pt-0">
        <div className="container mx-auto px-3 py-0 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-4 md:mb-0">
                    Statistik Penerimaan {activeYear}
                </h1>
                <div className="flex items-center gap-2">
                    <label htmlFor="year-select" className="font-medium text-slate-700 text-sm">Tahun:</label>
                    <div className="relative">
                        <select 
                            id="year-select" value={activeYear || ''} onChange={handleYearChange} 
                            className="appearance-none w-32 bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8">
                            {years.map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-300 ${activeTab === tab.id ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-sky-100/70'}`}>
                    {tab.label}
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    </div>
  );
};

export default StatisticsPage;