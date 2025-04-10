import { useState } from 'react';
import { Search, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const MedicationSearch = () => {
  const [brandName, setBrandName] = useState('');
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    indications: false,
    warnings: false,
    dosage: false,
    ingredients: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const searchMedication = async () => {
    if (!brandName.trim()) return;
    
    setLoading(true);
    setError(null);
    setMedication(null);
    
    try {
      const response = await fetch(`http://localhost:3000/document/medicine?brand_name=${encodeURIComponent(brandName)}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? 'No medication found with this brand name' 
          : 'Failed to fetch medication data');
      }
      
      const data = await response.json();
      setMedication(data.results[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setMedication(null);
    setBrandName('');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Medication Information Lookup</h1>
        
        <div className="flex items-center mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter medication brand name..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && searchMedication()}
            />
            {brandName && (
              <button 
                onClick={clearResults}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={searchMedication}
            disabled={loading || !brandName.trim()}
            className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 flex items-center"
          >
            <Search size={18} className="mr-1" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {medication && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {medication.openfda?.brand_name?.[0] || 'Unknown Brand'}
              </h2>
              <p className="text-gray-600">
                {medication.openfda?.generic_name?.[0] || 'Generic name not available'}
              </p>
            </div>

            {/* Information Section */}
            <div className="space-y-3">
              {/* Indications Section */}
              <div className="border border-gray-200 rounded bg-white">
                <button 
                  onClick={() => toggleSection('indications')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">Uses & Indications</span>
                  {expandedSections.indications ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedSections.indications && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {medication.indications_and_usage?.[0] || 'No information available'}
                    </p>
                  </div>
                )}
              </div>

              {/* Warnings Section */}
              <div className="border border-gray-200 rounded bg-white">
                <button 
                  onClick={() => toggleSection('warnings')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">Warnings & Precautions</span>
                  {expandedSections.warnings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedSections.warnings && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {medication.warnings?.[0] || 'No warnings available'}
                    </p>
                  </div>
                )}
              </div>

              {/* Dosage Section */}
              <div className="border border-gray-200 rounded bg-white">
                <button 
                  onClick={() => toggleSection('dosage')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">Dosage & Administration</span>
                  {expandedSections.dosage ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedSections.dosage && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {medication.dosage_and_administration?.[0] || 'No dosage information available'}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Ingredients Section */}
              <div className="border border-gray-200 rounded bg-white">
                <button 
                  onClick={() => toggleSection('ingredients')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">Active Ingredients</span>
                  {expandedSections.ingredients ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedSections.ingredients && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {medication.active_ingredient?.[0] || 'No ingredient information available'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationSearch;