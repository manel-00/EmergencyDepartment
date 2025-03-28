import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [searchFloor, setSearchFloor] = useState("");
  const [searchWard, setSearchWard] = useState("");
  const [formData, setFormData] = useState({ number: "", type: "", floor: "", ward: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:3000/room/query");
      const data = await response.json();
      setRooms(data);
      setFilteredRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSearch = () => {
    let filtered = rooms;
    if (searchFloor) {
      filtered = filtered.filter((room) => room.floor.toString() === searchFloor);
    }
    if (searchWard) {
      filtered = filtered.filter((room) => room.ward.toLowerCase().includes(searchWard.toLowerCase()));
    }
    setFilteredRooms(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:3000/room/query/${editingId}` : "http://localhost:3000/room/query";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchRooms();
        setFormData({ number: "", type: "", floor: "", ward: "" });
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/room/query/${id}`, { method: "DELETE" });
      if (response.ok) fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Room Management</h1>

        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="Search by ward" value={searchWard} onChange={(e) => setSearchWard(e.target.value)} className="p-2 border rounded-md w-1/2" />
          <select value={searchFloor} onChange={(e) => setSearchFloor(e.target.value)} className="p-2 border rounded-md w-1/2">
            <option value="">All Floors</option>
            {[1, 2, 3, 4, 5, 6].map((floor) => (
              <option key={floor} value={floor}>Floor {floor}</option>
            ))}
          </select>
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-md">Search</button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRooms.map((room) => (
            <div key={room._id} className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="bg-blue-500 text-white p-4 rounded-full text-sm font-medium">{room.number}</div>
                {isDetailedView && (
                  <div className="ml-4">
                    <div className="text-sm text-gray-900">{room.type}</div>
                    <div className="text-xs text-gray-500">Floor: {room.floor} | Ward: {room.ward}</div>
                  </div>
                )}
              </div>
              {isDetailedView && (
                <div>
                  <button onClick={() => setEditingId(room._id)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(room._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-6">
          <div className="grid grid-cols-1 gap-4">
            <input type="text" placeholder="Room Number" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className="p-2 border rounded-md" required />
            <input type="text" placeholder="Room Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="p-2 border rounded-md" required />
            <select value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="p-2 border rounded-md" required>
              <option value="">Select Floor</option>
              {[1, 2, 3, 4, 5, 6].map((floor) => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
            <input type="text" placeholder="Ward" value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} className="p-2 border rounded-md" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Plus className="h-4 w-4" /> {editingId ? "Update Room" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}