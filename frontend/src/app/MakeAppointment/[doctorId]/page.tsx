"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Ajoutez useRouter
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";

export default function MakeAppointment() {
  const pathname = usePathname();
  const router = useRouter(); // Déclarez router pour pouvoir rediriger
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined);
  const [doctorFullName, setDoctorFullName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  // Récupérer le doctorId depuis l'URL
  useEffect(() => {
    if (pathname) {
      const doctorIdFromUrl = pathname.split("/").pop();
      setDoctorId(doctorIdFromUrl);
      console.log("doctorId récupéré depuis l'URL :", doctorIdFromUrl);
    }
  }, [pathname]);

  // Récupérer les informations du médecin
  useEffect(() => {
    if (doctorId) {
      console.log("Tentative de récupération du médecin avec doctorId :", doctorId);
      axios
        .get(`http://localhost:3000/user/getDoctor/${doctorId}`)
        .then((response) => {
          const { name, lastname } = response.data;
          setDoctorFullName(`${name} ${lastname}`);
          console.log("Nom du médecin récupéré :", doctorFullName);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération du médecin :", error);
        });
    }
  }, [doctorId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // Vérification basique du token
        if (storedToken.split('.').length === 3) {
          setToken(storedToken);
        } else {
          console.error("Token mal formaté");
          localStorage.removeItem("token");
        }
      }
    }
  }, []);
  
  // Dans handleAppointment
  const handleAppointment = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      alert("Veuillez vous reconnecter");
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:3000/makeappointment',
        {
          doctorId,
          userId,
          date: selectedDate?.toISOString().split('T')[0],
          time: selectedTime
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Si la réservation est effectuée avec succès
      if (response.status === 201) {
        alert("Rendez-vous confirmé avec succès !");
        router.push("/"); // Redirection après confirmation
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expirée, veuillez vous reconnecter");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      } else if (error.response?.status === 409) {
        // Si le créneau est déjà réservé
        alert("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
      } else {
        console.error("Erreur lors de la réservation :", error);
      }
    }
  };
  
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // Vérifier si toutes les conditions sont remplies pour activer le bouton
  const isButtonDisabled = !selectedDate || !selectedTime ;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
      <div className="flex items-center bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-[700px]">
        <div className="w-1/2 hidden md:block">
          <Image src="/images/doctor-3d.png" alt="Médecin 3D" width={250} height={250} className="mx-auto" />
        </div>

        <div className="w-full md:w-1/2 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            📅 Prendre un rendez-vous avec {doctorFullName || "le médecin"}
          </h2>

          <div className="mb-4 relative">
            <label className="block text-white text-sm mb-2">Sélectionnez une date :</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                className="w-full pl-10 p-3 rounded-xl bg-white/30 text-white placeholder-white outline-none"
                dateFormat="dd/MM/yyyy"
                placeholderText="Choisissez une date"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm mb-2">Sélectionnez une heure :</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-lg transition-all ${selectedTime === time ? "bg-white text-indigo-600 font-bold" : "bg-white/30 text-white"}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full py-3 bg-white/30 text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-all"
            onClick={handleAppointment}
            disabled={isButtonDisabled} // Désactivation du bouton en fonction de la condition
          >
            ✅ Confirmer le rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
}
