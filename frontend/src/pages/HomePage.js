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
      <div className="flex flex-col justify-center items-center h-64">
        <div className="loader"></div>
        <p className="mt-4 text-neutral-600">Loading data...</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-neutral-800">Statistik Penerimaan Mahasiswa</h1>
        <p className="text-xl text-neutral-600 mt-2">Tahun Akademik {activeYear}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2 text-neutral-700">Total Pendaftar</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.overallStats.totalApplicants.toLocaleString()}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500">Laki-laki</p>
              <p className="text-base font-medium">{stats.overallStats.maleApplicants.toLocaleString()} 
                <span className="text-xs text-gray-500 ml-1">
                  ({((stats.overallStats.maleApplicants / stats.overallStats.totalApplicants) * 100).toFixed(0)}%)
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Perempuan</p>
              <p className="text-base font-medium">{stats.overallStats.femaleApplicants.toLocaleString()}
                <span className="text-xs text-gray-500 ml-1">
                  ({((stats.overallStats.femaleApplicants / stats.overallStats.totalApplicants) * 100).toFixed(0)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2 text-neutral-700">Total Diterima</h2>
          <p className="text-3xl font-bold text-primary-700">{stats.overallStats.totalAccepted.toLocaleString()}</p>
          <p className="text-sm text-neutral-500">
            ({((stats.overallStats.totalAccepted / stats.overallStats.totalApplicants) * 100).toFixed(2)}% dari pendaftar)
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500">Laki-laki</p>
              <p className="text-base font-medium">{stats.overallStats.maleAccepted.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Perempuan</p>
              <p className="text-base font-medium">{stats.overallStats.femaleAccepted.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2 text-neutral-700">KIP</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-gray-500">Pendaftar KIP</p>
              <p className="text-xl font-bold text-primary-800">{stats.overallStats.kipApplicants.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">
                ({((stats.overallStats.kipApplicants / stats.overallStats.totalApplicants) * 100).toFixed(1)}% dari total pendaftar)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Penerima KIP</p>
              <p className="text-xl font-bold text-primary-800">{stats.overallStats.kipRecipients.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">
                {/* Fixed calculation to show percentage of KIP applicants, not total accepted */}
                ({((stats.overallStats.kipRecipients / stats.overallStats.kipApplicants) * 100).toFixed(1)}% dari pendaftar KIP)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="chart-container">
          <h2 className="text-xl font-semibold mb-4 text-neutral-700">Sebaran Gender Mahasiswa Diterima</h2>
          <div className="w-full max-w-xs mx-auto">
            <Pie data={{
              ...genderData,
              datasets: [{
                ...genderData.datasets[0],
                backgroundColor: ['#5e79a2', '#e57aa2'],
              }]
            }} />
          </div>
        </div>
        
        <div className="chart-container">
          <h2 className="text-xl font-semibold mb-4 text-neutral-700">Statistik Jalur Masuk</h2>
          <Bar 
            data={{
              ...pathData,
              datasets: [
                {
                  ...pathData.datasets[0],
                  backgroundColor: 'rgba(94, 121, 162, 0.7)',
                  borderColor: 'rgba(94, 121, 162, 1)',
                },
                {
                  ...pathData.datasets[1],
                  backgroundColor: 'rgba(136, 151, 180, 0.7)',
                  borderColor: 'rgba(136, 151, 180, 1)',
                }
              ]
            }} 
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
        <Link to="/statistics" className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
          Lihat Statistik Lengkap
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
