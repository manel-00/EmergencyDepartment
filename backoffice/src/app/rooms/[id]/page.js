"use client";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; 

export default function RoomDetails() {
  const { id } = useParams(); 
  
  const [room, setRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [number, setNumber] = useState('');
  const [state, setState] = useState('available');
  const [patient, setPatient] = useState('');

  useEffect(() => {
    const fetchRoomAndBeds = async () => {
      try {
        // Fetch room details
        const roomRes = await fetch(`http://localhost:3000/room/${id}`);
        if (!roomRes.ok) throw new Error("Error fetching room details.");
        const roomData = await roomRes.json();
        setRoom(roomData);
        
        // Fetch beds (don't break the component if this fails)
        const bedsRes = await fetch(`http://localhost:3000/room/${id}/beds`);
        if (bedsRes.ok) {
          const bedsData = await bedsRes.json();
          setBeds(bedsData);
        } else {
          console.warn("Failed to fetch beds, continuing...");
        }
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchRoomAndBeds();
  }, [id]);
  

  const handleAddBed = async (e) => {
    e.preventDefault();
    const newBedData = { number, state, room: id, patient };

    try {
      const res = await fetch(`http://localhost:3000/room/${id}/create-bed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBedData),
      });

      if (res.ok) {
        const newBed = await res.json();
        setBeds([...beds, newBed]); 
        setShowPopup(false);
        setNumber('');
        setState('available');
        setPatient('');
      } else {
        console.error('Failed to add new bed:', await res.text());
      }
    } catch (error) {
      console.error('Error creating bed:', error);
    }
  };

  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!room) return <div className="text-center text-gray-500 mt-10">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 border p-5 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800">Room {room.number}</h1>
      <p className="mt-2"><strong>Type:</strong> {room.type}</p>
      <p><strong>Floor:</strong> {room.floor}</p>
      <p><strong>State:</strong> {room.state}</p>

      <h2 className="text-xl font-bold mt-6">Beds in this Room:</h2>
      {beds.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {beds.map((bed) => {
            let bgColor = {
              available: "bg-green-500",
              occupied: "bg-red-500",
              maintenance: "bg-yellow-500"
            }[bed.state] || "bg-gray-500";

            return (
              <div key={bed._id} className={`p-4 text-white rounded-lg shadow-lg ${bgColor}`}>
                <p className="text-lg font-bold">Bed {bed.number}</p>
                <p className="text-sm">{bed.patient ? bed.patient.name : "No patient assigned"}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No beds found in this room.</p>
      )}

      <button 
        onClick={() => setShowPopup(!showPopup)} 
        className="mt-6 bg-blue-500 text-white p-2 rounded flex items-center"
      >
        + Add Bed
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Add a New Bed</h2>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">Bed Number</label>
                <input
                  type="text" id="number" value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="mt-1 p-2 border rounded w-full" required
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <select
                  id="state" value={state} onChange={(e) => setState(e.target.value)}
                  className="mt-1 p-2 border rounded w-full"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label htmlFor="patient" className="block text-sm font-medium text-gray-700">Patient ID</label>
                <input
                  type="text" id="patient" value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>
              <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Add Bed</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
