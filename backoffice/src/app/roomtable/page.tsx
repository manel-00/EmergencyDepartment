"use client";

import React from "react";


const RoomTable = () => {
  const DashboardPanel = () => {
    const data = [
      { label: "Occupied Rooms", value: 7, color: "bg-[#00A09D]" }, // Critical
      { label: "Available Rooms", value: 3, color: "bg-[#00A09D]" }, // Safe
      { label: "Patients Admitted Today", value: 5, color: "bg-[#00A09D]" }, // Medical
      { label: "Pending Cleaning Requests", value: 1, color: "bg-[#00A09D]" }, // Attention
    ];
  
    return (
      <div className="grid grid-cols-4 gap-6 p-6 bg-gray-100 rounded-lg shadow-lg mx-auto mb-6">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-4 text-white text-center border-none ${item.color} flex flex-col items-center justify-center`}
            style={{ height: "120px", width: "100%" }} // Reduced height
          >
            <p className="text-lg font-semibold mb-1">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Rooms & Bed Information</h2>

      {/* Dashboard Panel */}
<DashboardPanel />
      
      {/* Ward and Floor Selectors */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <select
            className="block w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Ward</option>
            <option value="Psych Ward">Psych Ward</option>
            <option value="Surgical Ward">Surgical Ward</option>
            <option value="Emergency Ward">Emergency Ward</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            className="block w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Floor</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
        </div>
      </div>

      {/* Static Bed Info Table */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Bed Information</h3>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="px-4 py-3 text-gray-600">Bed Number</th>
              <th className="px-4 py-3 text-gray-600">Room Number</th>
              <th className="px-4 py-3 text-gray-600">Ward</th>
              <th className="px-4 py-3 text-gray-600">State</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 border-b">
              <td className="px-4 py-3">B1</td>
              <td className="px-4 py-3">101</td>
              <td className="px-4 py-3">Psych Ward</td>
              <td className="px-4 py-3">Occupied</td>
            </tr>
            <tr className="bg-white border-b">
              <td className="px-4 py-3">B2</td>
              <td className="px-4 py-3">101</td>
              <td className="px-4 py-3">Psych Ward</td>
              <td className="px-4 py-3">Available</td>
            </tr>
            <tr className="bg-gray-50 border-b">
              <td className="px-4 py-3">B3</td>
              <td className="px-4 py-3">102</td>
              <td className="px-4 py-3">Surgical Ward</td>
              <td className="px-4 py-3">Occupied</td>
            </tr>
            <tr className="bg-white border-b">
              <td className="px-4 py-3">B4</td>
              <td className="px-4 py-3">102</td>
              <td className="px-4 py-3">Surgical Ward</td>
              <td className="px-4 py-3">Available</td>
            </tr>
            <tr className="bg-gray-50 border-b">
              <td className="px-4 py-3">B5</td>
              <td className="px-4 py-3">103</td>
              <td className="px-4 py-3">Emergency Ward</td>
              <td className="px-4 py-3">Occupied</td>
            </tr>
            <tr className="bg-white border-b">
              <td className="px-4 py-3">B6</td>
              <td className="px-4 py-3">103</td>
              <td className="px-4 py-3">Emergency Ward</td>
              <td className="px-4 py-3">Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
