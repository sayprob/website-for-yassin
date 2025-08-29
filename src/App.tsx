import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Settings, LogOut } from 'lucide-react';
import { DonationData } from './types';
import { loadDonationsFromFile, saveDonationsToFile } from './utils/fileManager';
import { AdminLogin } from './components/AdminLogin';

function App() {
  const [showYears, setShowYears] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [donations, setDonations] = useState<DonationData>({});
  const [showAddForm, setShowAddForm] = useState<{month: string} | null>(null);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAmount, setNewDonorAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Red number represents expenses or target amount
  const redNumber = 5000;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDonationsFromFile();
        setDonations(data);
        setShowYears(true);
        
        // Check if user is already logged in as admin
        const adminStatus = localStorage.getItem('isAdmin');
        setIsAdmin(adminStatus === 'true');
      } catch (error) {
        console.error('Failed to load donations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAdminLogin = (success: boolean) => {
    setIsAdmin(success);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  // Get available years from the donations data
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    Object.keys(donations).forEach(key => {
      const year = parseInt(key.split('-')[0]);
      if (!isNaN(year)) {
        yearsSet.add(year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
  };

  const handleAddDonation = async (month: string) => {
    if (newDonorName.trim() && newDonorAmount.trim() && selectedYear) {
      const monthKey = `${selectedYear}-${month}`;
      const amount = parseFloat(newDonorAmount);
      
      if (!isNaN(amount) && amount > 0) {
        setIsSaving(true);
        
        const updatedDonations = {
          ...donations,
          [monthKey]: [...(donations[monthKey] || []), { name: newDonorName.trim(), amount }]
        };
        
        try {
          await saveDonationsToFile(updatedDonations);
          setDonations(updatedDonations);
          setNewDonorName('');
          setNewDonorAmount('');
          setShowAddForm(null);
        } catch (error) {
          console.error('Failed to save donation:', error);
          alert('Failed to save donation. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleAddDonationOld = (month: string) => {
    if (newDonorName.trim() && newDonorAmount.trim() && selectedYear) {
      const monthKey = `${selectedYear}-${month}`;
      const amount = parseFloat(newDonorAmount);
      
      if (!isNaN(amount) && amount > 0) {
        setDonations(prev => {
          const updated = {
          ...prev,
          [monthKey]: [...(prev[monthKey] || []), { name: newDonorName.trim(), amount }]
          };
          
          // Save to localStorage immediately
          localStorage.setItem('donations', JSON.stringify(updated, null, 2));
          return updated;
        });
        setNewDonorName('');
        setNewDonorAmount('');
        setShowAddForm(null);
      }
    }
  };

  const getYearTotal = (year: number) => {
    let total = 0;
    months.forEach(month => {
      const monthKey = `${year}-${month}`;
      const monthDonations = donations[monthKey] || [];
      total += monthDonations.reduce((sum, donation) => sum + donation.amount, 0);
    });
    return total;
  };

  const getAllYearsTotal = () => {
    const years = getAvailableYears();
    return years.reduce((total, year) => total + getYearTotal(year), 0);
  };

  const getNetAmount = () => {
    return getAllYearsTotal() - redNumber;
  };

  const availableYears = getAvailableYears();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      {/* Admin Login Modal */}
      <AdminLogin 
        onLogin={handleAdminLogin}
        isVisible={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      {/* Admin Controls */}
      <div className="fixed top-4 right-4 z-40">
        {isAdmin ? (
          <button
            onClick={handleAdminLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout Admin
          </button>
        ) : (
          <button
            onClick={() => setShowAdminLogin(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
        )}
      </div>

      <div className="max-w-4xl w-full">
        {!showYears && !selectedYear ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-light text-slate-800 mb-4 tracking-tight">
                Welcome
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
                Donation tracking system with local database
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Left Button - Red */}
              <button className="group relative bg-white hover:bg-red-50 border-2 border-red-100 hover:border-red-200 rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-[200px] md:min-w-[240px]">
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-bold text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                    ${redNumber.toLocaleString()}
                  </div>
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </button>

              {/* Right Button - Green with Total */}
              <button 
                onClick={() => availableYears.length > 0 && setShowYears(true)}
                disabled={availableYears.length === 0}
                className={`group relative ${availableYears.length > 0 ? 'bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-200' : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'} rounded-2xl p-8 md:p-12 shadow-lg ${availableYears.length > 0 ? 'hover:shadow-xl' : ''} transition-all duration-300 ${availableYears.length > 0 ? 'transform hover:-translate-y-1' : ''} min-w-[200px] md:min-w-[240px]`}
              >
                <div className="text-center">
                  <div className={`text-4xl md:text-5xl font-bold ${availableYears.length > 0 ? 'text-green-500' : 'text-gray-400'} mb-4 ${availableYears.length > 0 ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                    ${getNetAmount().toLocaleString()}
                  </div>
                </div>
                {availableYears.length > 0 && (
                  <div className="absolute inset-0 bg-green-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </>
        ) : showYears && !selectedYear ? (
          <>
            {/* Years Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-light text-slate-800 mb-4 tracking-tight">
                Select a Year
              </h1>
              <button 
                onClick={() => setShowYears(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors duration-200 text-sm font-medium"
              >
                ← Back to main
              </button>
            </div>

            {/* Year Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center">
              {availableYears.map((year) => (
                <button 
                  key={year}
                  onClick={() => handleYearClick(year)}
                  className="group relative bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 group-hover:scale-105 transition-transform duration-300">
                      {year}
                    </div>
                    <div className="text-lg font-semibold text-green-500 group-hover:scale-110 transition-transform duration-300">
                      ${getYearTotal(year).toLocaleString()}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-green-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </>
        ) : selectedYear ? (
          <>
            {/* Donations Table Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-light text-slate-800 mb-2 tracking-tight">
                Donations for {selectedYear}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setSelectedYear(null)}
                  className="text-slate-500 hover:text-slate-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to years
                </button>
              </div>
            </div>

            {/* Donations Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {months.map(month => (
                        <th key={month} className="px-4 py-4 text-left text-sm font-semibold text-slate-700 min-w-[140px]">
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      {months.map(month => {
                        const monthKey = `${selectedYear}-${month}`;
                        const monthDonations = donations[monthKey] || [];
                        
                        return (
                          <td key={month} className="px-4 py-4 border-r border-slate-100 last:border-r-0">
                            <div className="space-y-2">
                              {monthDonations.map((donation, index) => (
                                <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                  <div className="text-sm font-medium text-slate-800 mb-1">
                                    {donation.name}
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    ${donation.amount}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Button */}
                              {isAdmin && showAddForm?.month === month ? (
                                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                                  <input
                                    type="text"
                                    placeholder="Donor name"
                                    value={newDonorName}
                                    onChange={(e) => setNewDonorName(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded px-2 py-1 mb-2 focus:outline-none focus:border-blue-500"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={newDonorAmount}
                                    onChange={(e) => setNewDonorAmount(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded px-2 py-1 mb-2 focus:outline-none focus:border-blue-500"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAddDonation(month)}
                                      disabled={isSaving}
                                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs py-1 px-2 rounded transition-colors duration-200"
                                    >
                                      {isSaving ? 'Saving...' : 'Add'}
                                    </button>
                                    <button
                                      onClick={() => setShowAddForm(null)}
                                      disabled={isSaving}
                                      className="flex-1 bg-slate-400 hover:bg-slate-500 text-white text-xs py-1 px-2 rounded transition-colors duration-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : isAdmin ? (
                                <button
                                  onClick={() => setShowAddForm({month})}
                                  className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-3 transition-all duration-200 group"
                                >
                                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mx-auto" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;