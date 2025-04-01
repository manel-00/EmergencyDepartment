"use client";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { Pencil,Trash2,CheckCircle, AlertCircle  } from "lucide-react";
import { Printer, RotateCcw, ArrowRight, Armchair, Shirt } from 'lucide-react';



export default function RoomDetails() {
  const { id } = useParams(); 
  
  const [room, setRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]); 
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(""); 
  const [selectedBed, setSelectedBed] = useState(null);
  const [number, setNumber] = useState('');
  const [state, setState] = useState('available');
  const [selectedPatient, setSelectedPatient] = useState(''); 

  useEffect(() => {
    const fetchRoomAndBeds = async () => {
      try {
        const roomRes = await fetch(`http://localhost:3000/room/${id}`);
        if (!roomRes.ok) throw new Error("Error fetching room details.");
        const roomData = await roomRes.json();
        setRoom(roomData);
        
        const bedsRes = await fetch(`http://localhost:3000/room/${id}/beds`);
        if (bedsRes.ok) {
          const bedsData = await bedsRes.json();
          setBeds(bedsData);
        }

        // Fetch the list of patients
        const patientsRes = await fetch(`http://localhost:3000/user/listPatients`);
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatients(patientsData);
        } else {
          console.warn("Failed to fetch patients, continuing...");
        }
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchRoomAndBeds();
  }, [id]);

  const handleAddBed = async (e) => {
    e.preventDefault();
    const newBedData = { number, state, room: id };

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
      } else {
        console.error('Failed to add new bed:', await res.text());
      }
    } catch (error) {
      console.error('Error creating bed:', error);
    }
  };

  const handleAssignPatient = async (bedId) => {
    if (!selectedPatient) {
      console.error("No patient selected!");
      return;
    }
  
    console.log("Assigning patient:", selectedPatient, "to bed:", bedId);
  
    try {
      const res = await fetch(`http://localhost:3000/room/${bedId}/assign-patient`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatient }),
      });
  
      const responseData = await res.json();
      console.log("Response from server:", responseData);
  
      if (res.ok) {
        // Optimistically update the state without waiting for re-fetch
        setBeds(beds.map(bed => 
          bed._id === bedId 
            ? { ...bed, patient: responseData.patient, state: 'occupied' } 
            : bed
        ));
  
        // Close the popup and reset the selected patient
        setShowPopup(false);
        setSelectedPatient("");
      } else {
        console.error("Failed to assign patient:", responseData);
      }
    } catch (error) {
      console.error("Error assigning patient:", error);
    }
  };
  
  

  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!room) return <div className="text-center text-gray-500 mt-10">Loading...</div>;

  const roomCapacity = parseInt(room.type, 10) || 0;
  const isRoomFull = beds.length >= roomCapacity;
  const handleDeleteBed = async (bedId) => {
    if (!window.confirm("Are you sure you want to delete this bed?")) return;
  
    try {
      const res = await fetch(`http://localhost:3000/room/beds/${bedId}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        setBeds(beds.filter((bed) => bed._id !== bedId));
      } else {
        console.error("Failed to delete bed:", await res.text());
      }
    } catch (error) {
      console.error("Error deleting bed:", error);
    }
  };
  

  return (
    <div >

<div className="grid grid-cols-2 gap-x-16 gap-y-4">
  {/* Left Column */}
  <div className="space-y-4">
    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Room Number</label>
      <div className="flex gap-2">
        <span >{room.number}</span>
      </div>
    </div>

    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Room Type</label>
      <span>{room.type}</span>
    </div>

    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Total Beds</label>
      <span>{roomCapacity} Bed(s)</span>
    </div>

    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Floor</label>
      <span>Floor Number {room.floor}</span>
    </div>

    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Ward</label>
      <span>{room.ward}</span>
    </div>
  </div>

  {/* Right Column */}
  <div className="space-y-4">
    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">State</label>
      <span>{room.state}</span>
    </div>

    <div className="grid grid-cols-[120px,1fr] items-center">
      <label className="text-gray-800 dark:text-gray-100 font-semibold">Temp.</label>
      <span>102.00</span>
    </div>

    {/* Add Bed Button */}
    <div >
      <button 
        onClick={() => {
          setPopupType("addBed");
          setShowPopup(true);
        }} 
        className={`bg-[#008B8B] text-white font-semibold  p-2 rounded flex items-center ${isRoomFull ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isRoomFull}
      >
        + Add Bed
      </button>
      {isRoomFull && <p className="text-red-500 text-sm mt-2">Cannot add more beds. Room at full capacity.</p>}
    </div>

    {/* Popup for Add Bed / Assign Patient */}
    {showPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
          <button 
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          >
            &times;
          </button>

          {popupType === "addBed" ? (
            <>
              <h2 className="text-lg font-bold mb-4">Add a New Bed</h2>
              <form onSubmit={handleAddBed} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                  <input
                    type="text" value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="mt-1 p-2 border rounded w-full" required
                  />
                </div>
                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Add Bed</button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-4">Assign Patient</h2>
              <select 
                value={selectedPatient} 
                onChange={(e) => setSelectedPatient(e.target.value)} 
                className="p-2 border rounded w-full"
              >
                <option value="">Select a Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>{patient.name}</option>
                ))}
              </select>
              <button onClick={() => handleAssignPatient(selectedBed)} className="mt-4 w-full bg-green-500 text-white p-2 rounded">Confirm</button>
            </>
          )}
        </div>
      </div>
    )}
  </div>
</div>

{/* Tabs */}
<div className="mt-8 border-b">
  <div className="flex gap-6">
    <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600">Beds</button>
  </div>
</div>

{/* Beds Section */}
<div className="mt-6">
  <label className="block text-gray-700 font-medium mb-2">Beds</label>
  <div className="flex gap-4 flex-wrap">
    {beds.map((bed) => {
      let bgColor = {
        available: "bg-green-200 hover:bg-[#D6EBD6] text-green-700",
        occupied: "bg-red-200 hover:bg-red-300 text-red-700", 
      }[bed.state] || "bg-gray-500 text-gray-700";

      return (
        <div
          key={bed._id}
          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-lg ${bgColor} transition-colors group w-100 relative`}
        >
          {/* Trash button at the top right */}
          <button
            className="absolute top-2 right-2 p-1 bg-transparent rounded-full hover:bg-red-400"
            onClick={() => handleDeleteBed(bed._id)}
          >
            <Trash2 size={18} className="text-red-600 hover:text-gray-300" />
          </button>

          <div className="flex items-center w-full">
            {/* Availability icon on the left side */}
            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
              {bed.state === "available" && (
                <CheckCircle size={48} className="text-green-600" />
              )}
              {bed.state === "occupied" && (
                <AlertCircle size={48} className="text-red-600" /> 
              )}
            </div>

            {/* Bed details on the right side */}
            <div className="flex flex-col ml-4">
              <h3 className="text-lg font-bold">{bed.patient}</h3>
              <p className="text-lg font-bold">Bed {bed.number}</p>

              {/* Assign patient button */}
              {bed.state === "available" && (
                <button
                  onClick={() => {
                    setSelectedBed(bed._id);
                    setPopupType("assignPatient");
                    setShowPopup(true);
                  }}
                  className="mt-2  text-green-700 px-3 py-1 rounded underline"
                >
                  Assign Patient
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>





            
              















      <h1 className="text-2xl font-bold text-gray-800">Room {room.number}</h1>
      <p className="mt-2"><strong>Type:</strong> {room.type}</p>
      <p><strong>Floor:</strong> {room.floor}</p>
      <p><strong>State:</strong> {room.state}</p>
      <p><strong>Capacity:</strong> {roomCapacity} beds</p>

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
                <Pencil size={18} className="text-white hover:text-gray-300 cursor-pointer" />
                <button
            className="p-1 bg-red-600 rounded-full hover:bg-red-400"
            onClick={() => handleDeleteBed(bed._id)}
          >
            <Trash2 size={18} className="text-white hover:text-gray-300" />
          </button>
                <p className="text-lg font-bold">Bed {bed.number}</p>

                {/* Show "Assign Patient" button only for available beds */}
                {bed.state === "available" && (
                  <button 
                    onClick={() => {
                      setSelectedBed(bed._id);
                      setPopupType("assignPatient");
                      setShowPopup(true);
                    }} 
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Assign Patient
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No beds found in this room.</p>
      )}

      {/* Add Bed Button */}
      <div className="mt-6 flex flex-col">
        <button 
          onClick={() => {
            setPopupType("addBed");
            setShowPopup(true);
          }} 
          className={`bg-blue-500 text-white p-2 rounded flex items-center ${isRoomFull ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isRoomFull}
        >
          + Add Bed
        </button>
        {isRoomFull && <p className="text-red-500 text-sm mt-2">Cannot add more beds. Room at full capacity.</p>}
      </div>

      {/* Popup for Add Bed / Assign Patient */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>

            {popupType === "addBed" ? (
              <>
                <h2 className="text-lg font-bold mb-4">Add a New Bed</h2>
                <form onSubmit={handleAddBed} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                    <input
                      type="text" value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="mt-1 p-2 border rounded w-full" required
                    />
                  </div>
                  <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Add Bed</button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">Assign Patient</h2>
                <select 
                  value={selectedPatient} 
                  onChange={(e) => setSelectedPatient(e.target.value)} 
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select a Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>{patient.name}</option>
                  ))}
                </select>
                <button onClick={() => handleAssignPatient(selectedBed)} className="mt-4 w-full bg-green-500 text-white p-2 rounded">Confirm</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
