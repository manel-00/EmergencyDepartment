"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2,Waypoints } from "lucide-react";
import { SearchIcon } from "@/assets/icons";
import { Room, RoomFormData } from "./types";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";



const API_URL = "http://localhost:3000/room"; // Adjust this to match your backend URL








function App() {
  const [rooms, setRooms] = useState<Room[]>([]); // Store the room data here
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
  const wards = ["Psych Ward", "Surgical Ward", "Emergency Ward"];

  // Search state for floor and ward
  const [query, setQuery] = useState({ floor: "", ward: "" });

  useEffect(() => {
    fetchRooms();
  }, [query]); // Run fetchRooms when query changes

  useEffect(() => {
    fetchAllRooms(); // Fetch all rooms when the component loads
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
    <div className="text-3xl font-bold">16</div>
    <div className="text-sm">Total Rooms</div>
  </div>
  <div className="bg-[#00A09D] text-white p-4">
    <div className="text-3xl font-bold">20</div>
    <div className="text-sm">Total Beds</div>
  </div>
  <div className="bg-[#00A09D] text-white p-4">
    <div className="text-3xl font-bold">18</div>
    <div className="text-sm">Free Beds</div>
  </div>

  {/* Search Form */}
  <div className="col-span-4 rounded p-4 shadow">
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="  Search by vendor name..."
          className=" bg-transparent w-full pl-10 pr-4 py-2 border border-gray-300  rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        
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

{/* Search Form */}
<div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Search Rooms By :</h3>
          <div className="flex space-x-4">
            <div>
              <select
                name="floor"
                value={query.floor}
                onChange={handleSearchChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value=""> Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    Floor N {floor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="ward"
                value={query.ward}
                onChange={handleSearchChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
          <th className="px-6 py-4 text-m font-large">Room Number</th>
          <th className="px-3 py-3 text-xs font-large">ID</th>

          <th className="px-6 py-3 text-xs font-medium">Capacity</th>
          <th className="px-6 py-3 text-xs font-medium">Floor</th>
          <th className="px-6 py-3 text-xs font-medium">Ward</th>
          <th className="px-6 py-3 text-xs font-medium">State</th>
          <th className="px-6 py-3 text-xs font-medium">Actions</th>
          <th className="px-6 py-3 text-xs font-medium">Actions</th>
          <th className="px-6 py-3 text-xs font-medium">
          <Waypoints className="h-5 w-5" />

          </th>


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
        
            <td className="px-3 py-4 text-sm"> Room {room.number} (0)</td>
            <td className="px-6 py-4 text-sm">{room._id}</td>

            <td className="px-6 py-4 text-sm">{room.type} </td>
            <td className="px-6 py-4 text-sm">{room.floor}</td>
            <td className="px-6 py-4 text-sm">{room.ward}</td>
            <td className="px-6 py-4 text-sm">{room.state}</td>
            <td className="px-6 py-4 text-sm">
              <button
                onClick={() => handleEdit(room)}
                className="text-blue-500 hover:text-blue-700 mr-4"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(room._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />

              </button>
            </td>
            <td className="px-6 py-4 text-sm">assign patient</td>
            <td className="px-6 py-4 text-sm">
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





    
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Room Management</h1>

        

      

        

        {/* Toggle Button */}
        <div className="mb-4">
          <button
            onClick={toggleView}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span className="mr-2">{isDetailedView ? "<" : ">"}</span>
            <span>{isDetailedView ? "Show Only Numbers" : "Show Details"}</span>
          </button>
        </div>







        {/* Room List (Filtered by query) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {rooms.length === 0 ? (
            <p>No rooms found for the selected query.</p>
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="mb-4 p-4 border-b">
                <h5>Room Number: {room.number}</h5>
                <h6>Ward: {room.ward}</h6>
                {isDetailedView && (
                  <>
                    <p>Type: {room.type}</p>
                    <p>State: {room.state}</p>
                  </>
                )}
                <div>
                  {isDetailedView && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        </div>

      </div>

  );
}

export default App;
