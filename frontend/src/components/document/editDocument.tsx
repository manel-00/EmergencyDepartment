import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface FormData {
  nom: string;
  type: string;
  contenu: string;
}

export default function EditDocument() {
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    type: "",
    contenu: "",
  });
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id");

  useEffect(() => {
    if (documentId) {
      const fetchDocument = async () => {
        try {
          const res = await fetch(`http://localhost:3000/document/get/${documentId}`, {
            credentials: 'include'
          });
          if (!res.ok) throw new Error("Erreur lors du chargement du document");
          const data: FormData = await res.json();
          setFormData(data);
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchDocument();
    }
  }, [documentId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.nom || !formData.type || !formData.contenu) {
      setError("Tous les champs sont requis.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/document/edit/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du document");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-xl font-semibold mb-4">Modifier le Document</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
      <input
            type="text"
             name="name"
           placeholder="Nom du document"
          value={formData.nom}
            readOnly
             className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed hover:text-red-600"
        />
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Modify
        </button>
      </form>
    </div>
  );
}
