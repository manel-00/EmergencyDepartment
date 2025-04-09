"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Room, RoomFormData } from '../types';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";


const API_URL = 'http://localhost:3000/room'; 

function AddRoom() {
  const [roomsByFloor, setRoomsByFloor] = useState<Record<number, Room[]>>({});
  const [formData, setFormData] = useState<RoomFormData>({
    number: '',
    type: '',
    floor: 0,
    ward: '0', 
    state: "Unavailable",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailedView, setIsDetailedView] = useState<boolean>(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/byfloor`);
      setRoomsByFloor(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "floor" || name === "state" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      
      // Reset form and show success message
      setFormData({ number: '', type: '', floor: 0, ward: '', state: '' });
      setEditingId(null);
      fetchRooms();
      
      // Set success message
      setSuccessMessage(editingId ? 'Room updated successfully!' : 'Room added successfully!');
      
      // Optionally, reset the success message after a few seconds
      setTimeout(() => setSuccessMessage(''), 1500);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error saving room:', error.response?.data || error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
};


  const handleEdit = (room: Room) => {
    setFormData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      ward: room.ward || "", 
      state: room.state,
    });
    setEditingId(room._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };
  const [successMessage, setSuccessMessage] = useState(""); 




  return (
    <div className="container mx-auto p-6">
      <Breadcrumb pageName="Hospital Rooms / New" />


{/* room form (main form) */}

<form onSubmit={handleSubmit} className="bg-transparent p-6 rounded-lg shadow-md mb-8">
  <div className="flex gap-4 items-center">
  {/* Buttons */}
  <button 
    type="submit"
    className="bg-[#008B8B] text-white font-bold uppercase px-4 py-2 shadow hover:bg-[#006A6A]"
  >
    {editingId ? 'Update Room' : 'Save Room'}
  </button>

  <a href="/rooms" className="bg-gray-700 text-white font-bold uppercase px-4 py-2 shadow hover:bg-gray-800">
    ALL ROOMS
  </a>

  {successMessage && (
  <div className="border border-green-400 bg-transparent rounded shadow-sm text-green-600 px-3 py-2 text-sm">
    {successMessage}
  </div>
)}

</div>


  {/* Divider */}
  <hr className="my-6 border-gray-300" />

  <div className="grid gap-6">
    
    {['number'].map((field) => (
      <div key={field}>
        <label className="block font-medium capitalize">{field}</label>
        <input
          type="text"
          name={field}
          value={formData[field as keyof RoomFormData] as string}
          onChange={handleChange}
          placeholder={field === 'number' ? "Enter the room's number" : ''}
          className="mt-1.5 block w-full rounded-md border border-gray-500 dark:border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
    ))}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Floor */}
      <div>
        <label className="block font-medium">Floor</label>
        <select
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          className="mt-1.5 block w-full rounded-md border border-gray-500 dark:border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">Select Floor</option>
          {[1, 2, 3, 4, 5, 6].map((floorNumber) => (
            <option key={floorNumber} value={floorNumber}>Floor {floorNumber}</option>
          ))}
        </select>
      </div>

      {/* Ward */}
      <div>
        <label className="block font-medium">Ward</label>
        <select
          name="ward"
          value={formData.ward}
          onChange={handleChange}
          className="mt-1.5 block w-full rounded-md border border-gray-500 dark:border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">Select Ward</option>
          {["Infectious Diseases Ward","Psych Ward", "Surgical Ward", "Cardiology Ward", "Neurology Ward"].map((wardoption) => (
            <option key={wardoption} value={wardoption}>{wardoption}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Type of Room */}
    <div>
      <label className="block font-medium">Room Type</label>
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="mt-1.5 block w-full rounded-md border border-gray-500 dark:border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        required
      >
        <option value="">Select Room Type</option>
        <option value="1">Single (1 Bed)</option>
        <option value="2">Double (2 Beds)</option>
        <option value="3">Triple (3 Beds)</option>
        <option value="4">Quadruple (4 Beds)</option>
        {/* Add more options as needed */}
      </select>
    </div>

   

    {/* Divider */}
    <hr className="my-6 border-gray-300" />
  </div>
</form>



               
              






    </div>
  );
}

export default AddRoom;
