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
Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const ComparisonPage = () => {
  const { years, loading: yearsLoading } = useContext(StatisticsContext);
  const [year1, setYear1] = useState(null);
  const [year2, setYear2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set default years when years are loaded
    if (years && years.length >= 2 && !year1 && !year2) {
      setYear1(years[0].year);
      setYear2(years[1].year);
    }
  }, [years, year1, year2]);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!year1 || !year2 || year1 === year2) return;
      
      try {
        setLoading(true);
        const response = await getComparisonData(year1, year2);
        setComparisonData(response.data);
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to fetch comparison data');
        setComparisonData(null);
      } finally {
        setLoading(false);
      }
    };

    if (year1 && year2) {
      fetchComparisonData();
    }
  }, [year1, year2]);

  const handleYearChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const renderChangeIndicator = (changeValue) => {
    if (changeValue === 'N/A') return <span className="text-gray-500">N/A</span>;
    
    const numValue = parseFloat(changeValue);
    if (numValue > 0) {
      return <span className="text-green-600">+{changeValue}% ↑</span>;
    } else if (numValue < 0) {
      return <span className="text-red-600">{changeValue}% ↓</span>;
    } else {
      return <span className="text-gray-600">0% -</span>;
    }
  };

  if (yearsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (years.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-semibold">Perbandingan tidak tersedia</p>
          <p>Minimal diperlukan data dari 2 tahun akademik untuk membuat perbandingan.</p>
        </div>
      </div>
    );
  }

  const chartData = comparisonData ? {
    labels: ['Total Pendaftar', 'Total Diterima'],
    datasets: [
      {
        label: year1,
        data: [
          comparisonData.compareOverall.year1.totalApplicants,
          comparisonData.compareOverall.year1.totalAccepted
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: year2,
        data: [
          comparisonData.compareOverall.year2.totalApplicants,
          comparisonData.compareOverall.year2.totalAccepted
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Perbandingan Statistik Antar Tahun
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="year1" className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Pertama:
            </label>
            <select
              id="year1"
              value={year1 || ''}
              onChange={handleYearChange(setYear1)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tahun</option>
              {years.map(year => (
                <option key={`y1-${year.id}`} value={year.year}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year2" className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Kedua:
            </label>
            <select
              id="year2"
              value={year2 || ''}
              onChange={handleYearChange(setYear2)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tahun</option>
              {years.map(year => (
                <option key={`y2-${year.id}`} value={year.year}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
            <p>{error}</p>
          </div>
        )}
        
        {year1 && year2 && year1 === year2 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4">
            <p>Pilih dua tahun yang berbeda untuk perbandingan.</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : comparisonData ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Perbandingan Keseluruhan</h2>
            
            <div className="max-w-3xl mx-auto mb-8">
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    title: {
                      display: true,
                      text: `Perbandingan ${year1} vs ${year2}`
                    },
                  }
                }} 
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metrik
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {year1}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {year2}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perubahan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total Pendaftar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparisonData.compareOverall.year1.totalApplicants.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparisonData.compareOverall.year2.totalApplicants.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderChangeIndicator(comparisonData.compareOverall.change.totalApplicants)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total Diterima
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparisonData.compareOverall.year1.totalAccepted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparisonData.compareOverall.year2.totalAccepted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderChangeIndicator(comparisonData.compareOverall.change.totalAccepted)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Perbandingan per Jalur Masuk</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jalur Masuk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendaftar {year1}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendaftar {year2}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perubahan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diterima {year1}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diterima {year2}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perubahan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.keys(comparisonData.compareByPath).map((path, index) => {
                    const pathData = comparisonData.compareByPath[path];
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pathData.year1.totalApplicants.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pathData.year2.totalApplicants.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderChangeIndicator(pathData.change.totalApplicants)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pathData.year1.totalAccepted.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pathData.year2.totalAccepted.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderChangeIndicator(pathData.change.totalAccepted)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ComparisonPage;
