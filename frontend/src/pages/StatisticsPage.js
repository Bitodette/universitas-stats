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
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!activeYear) return;
      
      try {
        setLoading(true);
        const response = await getYearlyStatistics(activeYear);
        setStatistics(response.data);
        
        // Set the first faculty as selected by default
        if (response.data.facultyStats.length > 0 && !selectedFaculty) {
          setSelectedFaculty(response.data.facultyStats[0].facultyId);
        }
        
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [activeYear, selectedFaculty]);

  const handleYearChange = (e) => {
    setActiveYear(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty(Number(facultyId));
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

  // Data for faculty chart
  const facultyData = {
    labels: statistics.facultyStats.map(faculty => faculty.abbreviation),
    datasets: [
      {
        label: 'Pendaftar',
        data: statistics.facultyStats.map(faculty => faculty.totalApplicants),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diterima',
        data: statistics.facultyStats.map(faculty => faculty.totalAccepted),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Data for KIP recipients
  const kipData = {
    labels: statistics.facultyStats.map(faculty => faculty.abbreviation),
    datasets: [
      {
        label: 'Penerima KIP',
        data: statistics.facultyStats.map(faculty => faculty.kipRecipients),
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
                activeTab === 'gender'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('gender')}
            >
              Gender
            </button>
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'kip'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('kip')}
            >
              KIP
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Total Pendaftar</h2>
            <p className="text-3xl font-bold text-blue-600">{statistics.overallStats.totalApplicants.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Total Diterima</h2>
            <p className="text-3xl font-bold text-green-600">{statistics.overallStats.totalAccepted.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              ({((statistics.overallStats.totalAccepted / statistics.overallStats.totalApplicants) * 100).toFixed(2)}% dari pendaftar)
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Penerima KIP</h2>
            <p className="text-3xl font-bold text-purple-600">{statistics.overallStats.kipRecipients.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              ({((statistics.overallStats.kipRecipients / statistics.overallStats.totalAccepted) * 100).toFixed(2)}% dari yang diterima)
            </p>
          </div>
        </div>
      )}

      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistik per Fakultas</h2>
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
              <div>
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
                  <h3 className="text-md font-medium mb-2">Sebaran Gender</h3>
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
            <h2 className="text-xl font-semibold mb-4">Sebaran Gender Mahasiswa Diterima</h2>
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
            <h2 className="text-xl font-semibold mb-4">Sebaran Gender Pendaftar</h2>
            
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
    </div>
  );
};

export default StatisticsPage;
