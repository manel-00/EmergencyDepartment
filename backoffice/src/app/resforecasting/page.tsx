"use client";

import { useState } from 'react';
import axios from 'axios';

const ResForecasting = () => {
  // State variables for inputs and graph image
  const [currentStock, setCurrentStock] = useState('');
  const [usagePerHour, setUsagePerHour] = useState('');
  const [incomingSupply, setIncomingSupply] = useState('');
  const [supplyArrivalTime, setSupplyArrivalTime] = useState('');
  const [forecastDuration, setForecastDuration] = useState('');
  const [graphData, setGraphData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'currentStock') setCurrentStock(value);
    if (name === 'usagePerHour') setUsagePerHour(value);
    if (name === 'incomingSupply') setIncomingSupply(value);
    if (name === 'supplyArrivalTime') setSupplyArrivalTime(value);
    if (name === 'forecastDuration') setForecastDuration(value);
  };

  // Submit handler for fetching the graph
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/resourceforecast', {
        current_stock: parseInt(currentStock),
        usage_per_hour: parseInt(usagePerHour),
        incoming_supply: parseInt(incomingSupply),
        supply_arrival_time: parseInt(supplyArrivalTime),
        forecast_duration: parseInt(forecastDuration),
      });

      setGraphData(response.data.graph_base64);
    } catch (error) {
      setError('Failed to fetch the graph');
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
  <h1 className="text-3xl font-semibold text-black mb-6">IV Fluids Demand Prediction</h1>
  <form onSubmit={handleSubmit} className="flex flex-wrap space-x-4">
    <div className="flex-1">
      <label
        htmlFor="currentStock"
        className="block text-lg font-medium text-black mb-2"
      >
        Current Stock:
      </label>
      <input
        type="number"
        id="currentStock"
        name="currentStock"
        value={currentStock}
        onChange={handleChange}
        required
        className="w-full p-3 text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
    <div className="flex-1">
      <label
        htmlFor="usagePerHour"
        className="block text-lg font-medium text-black mb-2"
      >
        Usage Per Hour:
      </label>
      <input
        type="number"
        id="usagePerHour"
        name="usagePerHour"
        value={usagePerHour}
        onChange={handleChange}
        required
        className="w-full p-3 text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
    <div className="flex-1">
      <label
        htmlFor="incomingSupply"
        className="block text-lg font-medium text-black mb-2"
      >
        Incoming Supply:
      </label>
      <input
        type="number"
        id="incomingSupply"
        name="incomingSupply"
        value={incomingSupply}
        onChange={handleChange}
        required
        className="w-full p-3 text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
    <div className="flex-1">
      <label
        htmlFor="supplyArrivalTime"
        className="block text-lg font-medium text-black mb-2"
      >
        Supply Arrival Time:
      </label>
      <input
        type="number"
        id="supplyArrivalTime"
        name="supplyArrivalTime"
        value={supplyArrivalTime}
        onChange={handleChange}
        required
        className="w-full p-3 text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
    <div className="flex-1">
      <label
        htmlFor="forecastDuration"
        className="block text-lg font-medium text-black mb-2"
      >
        Forecast Duration (in hours):
      </label>
      <input
        type="number"
        id="forecastDuration"
        name="forecastDuration"
        value={forecastDuration}
        onChange={handleChange}
        required
        className="w-full p-3 text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
    <div className="w-full mt-4 flex justify-center">
      <button
        type="submit"
        disabled={loading}
        className="p-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {loading ? 'Loading...' : 'Generate Forecast'}
      </button>
    </div>
  </form>

  {error && <p className="text-red-600 mt-4">{error}</p>}

  {graphData && (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-black">Forecasting Graph</h2>
      <img
        src={`data:image/png;base64,${graphData}`}
        alt="Forecasting Graph"
        className="mt-4 max-w-full h-auto rounded-md shadow-md"
      />
    </div>
  )}
</div>

  
  );
};


export default ResForecasting;
