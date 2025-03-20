import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <header className="app-header mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">Trua Verify</h1>
        <p className="text-gray-600 dark:text-gray-300">Employment History Verification System</p>
      </header>
      <main className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <p className="mb-4">Welcome to Trua Verify. This is a placeholder for the main application.</p>
        <p className="text-gray-600 dark:text-gray-400">The actual components are located in the src/components directory.</p>
      </main>
    </div>
  );
};

export default App;