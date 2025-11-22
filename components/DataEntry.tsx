import React, { useState } from 'react';
import { Category, Status, DataRecord } from '../types';
import { parseUnstructuredText } from '../services/geminiService';
import { Wand2, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface DataEntryProps {
  onAddRecord: (record: DataRecord) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ onAddRecord }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DataRecord>>({
    productName: '',
    category: Category.OTHER,
    quantity: 0,
    price: 0,
    status: Status.IN_STOCK,
    notes: '',
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName) {
      showNotification('error', 'Product name is required');
      return;
    }

    const newRecord: DataRecord = {
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString().split('T')[0],
      ...formData as DataRecord
    };

    onAddRecord(newRecord);
    showNotification('success', 'Record added successfully');
    setFormData({
      productName: '',
      category: Category.OTHER,
      quantity: 0,
      price: 0,
      status: Status.IN_STOCK,
      notes: '',
    });
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsLoading(true);
    try {
      const results = await parseUnstructuredText(aiInput);
      
      if (results.length === 0) {
        showNotification('error', 'Could not extract data. Try being more specific.');
      } else {
        results.forEach(rec => {
           const completeRecord: DataRecord = {
            id: crypto.randomUUID(),
            dateAdded: new Date().toISOString().split('T')[0],
            productName: rec.productName || 'Unknown Product',
            category: (rec.category as Category) || Category.OTHER,
            quantity: rec.quantity || 0,
            price: rec.price || 0,
            status: (rec.status as Status) || Status.IN_STOCK,
            notes: rec.notes || 'Imported via AI'
           };
           onAddRecord(completeRecord);
        });
        showNotification('success', `${results.length} record(s) processed by Gemini AI!`);
        setAiInput('');
      }
    } catch (err) {
      showNotification('error', 'AI Service Error. Check API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-slate-200 rounded-xl">
        <button
          onClick={() => setMode('manual')}
          className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all duration-200
            ${mode === 'manual' 
              ? 'bg-white text-indigo-700 shadow'
              : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-800'
            }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200
            ${mode === 'ai' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-800'
            }`}
        >
          <Wand2 className="w-4 h-4" />
          AI Magic Paste
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                placeholder="e.g. Office Chair Ergonomic"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                >
                  {Object.values(Status).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Unit ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Record
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
            <h3 className="text-indigo-900 font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5" /> How it works
            </h3>
            <p className="text-indigo-700 text-sm mt-1">
              Paste emails, chat logs, or messy lists. Gemini will extract the product details automatically.
              <br/>
              <span className="italic opacity-75">Try: "Received 50 units of Dell XPS 13 Laptops at $1200 each today. Also put 10 Herman Miller chairs in stock for $800 each."</span>
            </p>
          </div>

          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Paste your unstructured text here..."
            rows={8}
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border resize-none bg-slate-50"
          />

          <div className="flex justify-end pt-4">
            <button
              onClick={handleAiParse}
              disabled={isLoading || !aiInput.trim()}
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing with Gemini...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Process Magic Paste
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};