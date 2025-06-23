import React, { useState, useEffect, useContext, useRef } from 'react';
import { StatisticsContext } from '../context/StatisticsContext';
import api from '../services/api';

const AdminPage = () => {
  const { years, loading: yearsLoading, refreshYears } = useContext(StatisticsContext);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [admissionPaths, setAdmissionPaths] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [formData, setFormData] = useState({
    academicYearId: '',
    programId: '',
    admissionPathId: '',
    totalApplicants: '',
    maleApplicants: '',
    femaleApplicants: '',
    totalAccepted: '',
    maleAccepted: '',
    femaleAccepted: '',
    kipApplicants: '',
    kipRecipients: '',
    registeredDocs: '',
    registeredPayment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [entries, setEntries] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [refreshData, setRefreshData] = useState(0);
  
  // Year modal state
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Add a ref to keep track of the active input
  const activeInputRef = useRef(null);
  
  // Add new state for selected entries
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  // Effect to restore focus after render
  useEffect(() => {
    if (activeInputRef.current) {
      const element = document.getElementById(activeInputRef.current);
      if (element) {
        element.focus();
        
        // Restore cursor position to the end of input only for text inputs
        // number input types don't support setSelectionRange
        if (element.type === 'text') {
          const valueLength = element.value.length;
          element.setSelectionRange(valueLength, valueLength);
        }
      }
    }
  }, [formData]);

  const handleFacultyChange = (e) => {
    setSelectedFacultyId(e.target.value);
    setFormData({
      ...formData,
      programId: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, id } = e.target;
    
    // Save the current focused input id
    activeInputRef.current = id;
    
    setFormData({
      ...formData,
      [name]: name.includes('total') || name.includes('male') || name.includes('female') || name.includes('kip')
        ? value === '' ? '' : parseInt(value) || 0
        : value
    });
  };

  const validateForm = () => {
    if (!formData.academicYearId) return 'Pilih tahun akademik';
    if (!formData.programId) return 'Pilih program studi';
    if (!formData.admissionPathId) return 'Pilih jalur masuk';
    
    // Convert empty strings to zero for validation
    const totalApplicants = formData.totalApplicants === '' ? 0 : formData.totalApplicants;
    const maleApplicants = formData.maleApplicants === '' ? 0 : formData.maleApplicants;
    const femaleApplicants = formData.femaleApplicants === '' ? 0 : formData.femaleApplicants;
    const totalAccepted = formData.totalAccepted === '' ? 0 : formData.totalAccepted;
    const maleAccepted = formData.maleAccepted === '' ? 0 : formData.maleAccepted;
    const femaleAccepted = formData.femaleAccepted === '' ? 0 : formData.femaleAccepted;
    const kipApplicants = formData.kipApplicants === '' ? 0 : formData.kipApplicants;
    const kipRecipients = formData.kipRecipients === '' ? 0 : formData.kipRecipients;
    
    if (maleApplicants + femaleApplicants !== totalApplicants) {
      return 'Total pendaftar harus sama dengan jumlah pendaftar laki-laki dan perempuan';
    }
    
    if (maleAccepted + femaleAccepted !== totalAccepted) {
      return 'Total diterima harus sama dengan jumlah diterima laki-laki dan perempuan';
    }
    
    if (totalAccepted > totalApplicants) {
      return 'Total diterima tidak boleh lebih besar dari total pendaftar';
    }
    
    // Enhanced KIP validation
    if (kipApplicants > totalApplicants) {
      return 'Pendaftar KIP tidak boleh lebih besar dari total pendaftar';
    }
    
    if (kipRecipients > kipApplicants) {
      return 'Penerima KIP tidak boleh lebih besar dari pendaftar KIP';
    }
    
    return null;
  };

  // Add this new function to validate the year input
  const validateYear = (yearStr) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(yearStr, 10);
    
    if (!yearStr.trim()) {
      return 'Tahun akademik wajib diisi';
    }
    
    if (isNaN(yearNum)) {
      return 'Tahun akademik harus berupa angka';
    }
    
    if (yearNum < 2000 || yearNum > currentYear + 10) {
      return `Tahun akademik harus antara 2000 dan ${currentYear + 10}`;
    }
    
    // Check if year already exists in the list
    if (years.some(y => y.year === yearStr)) {
      return `Tahun akademik ${yearStr} sudah ada`;
    }
    
    return null;
  };

  // Modify the handleCreateYear function to include better error handling
  const handleCreateYear = async (e) => {
    e.preventDefault();
    
    // Validate the year input
    const validationError = validateYear(newYear);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/academic-years', {
        year: newYear,
        isActive
      });
      
      // Add a log to see what was returned
      console.log('Year creation response:', response);
      
      setSuccess(`Tahun akademik ${newYear} berhasil ditambahkan`);
      setYearModalOpen(false);
      setNewYear('');
      setIsActive(false);
      
      // Refresh the years data in the context with await to ensure it completes
      await refreshYears();
      
      // Wait for a moment then clear success message
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error adding academic year:', err);
      
      // More detailed error message extraction
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Gagal menambahkan tahun akademik';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Convert empty strings to 0 before sending to the API
    const dataToSubmit = { ...formData };
    ['totalApplicants', 'maleApplicants', 'femaleApplicants', 
     'totalAccepted', 'maleAccepted', 'femaleAccepted', 
     'kipApplicants', 'kipRecipients', 'registeredDocs', 'registeredPayment'].forEach(field => {
      dataToSubmit[field] = dataToSubmit[field] === '' ? 0 : dataToSubmit[field];
    });
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode && editId) {
        await api.put(`/statistics/${editId}`, dataToSubmit);
        setSuccess('Data statistik berhasil diperbarui');
      } else {
        await api.post('/statistics', dataToSubmit);
        setSuccess('Data statistik berhasil ditambahkan');
      }
      
      // Reset form
      setFormData({
        academicYearId: '',
        programId: '',
        admissionPathId: '',
        totalApplicants: '',
        maleApplicants: '',
        femaleApplicants: '',
        totalAccepted: '',
        maleAccepted: '',
        femaleAccepted: '',
        kipApplicants: '',
        kipRecipients: '',
        registeredDocs: '',
        registeredPayment: ''
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
      kipRecipients: entry.kipRecipients,
      registeredDocs: entry.registeredDocs,
      registeredPayment: entry.registeredPayment
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
        setLoading(true);
        await api.delete(`/statistics/${id}`);
        setRefreshData(prev => prev + 1);
        setSuccess('Data berhasil dihapus');
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus data');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle selecting/deselecting a single entry
  const handleSelectEntry = (id) => {
    setSelectedEntries(prev => {
      if (prev.includes(id)) {
        return prev.filter(entryId => entryId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      // If already all selected, deselect all
      setSelectedEntries([]);
    } else {
      // Select all entries
      setSelectedEntries(entries.map(entry => entry.id));
    }
    setSelectAll(!selectAll);
  };

  // Effect to update selectAll state when selectedEntries changes
  useEffect(() => {
    if (entries.length > 0 && selectedEntries.length === entries.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedEntries, entries]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) {
      setError('Tidak ada data yang dipilih');
      return;
    }

    const message = selectedEntries.length === 1
      ? 'Anda yakin ingin menghapus 1 data yang dipilih?'
      : `Anda yakin ingin menghapus ${selectedEntries.length} data yang dipilih?`;

    if (window.confirm(message)) {
      try {
        setIsBulkDeleting(true);
        setLoading(true);
        
        // Delete entries one by one
        for (const id of selectedEntries) {
          await api.delete(`/statistics/${id}`);
        }
        
        setRefreshData(prev => prev + 1);
        setSuccess(`${selectedEntries.length} data berhasil dihapus`);
        setSelectedEntries([]);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menghapus data');
      } finally {
        setLoading(false);
        setIsBulkDeleting(false);
      }
    }
  };

  // Year modal component
  const YearModal = () => {
    if (!yearModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Tambah Tahun Akademik</h3>
          
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleCreateYear}>
            <div className="mb-4">
              <label htmlFor="newYear" className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Akademik:
              </label>
              <input
                type="text"
                id="newYear"
                value={newYear}
                onChange={(e) => {
                  setNewYear(e.target.value);
                  setError(null); // Clear error when user types
                }}
                placeholder="contoh: 2025"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="4"
                pattern="[0-9]*"
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-1">Masukkan tahun dalam format 4 digit (misal: 2025)</p>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Set sebagai tahun aktif</span>
              </label>
              {isActive && (
                <p className="text-xs text-gray-500 mt-1 pl-5">
                  Catatan: Ini akan menonaktifkan tahun aktif yang ada sebelumnya
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setYearModalOpen(false);
                  setError(null);
                  setNewYear('');
                  setIsActive(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add the button to open year modal
  const renderYearSelect = () => (
    <div>
      <label htmlFor="academicYearId" className="block text-sm font-medium text-gray-700 mb-1">
        Tahun Akademik:
      </label>
      <div className="flex space-x-2">
        <select
          id="academicYearId"
          name="academicYearId"
          value={formData.academicYearId}
          onChange={handleChange}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Pilih Tahun</option>
          {years.map(year => (
            <option key={year.id} value={year.id}>
              {year.year}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setYearModalOpen(true)}
          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
        >
          +
        </button>
      </div>
    </div>
  );

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
      
      {/* Add Year Modal */}
      <YearModal />
      
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
              {/* Replace the academic year select with our new component */}
              {renderYearSelect()}
              
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
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700">Data Registrasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registeredDocs" className="block text-sm font-medium text-gray-700 mb-1">
                    Registrasi Berkas:
                  </label>
                  <input
                    type="number"
                    id="registeredDocs"
                    name="registeredDocs"
                    min="0"
                    value={formData.registeredDocs}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="registeredPayment" className="block text-sm font-medium text-gray-700 mb-1">
                    Registrasi UKT:
                  </label>
                  <input
                    type="number"
                    id="registeredPayment"
                    name="registeredPayment"
                    min="0"
                    value={formData.registeredPayment}
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
                      kipRecipients: 0,
                      registeredDocs: 0,
                      registeredPayment: 0
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Kelola Data Statistik</h2>
            
            {/* Bulk Delete Button - Only show when entries are selected */}
            {selectedEntries.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={loading || isBulkDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
              >
                {isBulkDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  <>Hapus {selectedEntries.length} Item</>
                )}
              </button>
            )}
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada data statistik. Silakan tambahkan data terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
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
                    <tr 
                      key={entry.id}
                      className={selectedEntries.includes(entry.id) ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => handleSelectEntry(entry.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
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
                          disabled={loading}
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
          
          {/* Selection Summary */}
          {entries.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {selectedEntries.length > 0 ? (
                <p>{selectedEntries.length} dari {entries.length} item dipilih</p>
              ) : (
                <p>0 item dipilih</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;