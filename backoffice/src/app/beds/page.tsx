"use client";

import React, { useEffect, useState } from "react";
import withAuth from '../hoc/withAuth';


// Define Bed type
interface Bed {
  _id: string;
  number: string;
  state: "available" | "occupied" | "maintenance";
  free: boolean;
  room: { _id: string, number: string } | null; // Room can be null
  patient?: { _id: string, name: string, lastname: string } | null; // Patient can be null
}

const BedManagement = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all beds
  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/room/getallbeds");
      if (!response.ok) throw new Error("Failed to fetch beds");

      const data = await response.json();
      setBeds(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete bed
  const deleteBed = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/room/beds/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBeds((prevBeds) => prevBeds.filter((bed) => bed._id !== id)); // Remove bed from state
      } else {
        console.error("Failed to delete bed");
      }
    } catch (error) {
      console.error("Error deleting bed:", error);
    }
  };

  // Fetch beds on mount
  useEffect(() => {
    fetchBeds();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  // Function to get state color
  const getStateColor = (state: "available" | "occupied" | "maintenance") => {
    switch (state) {
      case "available":
        return "bg-green-500 text-white"; // Green for available
      case "occupied":
        return "bg-yellow-500 text-white"; // Yellow for occupied
      default:
        return "bg-gray-500 text-white"; // Default for maintenance
    }
  };

 

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Updated to 3 columns */}
        {beds.map((bed) => (
          <div
            key={bed._id}
            className="bg-white rounded-lg shadow-lg border-2 border-gray-300 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Bed Number: {bed.number}</h3>
                <p className="text-sm text-gray-500">Room ID: {bed.room ? bed.room._id : "No Room"}</p>
                <p className="text-sm text-gray-500">Room Number: {bed.room ? bed.room.number : "No Room"}</p>

              </div>
              <div className="text-right">
              </div>
            </div>
            <div className="flex justify-between items-center">
              {bed.patient ? (
                <div className="flex items-center text-green-600 text-sm">
                  <span>Patient : {bed.patient.name} {bed.patient.lastname} </span>

                </div>
                
                
              ) : (
                <div className="flex items-center text-gray-600 text-sm">
                  <span>No Patient</span>
                </div>
              )}
              <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStateColor(bed.state)}`}>
                {bed.state}
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => deleteBed(bed._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedManagement;
