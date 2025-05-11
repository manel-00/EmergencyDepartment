import React, { useEffect, useState } from "react";

interface Specialty {
  _id: string;
  name: string;
}

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState<{ [key: string]: string }>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  // Récupération des spécialités
  useEffect(() => {
    fetch("http://localhost:3000/specialite/getspecialite")
      .then((res) => res.json())
      .then((data: Specialty[]) => {
        const specialtyMap: { [key: string]: string } = {};
        data.forEach((s) => {
          specialtyMap[s._id] = s.name;
        });
        setSpecialties(specialtyMap);
      })
      .catch((error) => console.error("Error fetching specialties:", error));
  }, []);

  // Récupération des médecins
  useEffect(() => {
    fetch("http://localhost:3000/user/getDoctors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filteredDoctors = data.filter((user) => user.role === "doctor");
          setDoctors(filteredDoctors);
        } else {
          console.error("Expected an array but got:", data);
        }
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  // Filtrage des médecins selon la spécialité sélectionnée
  const filteredDoctors =
    selectedSpecialty === "all"
      ? doctors
      : doctors.filter(
          (doctor) => doctor.specialty === selectedSpecialty
        );

  // Fonction pour rediriger vers la page Make Appointment avec l'ID du docteur
  const handleMakeAppointment = (doctorId: string) => {
    window.location.href = `/MakeAppointment/${doctorId}`; // Redirige vers la page Make Appointment avec l'ID du docteur
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-4xl font-bold text-center text-blue-700 mb-8">
        Meet Our Exceptional Doctors
      </h2>

      {/* Filtre de spécialité */}
      <div className="mb-6">
        <label
          htmlFor="specialtyFilter"
          className="text-lg font-semibold text-gray-700"
        >
          Filter by Specialty:
        </label>
        <select
          id="specialtyFilter"
          className="mt-2 p-2 w-full sm:w-1/2 md:w-1/3 bg-gray-100 border rounded-lg"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          <option value="all">All Specialties</option>
          {Object.entries(specialties).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="group bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-500 ease-in-out"
            >
              {/* Image dans un cercle */}
              <div className="relative w-full h-64 bg-gradient-to-r from-blue-400 via-indigo-600 to-purple-700 p-4 rounded-t-3xl flex justify-center items-center">
                <img
                  src={
                    doctor.image
                      ? `http://localhost:3002/images/${doctor.image}`
                      : "/default-doctor.jpg"
                  }
                  alt={doctor.name}
                  className="w-40 h-40 object-cover rounded-full border-4 border-white transition-all duration-300 ease-in-out group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Dr. {doctor.name} {doctor.lastname}
                </h3>
                <p className="text-lg text-gray-600 mt-2">
                  Specialty:{" "}
                  <span className="text-blue-500">
                    {doctor.specialty && specialties[doctor.specialty]
                      ? specialties[doctor.specialty]
                      : "Unknown"}
                  </span>
                </p>
                <button
                  className="w-full mt-4 py-2 rounded-lg bg-blue-500 text-white font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-blue-600"
                  onClick={() => handleMakeAppointment(doctor._id)} // Appel de la fonction de redirection
                >
                  Make Appointment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No doctors available</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
