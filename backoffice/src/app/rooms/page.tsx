"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2,Waypoints } from "lucide-react";
import { SearchIcon } from "@/assets/icons";
import { Room, RoomFormData } from "./types";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { FileDown } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Corrected import



const API_URL = "http://localhost:3000/room"; 

// Reusable component for the export button
const ExportRoomsButton = () => {
  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:3000/room/export', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'rooms.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to download CSV. Please check the console.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      Export Rooms to CSV
    </button>
  );
};








function App() {
  const [rooms, setRooms] = useState<Room[]>([]); 
  const [totalRoomsCount, setTotalRoomsCount] = useState<number>(0); 
  const [totalBedsCount, setTotalBedsCount] = useState<number>(0); 
  const [freeBedsCount, setFreeBedsCount] = useState<number>(0);   
 

  const [formData, setFormData] = useState<RoomFormData>({
    number: "",
    type: "",
    floor: 0,
    state: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailedView, setIsDetailedView] = useState<boolean>(true); // State to toggle between views

  // List of predefined floors and wards
  const floors = [1, 2, 3, 4, 5, 6];
  const wards = ["Infectious Diseases Ward","Psych Ward", "Surgical Ward", "Cardiology Ward", "Neurology Ward"];



  // Search state for floor and ward
  const [query, setQuery] = useState({ floor: "", ward: "" });

  useEffect(() => {
    fetchRooms();
  }, [query]); // Run fetchRooms when query changes

  useEffect(() => {
    fetchAllRooms(); // Fetch all rooms when the component loads
    fetchTotalRoomsCount(); // Fetch the total rooms count on load
    fetchTotalBedsCount(); // Fetch total beds count on load
    fetchFreeBedsCount();   // Fetch free beds count on load

  }, []);

  const fetchRooms = async () => {
    try {
      // If floor or ward is empty, fetch all rooms
      const response = await axios.get(
        `${API_URL}/query?floor=${query.floor || ""}&ward=${query.ward || ""}`
      );
      setRooms(response.data); // Set the rooms data from the response
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchAllRooms = async () => {
    try {
      const response = await axios.get(API_URL); // Fetch rooms from the root URL
      setRooms(response.data); // Set the rooms data from the response
    } catch (error) {
      console.error("Error fetching all rooms:", error);
    }
  };

  const fetchTotalRoomsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/count`); // Assuming you have this backend route
      setTotalRoomsCount(response.data.totalRooms);
    } catch (error) {
      console.error("Error fetching total rooms count:", error);
    }
  };

  const fetchTotalBedsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/countbeds`); // Using /room/countbeds
      setTotalBedsCount(response.data.totalBeds); // Assuming the backend returns the count directly or in an object
    } catch (error) {
      console.error("Error fetching total beds count:", error);
    }
  };

  const fetchFreeBedsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/countbeds/free`); // Using /room/countbeds/free
      setFreeBedsCount(response.data.freeBeds); // Assuming the backend returns the count directly or in an object
    } catch (error) {
      console.error("Error fetching free beds count:", error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ number: "", type: "", floor: 0, state: 0 });
      setEditingId(null);
      fetchRooms(); // Refresh rooms after submit
      fetchAllRooms(); // Refresh all rooms after submit
      fetchTotalRoomsCount(); // Refresh count after submit
      fetchTotalBedsCount(); // Refresh beds count after submit
      fetchFreeBedsCount();   // Refresh free beds count after submit

    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleEdit = (room: Room) => {
    setFormData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      state: room.state,
    });
    setEditingId(room._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRooms(); // Refresh rooms after delete
      fetchAllRooms(); // Refresh all rooms after delete
      fetchTotalRoomsCount(); // Refresh count after delete
      fetchTotalBedsCount(); // Refresh beds count after delete
      fetchFreeBedsCount();   // Refresh free beds count after delete

    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const toggleView = () => {
    setIsDetailedView((prev) => !prev); // Toggle between detailed and simple view
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuery((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  
  return (
    <div >
   <Breadcrumb pageName="Hospital Rooms List" />


 {/* Stats Cards and Search */}
<div className="grid grid-cols-7 gap-2 mb-6">
<div className="bg-[#00A09D] text-white p-4">
          <div className="text-3xl font-bold">{totalRoomsCount}</div> {/* Display the totalRoomsCount */}
          <div className="text-sm">Total Rooms</div>
        </div>
  <div className="bg-[#00A09D] text-white p-4">
    <div className="text-4xl font-bold">{totalBedsCount}</div>
    <div className="text-sm">Total Beds</div>
  </div>
  <div className="bg-[#00A09D] text-white p-4">
    <div className="text-3xl font-bold">{freeBedsCount}</div>
    <div className="text-sm">Free Beds</div>
  </div>

  {/* Search Form */}
  <div className="col-span-4 rounded p-4 shadow">
    <div className="space-y-3">
      <div className="relative">
        <div  className="text-xl font-semibold mb-4"> Search Rooms By :</div>
        
      </div>

      <div className="flex gap-3">
        {/* Floor Filter */}
        <select
          name="floor"
          value={query.floor}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">Filter by floor</option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              Floor N {floor}
            </option>
          ))}
        </select>

        {/* Ward Filter */}
        <select
          name="ward"
          value={query.ward}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">Filter by ward</option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
</div>
<Link href="/rooms/addroom">
<button className="bg-[#008B8B] text-white font-bold uppercase px-4 py-2  shadow hover:bg-[#006A6A]">
Add Room
      </button>
</Link>


<div className="flex justify-end mb-4">
  <ExportRoomsButton />
</div>


       {/* Table for All Rooms */}
<div className="overflow-x-auto  rounded-lg shadow-md mb-6">
  <h3 className="text-xl font-semibold mb-4">All Rooms</h3>
  {rooms.length === 0 ? (
    <p>No rooms available in the database.</p>
  ) : (
    <table className="min-w-full table-auto border-collapse text-left">
      <thead className="bg-gray-800 text-white">
        <tr>
        <th className="px-3 py-3 text-xs font-large">ID</th>
          <th className="px-6 py-4 text-m font-large">Room Number</th>


          <th className="px-6 py-3 text-xs font-medium">Capacity</th>
          <th className="px-6 py-3 text-xs font-medium">Floor</th>
          <th className="px-6 py-3 text-xs font-medium">Ward</th>
          <th className="px-6 py-3 text-xs font-medium">State</th>
          <th className="px-6 py-3 text-xs font-medium">Actions</th>
          <th className="px-6 py-3 text-xs font-medium">Actions</th>
         


        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr 
          key={room._id}
          className={`
    even:bg-gray-300 odd:bg-white text-gray-900
    dark:even:bg-gray-800 dark:odd:bg-transparent dark:text-white


          `}
        >
        <td className="px-6 py-4 text-sm">{room._id}</td>

            <td className="px-3 py-4 text-sm"> Room {room.number} </td>


            <td className="px-6 py-4 text-sm">{room.type} </td>
            <td className="px-6 py-4 text-sm">{room.floor}</td>
            <td className="px-6 py-4 text-sm">{room.ward}</td>
            <td className="px-6 py-4 text-sm">{room.state}</td>
            <td className="px-6 py-4 text-sm">
              <button
                onClick={() => handleEdit(room)}
                className="text-blue-500 hover:text-blue-700 mr-4"
              >
               
              </button>
              <button
                onClick={() => handleDelete(room._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />

              </button>
            </td>
            <td className="px-6 py-4 font-medium text-primary ">
            <Link href={`/rooms/${room._id}`}>
              view details
            </Link>


            </td>


        

            

          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>





    
      

      </div>

  );
}

export default App;