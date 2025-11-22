import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DataEntry } from './components/DataEntry';
import { RecordList } from './components/RecordList';
import { DataRecord, ViewState, Category, Status } from './types';

// Dummy Initial Data
const INITIAL_DATA: DataRecord[] = [
  { id: '1', productName: 'Ergonomic Chair', category: Category.FURNITURE, quantity: 45, price: 250.00, dateAdded: '2023-10-01', status: Status.IN_STOCK, notes: 'Black mesh' },
  { id: '2', productName: 'Wireless Mouse', category: Category.ELECTRONICS, quantity: 8, price: 29.99, dateAdded: '2023-10-02', status: Status.LOW_STOCK, notes: 'Logitech' },
  { id: '3', productName: 'Standing Desk', category: Category.FURNITURE, quantity: 12, price: 450.00, dateAdded: '2023-10-03', status: Status.IN_STOCK },
  { id: '4', productName: 'Monitor 27"', category: Category.ELECTRONICS, quantity: 0, price: 300.00, dateAdded: '2023-10-05', status: Status.OUT_OF_STOCK },
  { id: '5', productName: 'Printer Paper (Box)', category: Category.OFFICE, quantity: 100, price: 45.00, dateAdded: '2023-10-06', status: Status.IN_STOCK },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [records, setRecords] = useState<DataRecord[]>(() => {
    const saved = localStorage.getItem('nexdata_records');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('nexdata_records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (record: DataRecord) => {
    setRecords(prev => [record, ...prev]);
    // Optional: switch view to list or dashboard after add?
    // setView('list'); 
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentView={view} onChangeView={setView} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {view === 'dashboard' && 'Dashboard Overview'}
            {view === 'entry' && 'Data Entry'}
            {view === 'list' && 'Inventory Records'}
          </h1>
          <p className="text-slate-500 mt-1">
            {view === 'dashboard' && 'Real-time insights into your inventory and assets.'}
            {view === 'entry' && 'Add new items manually or use AI to parse text.'}
            {view === 'list' && 'Manage, filter, and sort your complete dataset.'}
          </p>
        </div>

        {/* View Content */}
        <div className="transition-opacity duration-300 ease-in-out">
          {view === 'dashboard' && <Dashboard data={records} />}
          
          {view === 'entry' && (
            <DataEntry onAddRecord={handleAddRecord} />
          )}
          
          {view === 'list' && (
            <RecordList data={records} onDelete={handleDeleteRecord} />
          )}
        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} NexData. Powered by Gemini 2.5 Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;