import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { StatisticsProvider } from './context/StatisticsContext';

// Layout Components
import Navbar from './components/layout/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StatisticsPage from './pages/StatisticsPage';
import ComparisonPage from './pages/ComparisonPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <StatisticsProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <main className="py-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/comparison" element={<ComparisonPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </Router>
      </StatisticsProvider>
    </AuthProvider>
  );
}

export default App;

