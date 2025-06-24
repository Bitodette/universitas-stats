import React, { useState, useEffect, useContext } from 'react';
import { StatisticsContext } from '../context/StatisticsContext';
import api from '../services/api';

//=================================================================
// 1. KOMPONEN UI HELPER (Didefinisikan di luar AdminPage)
//=================================================================

const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 ${className}`}>
    {title && <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>}
    {children}
  </div>
);

const Alert = ({ message, type = 'info', onDismiss }) => {
    const baseClasses = 'flex items-start justify-between gap-4 p-4 rounded-lg border-l-4 mb-6';
    const typeClasses = {
        success: 'bg-emerald-100 border-emerald-500 text-emerald-800',
        error: 'bg-rose-100 border-rose-500 text-rose-800',
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type] || ''}`} role="alert">
            <p className="text-sm font-medium">{message}</p>
            {onDismiss && <button onClick={onDismiss} className="text-xl leading-none font-bold opacity-70 hover:opacity-100">&times;</button>}
        </div>
    );
};

const CustomSpinner = () => (
    <div className="flex justify-center items-center h-80">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
    </div>
);

const FormInput = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input id={id} {...props} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
    </div>
);

const YearModal = ({ isOpen, onClose, onSubmit, loading, error, newYear, setNewYear, isActive, setIsActive, clearError }) => {
    if (!isOpen) return null;
    const ICONS = { spinner: <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> };
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Tambah Tahun Akademik</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                {error && <Alert type="error" message={error} onDismiss={clearError} />}
                <div>
                    <label htmlFor="newYear" className="block text-sm font-medium text-slate-700 mb-1">Tahun Akademik:</label>
                    <input type="text" id="newYear" value={newYear} onChange={(e) => { setNewYear(e.target.value); clearError(); }} placeholder="contoh: 2025" className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" maxLength="4" pattern="[0-9]*" autoFocus required />
                </div>
                <div>
                    <label className="flex items-center">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                        <span className="ml-2 text-sm text-slate-700">Set sebagai tahun aktif</span>
                    </label>
                    {isActive && <p className="text-xs text-slate-500 mt-1 pl-6">Catatan: Ini akan menonaktifkan tahun aktif yang ada sebelumnya.</p>}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 focus:outline-none font-semibold text-sm">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none disabled:bg-sky-400 disabled:cursor-not-allowed font-semibold text-sm flex items-center gap-2" disabled={loading}>{loading ? <>{ICONS.spinner} Menyimpan...</> : 'Simpan'}</button>
                </div>
            </form>
        </div>
      </div>
    );
};

const StyledSelect = ({ id, name, label, value, onChange, disabled, children, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className="appearance-none w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-8 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
        </div>
    </div>
);


//=================================================================
// 2. KOMPONEN UTAMA: AdminPage
//=================================================================

const AdminPage = () => {
  const { years, loading: yearsLoading, refreshYears } = useContext(StatisticsContext);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [admissionPaths, setAdmissionPaths] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  
  const initialFormData = {
    academicYearId: '', programId: '', admissionPathId: '', totalApplicants: '', 
    totalAccepted: '', maleAccepted: '', femaleAccepted: '', kipApplicants: '',
    kipRecipients: '', registeredDocs: '', registeredPayment: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [entries, setEntries] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [refreshData, setRefreshData] = useState(0);
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const ICONS = {
    add: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z" /></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" /></svg>,
    spinner: <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  };

  const resetForm = () => { setFormData(initialFormData); setSelectedFacultyId(''); setIsEditMode(false); setEditId(null); };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultiesRes, pathsRes] = await Promise.all([api.get('/faculties'), api.get('/admission-paths')]);
        setFaculties(facultiesRes.data.data || []);
        setAdmissionPaths(pathsRes.data.data || []);
      } catch (err) { setError('Gagal memuat data fakultas & jalur masuk.'); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
        const fetchEntries = async () => {
            setLoading(true);
            try {
                const entriesRes = await api.get('/statistics/entries');
                setEntries(entriesRes.data.data || []);
            } catch (err) { setError('Gagal memuat data statistik yang sudah ada.');
            } finally { setLoading(false); }
        };
        fetchEntries();
    }
  }, [activeTab, refreshData]);

  useEffect(() => {
    if (!selectedFacultyId) { setPrograms([]); return; }
    const fetchPrograms = async () => {
      try { const res = await api.get(`/faculties/${selectedFacultyId}/programs`); setPrograms(res.data.data || []); } 
      catch (err) { setError('Gagal memuat program studi.'); }
    };
    fetchPrograms();
  }, [selectedFacultyId]);

  const handleFacultyChange = (e) => { setSelectedFacultyId(e.target.value); setFormData(prev => ({...prev, programId: ''}));};
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: name.includes('Id') ? value : (value === '' ? '' : parseInt(value) || 0) })); };
  
  const validateForm = () => {
    if (!formData.academicYearId || !formData.programId || !formData.admissionPathId) { return 'Tahun, Program Studi, dan Jalur Masuk wajib diisi.'; }
    const { totalApplicants = 0, totalAccepted = 0, maleAccepted = 0, femaleAccepted = 0, kipApplicants = 0, kipRecipients = 0 } = formData;
    if (maleAccepted + femaleAccepted !== totalAccepted) { return 'Total diterima tidak cocok dengan jumlah gender.'; }
    if (totalAccepted > totalApplicants) { return 'Total diterima tidak boleh lebih besar dari total pendaftar'; }
    if (kipApplicants > totalApplicants) { return 'Pendaftar KIP tidak boleh lebih besar dari total pendaftar'; }
    if (kipRecipients > kipApplicants) { return 'Penerima KIP tidak boleh lebih besar dari pendaftar KIP'; }
    return null;
  };
  
  const validateYear = (yearStr) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(yearStr, 10);
    if (!yearStr.trim()) return 'Tahun akademik wajib diisi';
    if (isNaN(yearNum)) return 'Tahun akademik harus berupa angka';
    if (yearNum < 2000 || yearNum > currentYear + 10) return `Tahun akademik harus antara 2000 dan ${currentYear + 10}`;
    if (years.some(y => y.year === yearStr)) return `Tahun akademik ${yearStr} sudah ada`;
    return null;
  };
  
  const handleCreateYear = async (e) => {
    e.preventDefault();
    const validationError = validateYear(newYear);
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError(null);
    try {
      await api.post('/academic-years', { year: newYear, isActive });
      setSuccess(`Tahun akademik ${newYear} berhasil ditambahkan`);
      setYearModalOpen(false); setNewYear(''); setIsActive(false);
      await refreshYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan tahun akademik');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const dataToSubmit = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? 0 : value;
        return acc;
      }, {});
      if (isEditMode) {
        await api.put(`/statistics/${editId}`, dataToSubmit);
        setSuccess('Data berhasil diperbarui!');
      } else {
        await api.post('/statistics', dataToSubmit);
        setSuccess('Data berhasil ditambahkan!');
      }
      resetForm();
      setRefreshData(p => p + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      academicYearId: entry.academicYearId || '', programId: entry.programId || '', admissionPathId: entry.admissionPathId || '',
      totalApplicants: entry.totalApplicants || '', totalAccepted: entry.totalAccepted || '', maleAccepted: entry.maleAccepted || '',
      femaleAccepted: entry.femaleAccepted || '', kipApplicants: entry.kipApplicants || '', kipRecipients: entry.kipRecipients || '',
      registeredDocs: entry.registeredDocs || '', registeredPayment: entry.registeredPayment || ''
    });
    if (entry.Program?.Faculty) { setSelectedFacultyId(entry.Program.Faculty.id.toString()); }
    setIsEditMode(true); setEditId(entry.id); setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Anda yakin ingin menghapus data ini?')) {
      try {
        setLoading(true);
        await api.delete(`/statistics/${id}`);
        setRefreshData(p => p + 1);
        setSuccess('Data berhasil dihapus');
      } catch (err) { setError(err.response?.data?.message || 'Gagal menghapus data');
      } finally { setLoading(false); }
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Anda yakin ingin menghapus ${selectedEntries.length} data yang dipilih?`)) return;
    setIsBulkDeleting(true); setLoading(true);
    try {
      await Promise.all(selectedEntries.map(id => api.delete(`/statistics/${id}`)));
      setRefreshData(p => p + 1);
      setSuccess(`${selectedEntries.length} data berhasil dihapus`);
      setSelectedEntries([]);
    } catch (err) { setError(err.response?.data?.message || 'Gagal menghapus data massal');
    } finally { setLoading(false); setIsBulkDeleting(false); }
  };

  const handleSelectEntry = (id) => { setSelectedEntries(prev => prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]); };
  const handleSelectAll = () => { if (selectAll) { setSelectedEntries([]); } else { setSelectedEntries(entries.map(entry => entry.id)); } setSelectAll(!selectAll); };
  useEffect(() => { setSelectAll(entries.length > 0 && selectedEntries.length === entries.length); }, [selectedEntries, entries]);

  if (yearsLoading) return <div className="bg-slate-50 min-h-screen pt-16 flex items-center justify-center"><CustomSpinner /></div>;

  return (
    <div className="bg-slate-50 min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8 space-y-8">
            <h1 className="text-4xl font-bold text-slate-800">Admin Panel</h1>
            <YearModal isOpen={yearModalOpen} onClose={() => { setYearModalOpen(false); setError(null); setNewYear(''); setIsActive(false); }} onSubmit={handleCreateYear} loading={loading} error={error} newYear={newYear} setNewYear={setNewYear} isActive={isActive} setIsActive={setIsActive} clearError={() => setError(null)} />
            <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1 max-w-md">
                <button onClick={() => setActiveTab('add')} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-300 ${activeTab === 'add' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-sky-100/70'}`}>{isEditMode ? 'Edit Data' : 'Tambah Data'}</button>
                <button onClick={() => { setActiveTab('manage'); resetForm(); }} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-300 ${activeTab === 'manage' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-sky-100/70'}`}>Kelola Data</button>
            </div>
            {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
            {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
            
            {activeTab === 'add' && (
                <Section title={isEditMode ? 'Formulir Edit Data Statistik' : 'Formulir Tambah Data Statistik'}>
                     <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label htmlFor="academicYearId" className="block text-sm font-medium text-slate-700 mb-1">Tahun Akademik:</label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-grow">
                                        <select id="academicYearId" name="academicYearId" value={formData.academicYearId} onChange={handleChange} required className="appearance-none w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-8">
                                            <option value="">Pilih Tahun</option>
                                            {years.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setYearModalOpen(true)} className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none">{ICONS.add}</button>
                                </div>
                            </div>
                            <StyledSelect id="facultyId" name="facultyId" label="Fakultas:" value={selectedFacultyId} onChange={handleFacultyChange} required>
                                <option value="">Pilih Fakultas</option>
                                {faculties.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                            </StyledSelect>
                            <StyledSelect id="programId" name="programId" label="Program Studi:" value={formData.programId} onChange={handleChange} required disabled={!selectedFacultyId}>
                                <option value="">Pilih Program Studi</option>
                                {programs.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </StyledSelect>
                             <StyledSelect id="admissionPathId" name="admissionPathId" label="Jalur Masuk:" value={formData.admissionPathId} onChange={handleChange} required>
                                <option value="">Pilih Jalur Masuk</option>
                                {admissionPaths.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </StyledSelect>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-200">
                             <div>
                                <label htmlFor="totalApplicants" className="block text-sm font-medium text-slate-700 mb-1">Total Pendaftar Keseluruhan:</label>
                                <input type="number" id="totalApplicants" name="totalApplicants" value={formData.totalApplicants} onChange={handleChange} min="0" required className="block w-full md:w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                            </div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200"><h3 className="text-md font-semibold mb-4 text-slate-700">Data Mahasiswa Diterima</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormInput label="Total Diterima" type="number" id="totalAccepted" name="totalAccepted" value={formData.totalAccepted} onChange={handleChange} min="0" required /><FormInput label="Diterima Laki-laki" type="number" id="maleAccepted" name="maleAccepted" value={formData.maleAccepted} onChange={handleChange} min="0" required /><FormInput label="Diterima Perempuan" type="number" id="femaleAccepted" name="femaleAccepted" value={formData.femaleAccepted} onChange={handleChange} min="0" required /></div></div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200"><h3 className="text-md font-semibold mb-4 text-slate-700">Data KIP (Kartu Indonesia Pintar)</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Pendaftar KIP" type="number" id="kipApplicants" name="kipApplicants" value={formData.kipApplicants} onChange={handleChange} min="0" required /><FormInput label="Penerima KIP" type="number" id="kipRecipients" name="kipRecipients" value={formData.kipRecipients} onChange={handleChange} min="0" required /></div></div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200"><h3 className="text-md font-semibold mb-4 text-slate-700">Data Registrasi Ulang (dari yang Diterima)</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Registrasi Berkas" type="number" id="registeredDocs" name="registeredDocs" value={formData.registeredDocs} onChange={handleChange} min="0" required /><FormInput label="Registrasi UKT" type="number" id="registeredPayment" name="registeredPayment" value={formData.registeredPayment} onChange={handleChange} min="0" required /></div></div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                            {isEditMode && (<button type="button" onClick={resetForm} className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold text-sm">Batal Edit</button>)}
                            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-sky-400 font-semibold text-sm flex items-center gap-2">{loading ? <>{ICONS.spinner} Menyimpan...</> : (isEditMode ? 'Update Data' : 'Simpan Data')}</button>
                        </div>
                    </form>
                </Section>
            )}

            {activeTab === 'manage' && (
                <Section title="Kelola Data Statistik">
                    {loading ? <CustomSpinner /> : 
                    <>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-500">{selectedEntries.length} dari {entries.length} data dipilih.</p>
                        {selectedEntries.length > 0 && (
                            <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:outline-none disabled:bg-rose-400 flex items-center gap-2 text-sm font-semibold">
                                {isBulkDeleting ? <>{ICONS.spinner} Menghapus...</> : <>{ICONS.delete} Hapus ({selectedEntries.length})</>}
                            </button>
                        )}
                    </div>
                    {entries.length === 0 ? (
                        <div className="text-center py-12 text-slate-500"><p className="font-semibold">Belum ada data</p><p>Silakan tambahkan data pada tab 'Tambah Data'.</p></div>
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50"><tr><th className="p-4"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" /></th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tahun</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Program Studi</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jalur</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pendaftar</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Diterima</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aksi</th></tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {entries.map(entry => (
                                        <tr key={entry.id} className={selectedEntries.includes(entry.id) ? "bg-sky-50" : "hover:bg-slate-50"}>
                                            <td className="p-4"><input type="checkbox" checked={selectedEntries.includes(entry.id)} onChange={() => handleSelectEntry(entry.id)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{entry.AcademicYear?.year}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.Program?.name} <span className="text-slate-400">({entry.Program?.Faculty?.abbreviation})</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.AdmissionPath?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.totalApplicants}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.totalAccepted}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => handleEdit(entry)} className="text-slate-500 hover:text-sky-600 transition-colors" title="Edit">{ICONS.edit}</button>
                                                    <button onClick={() => handleDelete(entry.id)} disabled={loading} className="text-slate-500 hover:text-rose-600 disabled:text-slate-300 transition-colors" title="Hapus">{ICONS.delete}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </>
                }
                </Section>
            )}
        </div>
    </div>
  );
};

export default AdminPage;