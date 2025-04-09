
import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";


interface Patient {
  _id: string;
  name: string;
}

interface FormData {
  name: string;
  type: string;
  contenu: string;
  patient_id: string;
}

export default function AddDocumentForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    contenu: "",
    patient_id: "",
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();



  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`http://localhost:3000/user//listPatientsrassil`, {
          headers: { },
          credentials: 'include' // This will send cookies with the request
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des patients");
        const data: Patient[] = await res.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    
    fetchPatients();
  }, []);
  

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = patients.find((p) => p._id === e.target.value);
    setFormData({
      ...formData,
      patient_id: selectedPatient?._id || "",
      name: selectedPatient?.name || "",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.type || !formData.contenu || !formData.patient_id) {
      setError("Tous les champs sont requis.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/document/ajouter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Erreur lors de l'ajout du document");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-xl font-semibold mb-4">
Add a Document</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="type"
          placeholder="Type de document"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="contenu"
          placeholder="Contenu du document"
          value={formData.contenu}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>
        <select
  name="patient_id"
  onChange={handlePatientChange}
  className="w-full p-2 border rounded"
>
  <option value="">Sélectionner un patient</option>
  {patients && patients.length > 0 ? (
    patients.map((patient) => (
      <option key={patient._id} value={patient._id} className="text-black">
        {patient.name}
      </option>
    ))
  ) : (
    <option value="" disabled>No patients available</option>
  )}
</select>

{/* Add this for debugging */}
<div style={{ display: 'none' }}>
  Debug: {JSON.stringify(patients)}
</div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Add
        </button>
      </form>
    </div>
  );
}

