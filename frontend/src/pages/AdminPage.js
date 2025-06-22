import React, { useState, useEffect, useContext } from 'react';
import { StatisticsContext } from '../context/StatisticsContext';
import api from '../services/api';

const AdminPage = () => {
  const { years, loading: yearsLoading } = useContext(StatisticsContext);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [admissionPaths, setAdmissionPaths] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [formData, setFormData] = useState({
    academicYearId: '',
    programId: '',
    admissionPathId: '',
    totalApplicants: 0,
    maleApplicants: 0,
    femaleApplicants: 0,
    totalAccepted: 0,
    maleAccepted: 0,
    femaleAccepted: 0,
    kipApplicants: 0,
    kipRecipients: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [entries, setEntries] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [refreshData, setRefreshData] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch faculties
        const facultiesResponse = await api.get('/faculties');
        setFaculties(facultiesResponse.data.data || []);
        
        // Fetch admission paths
        const pathsResponse = await api.get('/admission-paths');
        setAdmissionPaths(pathsResponse.data.data || []);
        
        // Fetch existing entries if on manage tab
        if (activeTab === 'manage') {
          const entriesResponse = await api.get('/statistics/entries');
          setEntries(entriesResponse.data.data || []);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    fetchData();
  }, [activeTab, refreshData]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedFacultyId) {
        setPrograms([]);
        return;
      }

      try {
        const response = await api.get(`/faculties/${selectedFacultyId}/programs`);
        setPrograms(response.data.data || []);
      } catch (err) {
        setError('Failed to load programs');
      }
    };

    fetchPrograms();
  }, [selectedFacultyId]);

  const handleFacultyChange = (e) => {
    setSelectedFacultyId(e.target.value);
    setFormData({
      ...formData,
      programId: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('total') || name.includes('male') || name.includes('female') || name.includes('kip')
        ? parseInt(value) || 0
        : value
    });
  };

  const validateForm = () => {
    if (!formData.academicYearId) return 'Pilih tahun akademik';
    if (!formData.programId) return 'Pilih program studi';
    if (!formData.admissionPathId) return 'Pilih jalur masuk';
    
    if (formData.maleApplicants + formData.femaleApplicants !== formData.totalApplicants) {
      return 'Total pendaftar harus sama dengan jumlah pendaftar laki-laki dan perempuan';
    }
    
    if (formData.maleAccepted + formData.femaleAccepted !== formData.totalAccepted) {
      return 'Total diterima harus sama dengan jumlah diterima laki-laki dan perempuan';
    }
    
    if (formData.totalAccepted > formData.totalApplicants) {
      return 'Total diterima tidak boleh lebih besar dari total pendaftar';
    }
    
    if (formData.kipRecipients > formData.kipApplicants) {
      return 'Penerima KIP tidak boleh lebih besar dari pendaftar KIP';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode && editId) {
        await api.put(`/statistics/${editId}`, formData);
        setSuccess('Data statistik berhasil diperbarui');
      } else {
        await api.post('/statistics', formData);
        setSuccess('Data statistik berhasil ditambahkan');
      }
      
      // Reset form
      setFormData({
        academicYearId: '',
        programId: '',
        admissionPathId: '',
        totalApplicants: 0,
        maleApplicants: 0,
        femaleApplicants: 0,
        totalAccepted: 0,
        maleAccepted: 0,
        femaleAccepted: 0,
        kipApplicants: 0,
        kipRecipients: 0
      });
      setSelectedFacultyId('');
      setIsEditMode(false);
      setEditId(null);
      setRefreshData(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add statistics data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      academicYearId: entry.academicYearId,
      programId: entry.programId,
      admissionPathId: entry.admissionPathId,
      totalApplicants: entry.totalApplicants,
      maleApplicants: entry.maleApplicants,
      femaleApplicants: entry.femaleApplicants,
      totalAccepted: entry.totalAccepted,
      maleAccepted: entry.maleAccepted,
      femaleAccepted: entry.femaleAccepted,
      kipApplicants: entry.kipApplicants,
      kipRecipients: entry.kipRecipients
    });
    
    // Set faculty ID from program
    const program = entry.Program;
    if (program && program.Faculty) {
      setSelectedFacultyId(program.Faculty.id.toString());
    }
    
    setIsEditMode(true);
    setEditId(entry.id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Anda yakin ingin menghapus data ini?')) {
      try {
        await api.delete(`/statistics/${id}`);
        setRefreshData(prev => prev + 1);
        setSuccess('Data berhasil dihapus');
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus data');
      }
    }
  };

  if (yearsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('add')}
            >
              {isEditMode ? 'Edit Data' : 'Tambah Data'}
            </button>
            <button
              className={`mr-1 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('manage');
                setIsEditMode(false);
                setEditId(null);
              }}
            >
              Kelola Data
            </button>
          </nav>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}
      
      {activeTab === 'add' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">
            {isEditMode ? 'Edit Data Statistik' : 'Tambah Data Statistik'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="academicYearId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Akademik:
                </label>
                <select
                  id="academicYearId"
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Tahun</option>
                  {years.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Fakultas:
                </label>
                <select
                  id="facultyId"
                  value={selectedFacultyId}
                  onChange={handleFacultyChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Fakultas</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-1">
                  Program Studi:
                </label>
                <select
                  id="programId"
                  name="programId"
                  value={formData.programId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!selectedFacultyId}
                >
                  <option value="">Pilih Program Studi</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="admissionPathId" className="block text-sm font-medium text-gray-700 mb-1">
                  Jalur Masuk:
                </label>
                <select
                  id="admissionPathId"
                  name="admissionPathId"
                  value={formData.admissionPathId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Jalur Masuk</option>
                  {admissionPaths.map(path => (
                    <option key={path.id} value={path.id}>
                      {path.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700">Data Pendaftar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="totalApplicants" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Pendaftar:
                  </label>
                  <input
                    type="number"
                    id="totalApplicants"
                    name="totalApplicants"
                    min="0"
                    value={formData.totalApplicants}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="maleApplicants" className="block text-sm font-medium text-gray-700 mb-1">
                    Pendaftar Laki-laki:
                  </label>
                  <input
                    type="number"
                    id="maleApplicants"
                    name="maleApplicants"
                    min="0"
                    value={formData.maleApplicants}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="femaleApplicants" className="block text-sm font-medium text-gray-700 mb-1">
                    Pendaftar Perempuan:
                  </label>
                  <input
                    type="number"
                    id="femaleApplicants"
                    name="femaleApplicants"
                    min="0"
                    value={formData.femaleApplicants}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700">Data Diterima</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="totalAccepted" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Diterima:
                  </label>
                  <input
                    type="number"
                    id="totalAccepted"
                    name="totalAccepted"
                    min="0"
                    value={formData.totalAccepted}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="maleAccepted" className="block text-sm font-medium text-gray-700 mb-1">
                    Diterima Laki-laki:
                  </label>
                  <input
                    type="number"
                    id="maleAccepted"
                    name="maleAccepted"
                    min="0"
                    value={formData.maleAccepted}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="femaleAccepted" className="block text-sm font-medium text-gray-700 mb-1">
                    Diterima Perempuan:
                  </label>
                  <input
                    type="number"
                    id="femaleAccepted"
                    name="femaleAccepted"
                    min="0"
                    value={formData.femaleAccepted}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700">Data KIP</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="kipApplicants" className="block text-sm font-medium text-gray-700 mb-1">
                    Pendaftar KIP:
                  </label>
                  <input
                    type="number"
                    id="kipApplicants"
                    name="kipApplicants"
                    min="0"
                    value={formData.kipApplicants}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="kipRecipients" className="block text-sm font-medium text-gray-700 mb-1">
                    Penerima KIP:
                  </label>
                  <input
                    type="number"
                    id="kipRecipients"
                    name="kipRecipients"
                    min="0"
                    value={formData.kipRecipients}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData({
                      academicYearId: '',
                      programId: '',
                      admissionPathId: '',
                      totalApplicants: 0,
                      maleApplicants: 0,
                      femaleApplicants: 0,
                      totalAccepted: 0,
                      maleAccepted: 0,
                      femaleAccepted: 0,
                      kipApplicants: 0,
                      kipRecipients: 0
                    });
                    setSelectedFacultyId('');
                    setEditId(null);
                  }}
                  className="mr-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : isEditMode ? 'Update Data' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeTab === 'manage' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Kelola Data Statistik</h2>
          
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada data statistik. Silakan tambahkan data terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tahun
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program Studi
                    </th>
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
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.AcademicYear?.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.Program?.name} ({entry.Program?.Faculty?.abbreviation})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.AdmissionPath?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.totalApplicants}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.totalAccepted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(entry)} 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;