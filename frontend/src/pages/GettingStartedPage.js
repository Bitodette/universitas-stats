import React from 'react';
import { Link } from 'react-router-dom';

const GettingStartedPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Getting Started Guide for Administrators
          </h1>
        </div>
        
        <div className="px-6 py-4">
          <div className="prose dark:prose-invert max-w-none">
            <h2>Welcome to Universitas Stats Admin Panel</h2>
            <p>
              This guide will help you understand how to use the administrator panel to manage statistical data for university admissions.
            </p>
            
            <h3>1. Managing Academic Years</h3>
            <p>
              Academic years are the foundation of your statistical data. Each statistical entry belongs to a specific academic year.
            </p>
            <ul>
              <li>To add a new academic year, go to the Admin Panel and use the "+ Add Year" button</li>
              <li>Only one academic year can be active at a time. The active year is shown by default in statistics views.</li>
              <li>You cannot delete an academic year that contains statistical data.</li>
            </ul>
            
            <h3>2. Adding Statistical Data</h3>
            <p>
              Statistical data can be added through the Admin Panel's "Add Data" tab.
            </p>
            <p>
              When adding new data, keep in mind:
            </p>
            <ul>
              <li>Total applicants must equal the sum of male and female applicants</li>
              <li>Total accepted must equal the sum of male and female accepted</li>
              <li>KIP recipients cannot exceed KIP applicants</li>
              <li>Total accepted cannot exceed total applicants</li>
            </ul>
            
            <h3>3. Managing Existing Data</h3>
            <p>
              You can manage existing data through the "Manage Data" tab in the Admin Panel.
            </p>
            <ul>
              <li>Edit: Allows you to modify all fields of an existing entry</li>
              <li>Delete: Permanently removes the entry (requires admin role)</li>
            </ul>
            <p>
              <strong>Note:</strong> All changes you make are logged in the audit log for accountability.
            </p>
            
            <h3>4. Understanding User Roles</h3>
            <p>
              The system has three user roles with different permissions:
            </p>
            <ul>
              <li><strong>Admin:</strong> Full access to all features, including user management and data deletion</li>
              <li><strong>Editor:</strong> Can add and edit statistical data, but cannot delete data or manage users</li>
              <li><strong>Viewer:</strong> Read-only access to all statistics</li>
            </ul>
            
            <h3>5. Advanced Features</h3>
            <ul>
              <li><strong>Real-time updates:</strong> Changes made by other administrators appear in real-time</li>
              <li><strong>Dark mode:</strong> Toggle between light and dark mode using the button in the navbar</li>
              <li><strong>Interactive charts:</strong> Click on chart elements to drill down into more detailed data</li>
            </ul>
            
            <h3>Need Help?</h3>
            <p>
              If you need additional assistance, please contact the system administrator at <a href="mailto:admin@example.com">admin@example.com</a>.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <Link to="/admin" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
            Go to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage;
