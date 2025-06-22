import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuth, user, loading } = useContext(AuthContext);

  // If auth status is still loading, show loading indicator
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // If role restrictions are specified and user doesn't have the required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
