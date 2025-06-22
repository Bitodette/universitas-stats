import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatisticsContext } from '../context/StatisticsContext';
import { getYearlyStatistics } from '../services/statisticsService';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

  if (yearLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader">Loading...</div>
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

  if (!stats) {
    return (
      <div className="text-center p-4">
        No data available
      </div>
    );
  }

  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [stats.overallStats.maleAccepted, stats.overallStats.femaleAccepted],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderWidth: 1,
      },
    ],
  };

  const pathData = {
    labels: stats.admissionPathStats.map(path => path.pathName),
    datasets: [
      {
        label: 'Pendaftar',
        data: stats.admissionPathStats.map(path => path.totalApplicants),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diterima',
        data: stats.admissionPathStats.map(path => path.totalAccepted),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Statistik Penerimaan Mahasiswa</h1>
        <p className="text-xl text-gray-600">Tahun Akademik {activeYear}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Pendaftar</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.overallStats.totalApplicants.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Diterima</h2>
          <p className="text-3xl font-bold text-green-600">{stats.overallStats.totalAccepted.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            ({((stats.overallStats.totalAccepted / stats.overallStats.totalApplicants) * 100).toFixed(2)}% dari pendaftar)
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Penerima KIP</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.overallStats.kipRecipients.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            ({((stats.overallStats.kipRecipients / stats.overallStats.totalAccepted) * 100).toFixed(2)}% dari yang diterima)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sebaran Gender Mahasiswa Diterima</h2>
          <div className="w-full max-w-xs mx-auto">
            <Pie data={genderData} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Statistik Jalur Masuk</h2>
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
      </div>

      <div className="text-center">
        <Link to="/statistics" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Lihat Statistik Lengkap
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
