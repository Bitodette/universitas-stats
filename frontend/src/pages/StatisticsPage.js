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

const StatisticsPage = () => {
  const { years, activeYear, setActiveYear, loading: yearsLoading } = useContext(StatisticsContext);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Read the saved tab from localStorage or use 'overview' as default
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('statisticsActiveTab');
    return savedTab || 'overview';
  });
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [competitivenessSort, setCompetitivenessSort] = useState('ratio');
  // NEW: Add state for sorted program data
  const [sortedPrograms, setSortedPrograms] = useState([]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('statisticsActiveTab', activeTab);
  }, [activeTab]);

  // Fetch statistik hanya berdasarkan activeYear
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!activeYear) return;
      try {
        setLoading(true);
        const response = await getYearlyStatistics(activeYear);
        setStatistics(response.data);
        // set default fakultas sekali saja
        if (!selectedFaculty && response.data.facultyStats.length) {
          setSelectedFaculty(response.data.facultyStats[0].facultyId);
        }
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [activeYear]); // Removed selectedFaculty dependency

  const handleYearChange = (e) => {
    setActiveYear(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFacultyChange = (facultyId) => {
    // Add smooth transition when changing faculty
    const facultyDetailElement = document.getElementById('faculty-detail');
    if (facultyDetailElement) {
      facultyDetailElement.style.opacity = '0';
      facultyDetailElement.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        setSelectedFaculty(Number(facultyId));
        
        // Restore visibility with animation
        setTimeout(() => {
          facultyDetailElement.style.opacity = '1';
          facultyDetailElement.style.transform = 'translateY(0px)';
        }, 50);
      }, 150);
    } else {
      setSelectedFaculty(Number(facultyId));
    }
  };

  // NEW: Add effect to sort programs when sort type changes or statistics updates
  useEffect(() => {
    if (statistics?.programCompetitiveness) {
      const sortedData = [...statistics.programCompetitiveness].sort((a, b) => {
        if (competitivenessSort === 'ratio') {
          // Higher ratio first (descending)
          return parseFloat(b.competitivenessRatio || 0) - parseFloat(a.competitivenessRatio || 0);
        } else {
          // Lower acceptance rate first (ascending)
          return parseFloat(a.acceptanceRate || 0) - parseFloat(b.acceptanceRate || 0);
        }
      });
      setSortedPrograms(sortedData);
    }
  }, [competitivenessSort, statistics?.programCompetitiveness]);

  // UPDATED: Improve the sort function with visual feedback
  const handleCompetitivenessSort = (sortType) => {
    console.log(`Sorting by: ${sortType}`);
    if (sortType === competitivenessSort) {
      // If clicking the same button, add visual feedback
      const button = document.getElementById(`sort-${sortType}`);
      if (button) {
        button.classList.add('bg-blue-700');
        setTimeout(() => button.classList.remove('bg-blue-700'), 300);
      }
    }
    setCompetitivenessSort(sortType);
  };

  if (yearsLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center p-4">
        No data available
      </div>
    );
  }

  // Data for admission path chart
  const pathData = {
    labels: statistics.admissionPathStats.map(path => path.pathName),
    datasets: [
      {
        label: 'Pendaftar',
        data: statistics.admissionPathStats.map(path => path.totalApplicants),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diterima',
        data: statistics.admissionPathStats.map(path => path.totalAccepted),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Data for gender distribution
  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [statistics.overallStats.maleAccepted, statistics.overallStats.femaleAccepted],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderWidth: 1,
      },
    ],
  };

  // Data for faculty chart - ensure we have valid data
  const facultyData = {
    labels: statistics.facultyStats.length > 0 
      ? statistics.facultyStats.map(faculty => faculty.abbreviation || faculty.facultyName.substring(0, 3)) 
      : ['No Data'],
    datasets: [
      {
        label: 'Pendaftar',
        data: statistics.facultyStats.length > 0 
          ? statistics.facultyStats.map(faculty => faculty.totalApplicants || 0)
          : [0],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diterima',
        data: statistics.facultyStats.length > 0 
          ? statistics.facultyStats.map(faculty => faculty.totalAccepted || 0)
          : [0],
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Data for KIP recipients - ensure we have valid data
  const kipData = {
    labels: statistics.facultyStats.length > 0 
      ? statistics.facultyStats.map(faculty => faculty.abbreviation || faculty.facultyName.substring(0, 3))
      : ['No Data'],
    datasets: [
      {
        label: 'Penerima KIP',
        data: statistics.facultyStats.length > 0 
          ? statistics.facultyStats.map(faculty => faculty.kipRecipients || 0)
          : [0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Filter data for selected faculty
  const selectedFacultyData = statistics.facultyStats.find(faculty => faculty.facultyId === selectedFaculty);

  // Faculty gender data
  const facultyGenderData = selectedFacultyData 
    ? {
        labels: ['Laki-laki', 'Perempuan'],
        datasets: [
          {
            data: [selectedFacultyData.maleAccepted, selectedFacultyData.femaleAccepted],
            backgroundColor: ['#3B82F6', '#EC4899'],
            borderWidth: 1,
          },
        ],
      } 
    : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Statistik Penerimaan {activeYear}
        </h1>
        <div className="flex items-center">
          <label htmlFor="year" className="mr-2 font-medium text-gray-700">Tahun:</label>
          <select
            id="year"
            value={activeYear}
            onChange={handleYearChange}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year.id} value={year.year}>
                {year.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'admissionPath'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('admissionPath')}
            >
              Jalur Masuk
            </button>
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'faculty'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('faculty')}
            >
              Fakultas
            </button>
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'competitiveness'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('competitiveness')}
            >
              Keketatan
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Total Pendaftar</h2>
              <p className="text-3xl font-bold text-blue-600">{statistics.overallStats.totalApplicants.toLocaleString()}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Laki-laki</p>
                  <p className="text-base font-medium">{statistics.overallStats.maleApplicants.toLocaleString()} 
                    <span className="text-xs text-gray-500 ml-1">
                      ({((statistics.overallStats.maleApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(0)}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Perempuan</p>
                  <p className="text-base font-medium">{statistics.overallStats.femaleApplicants.toLocaleString()}
                    <span className="text-xs text-gray-500 ml-1">
                      ({((statistics.overallStats.femaleApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(0)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Total Diterima</h2>
              <p className="text-3xl font-bold text-green-600">{statistics.overallStats.totalAccepted.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-1">
                ({((statistics.overallStats.totalAccepted / statistics.overallStats.totalApplicants) * 100).toFixed(0)}% dari pendaftar)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Laki-laki</p>
                  <p className="text-base font-medium">{statistics.overallStats.maleAccepted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Perempuan</p>
                  <p className="text-base font-medium">{statistics.overallStats.femaleAccepted.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">KIP</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pendaftar KIP</p>
                  <p className="text-xl font-bold text-indigo-600">{statistics.overallStats.kipApplicants.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    ({statistics.overallStats.totalApplicants > 0 ? 
                      ((statistics.overallStats.kipApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(1) : 
                      0}% dari total pendaftar)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Penerima KIP</p>
                  <p className="text-xl font-bold text-purple-600">{statistics.overallStats.kipRecipients.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {/* Fix: Calculate as percentage of KIP applicants, not total accepted */}
                    ({statistics.overallStats.kipApplicants > 0 ? 
                      ((statistics.overallStats.kipRecipients / statistics.overallStats.kipApplicants) * 100).toFixed(1) : 
                      0}% dari pendaftar KIP)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* New Registration Status Section */}
          {statistics.registrationStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Status Registrasi Berkas</h2>
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-600 h-4 rounded-full" 
                      style={{ width: `${((statistics.registrationStats.registeredDocs / statistics.overallStats.totalAccepted) * 100).toFixed(0)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sudah Registrasi</p>
                    <p className="text-xl font-bold text-green-600">{statistics.registrationStats.registeredDocs.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      ({((statistics.registrationStats.registeredDocs / statistics.overallStats.totalAccepted) * 100).toFixed(0)}%)
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Belum Registrasi</p>
                    <p className="text-xl font-bold text-red-600">{(statistics.overallStats.totalAccepted - statistics.registrationStats.registeredDocs).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      ({((statistics.overallStats.totalAccepted - statistics.registrationStats.registeredDocs) / statistics.overallStats.totalAccepted * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Status Registrasi UKT</h2>
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${((statistics.registrationStats.registeredPayment / statistics.overallStats.totalAccepted) * 100).toFixed(0)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sudah Registrasi</p>
                    <p className="text-xl font-bold text-blue-600">{statistics.registrationStats.registeredPayment.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      ({((statistics.registrationStats.registeredPayment / statistics.overallStats.totalAccepted) * 100).toFixed(0)}%)
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Belum Registrasi</p>
                    <p className="text-xl font-bold text-red-600">{(statistics.overallStats.totalAccepted - statistics.registrationStats.registeredPayment).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      ({((statistics.overallStats.totalAccepted - statistics.registrationStats.registeredPayment) / statistics.overallStats.totalAccepted * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Penerimaan per Jalur Masuk</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statistics.admissionPathStats.map((path, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{path.pathName}</h3>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Pendaftar:</span>
                    <span className="text-sm font-medium">{path.totalApplicants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Diterima:</span>
                    <span className="text-sm font-medium">{path.totalAccepted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rasio Kelulusan:</span>
                    <span className="text-sm font-medium">{((path.totalAccepted / path.totalApplicants) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistik per Fakultas</h2>
            {statistics.facultyStats.length > 0 && statistics.facultyStats.some(f => f.totalApplicants > 0 || f.totalAccepted > 0) ? (
              <Bar 
                data={facultyData} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Tidak ada data fakultas yang tersedia untuk ditampilkan</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Detail Fakultas</h2>
            <div className="mb-4">
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Fakultas:
              </label>
              <select
                id="faculty"
                value={selectedFaculty || ''}
                onChange={(e) => handleFacultyChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statistics.facultyStats.map(faculty => (
                  <option key={faculty.facultyId} value={faculty.facultyId}>
                    {faculty.facultyName}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedFacultyData && (
              <div 
                id="faculty-detail" 
                className="transition-all duration-300 ease-in-out"
                style={{opacity: 1, transform: 'translateY(0)'}}
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Pendaftar:</p>
                  <p className="text-lg font-semibold">{selectedFacultyData.totalApplicants.toLocaleString()}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Diterima:</p>
                  <p className="text-lg font-semibold">{selectedFacultyData.totalAccepted.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    ({((selectedFacultyData.totalAccepted / selectedFacultyData.totalApplicants) * 100).toFixed(2)}% dari pendaftar)
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Penerima KIP:</p>
                  <p className="text-lg font-semibold">{selectedFacultyData.kipRecipients.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    ({((selectedFacultyData.kipRecipients / selectedFacultyData.totalAccepted) * 100).toFixed(2)}% dari yang diterima)
                  </p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Sebaran Jenis Kelamin</h3>
                  <div className="w-full max-w-xs mx-auto">
                    <Doughnut data={facultyGenderData} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admissionPath' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Statistik per Jalur Masuk</h2>
          <div className="max-w-4xl mx-auto">
            <Bar 
              data={pathData} 
              options={{ 
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
          
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jalur Masuk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendaftar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diterima
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rasio Kelulusan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.admissionPathStats.map((path, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {path.pathName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {path.totalApplicants.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {path.totalAccepted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((path.totalAccepted / path.totalApplicants) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gender' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sebaran Jenis Kelamin Mahasiswa Diterima</h2>
            <div className="w-full max-w-xs mx-auto">
              <Doughnut data={genderData} />
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Laki-laki</p>
                <p className="text-xl font-semibold text-blue-600">{statistics.overallStats.maleAccepted.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.maleAccepted / statistics.overallStats.totalAccepted) * 100).toFixed(2)}%)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Perempuan</p>
                <p className="text-xl font-semibold text-pink-600">{statistics.overallStats.femaleAccepted.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.femaleAccepted / statistics.overallStats.totalAccepted) * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sebaran Jenis Kelamin Pendaftar</h2>
            
            <div className="w-full max-w-xs mx-auto">
              <Doughnut 
                data={{
                  labels: ['Laki-laki', 'Perempuan'],
                  datasets: [
                    {
                      data: [statistics.overallStats.maleApplicants, statistics.overallStats.femaleApplicants],
                      backgroundColor: ['#3B82F6', '#EC4899'],
                      borderWidth: 1,
                    },
                  ],
                }} 
              />
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Laki-laki</p>
                <p className="text-xl font-semibold text-blue-600">{statistics.overallStats.maleApplicants.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.maleApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(2)}%)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Perempuan</p>
                <p className="text-xl font-semibold text-pink-600">{statistics.overallStats.femaleApplicants.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.femaleApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kip' && (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Penerima KIP per Fakultas</h2>
            <div className="max-w-4xl mx-auto">
              {statistics.facultyStats.length > 0 && statistics.facultyStats.some(f => f.kipRecipients > 0) ? (
                <Bar 
                  data={kipData} 
                  options={{ 
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Tidak ada data penerima KIP yang tersedia untuk ditampilkan</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistik KIP</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Pendaftar KIP</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.overallStats.kipApplicants.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.kipApplicants / statistics.overallStats.totalApplicants) * 100).toFixed(2)}% dari total pendaftar)
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Penerima KIP</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.overallStats.kipRecipients.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  ({((statistics.overallStats.kipRecipients / statistics.overallStats.totalAccepted) * 100).toFixed(2)}% dari total diterima)
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Rasio Kelulusan KIP</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((statistics.overallStats.kipRecipients / statistics.overallStats.kipApplicants) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitiveness' && statistics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Keketatan Program Studi {activeYear}
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Studi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fakultas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendaftar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diterima
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rasio Keketatan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persentase Diterima
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPrograms.map((program, index) => (
                  <tr key={program.programId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {program.programName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.facultyAbbreviation || program.facultyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.totalApplicants.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.totalAccepted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${parseFloat(program.competitivenessRatio) > 10 
                            ? 'bg-red-100 text-red-800' 
                            : parseFloat(program.competitivenessRatio) > 5 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'}`}>
                          {program.competitivenessRatio} : 1
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${program.acceptanceRate}%` }}>
                          </div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {program.acceptanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;