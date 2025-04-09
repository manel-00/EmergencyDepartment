"use client";


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Room, RoomFormData } from './types';

const API_URL = 'http://localhost:3000/room'; // Adjust this to match your backend URL

function App() {
  const [roomsByFloor, setRoomsByFloor] = useState<any>({});
  const [formData, setFormData] = useState<RoomFormData>({
    number: '',
    type: '',
    floor: 0,
    state: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailedView, setIsDetailedView] = useState<boolean>(true); // State to toggle between views

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/byfloor`); // Make the call to the 'byfloor' route
      setRoomsByFloor(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
      setFormData({ number: '', type: '', floor: 0, state: 0 });
      setEditingId(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
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
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const toggleView = () => {
    setIsDetailedView((prev) => !prev); // Toggle between detailed and simple view
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Room Management</h1>

       

        {/* Toggle Button */}
        <div className="mb-4">
          <button
            onClick={toggleView}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span className="mr-2">{isDetailedView ? '<' : '>'}</span>
            <span>{isDetailedView ? 'Show Only Numbers' : 'Show Details'}</span>
          </button>
        </div>

        {/* Room List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {Object.keys(roomsByFloor).map((floor) => (
            <div key={floor}>
              <h5 >Floor number: {floor}</h5>
              <h5 >ward: psych ward</h5>


              <div className="grid grid-cols-4 gap-4 mb-6">
                {roomsByFloor[floor].map((room) => (
                  <div key={room._id} className="flex items-center justify-center">
                    {/* Room Icon */}
                    <div className="bg-blue-500 text-white p-4 rounded-full text-sm font-medium">
                      <span>{room.number}</span>
                    </div>

                    {isDetailedView && (
                      <div className="ml-4">
                        <div className="text-sm text-gray-900">{room.type}</div>
                        <div className="text-xs text-gray-500">State: {room.state}</div>
                      </div>
                    )}

                    {isDetailedView && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>


         {/* Form */}
<form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
  <div className="grid grid-cols-1 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700">Room Number</label>
      <input
        type="text"
        value={formData.number}
        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Room Type</label>
      <input
        type="text"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Floor</label>
      <select
        value={formData.floor}
        onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      >
        <option value="">Select Floor</option>
        {[1, 2, 3, 4, 5, 6].map((floorNumber) => (
          <option key={floorNumber} value={floorNumber}>
            Floor N {floorNumber}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">State</label>
      <input
        type="number"
        value={formData.state}
        onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>
    <button
      type="submit"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Plus className="h-4 w-4 mr-2" />
      {editingId ? 'Update Room' : 'Add Room'}
    </button>
  </div>
</form>

      </div>
    </div>
  );
}

export default App;
