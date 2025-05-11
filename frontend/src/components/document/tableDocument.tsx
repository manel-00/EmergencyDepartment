"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Document {
  _id: string;
  nom: string;
  type: string;
  contenu: string;
  patient_id: string;
  date_upload: string;
  patientImage: string;
}

export default function DocumentCards() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocuments(documents);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredDocuments(
        documents.filter(
          (document) =>
            document.nom.toLowerCase().includes(lowercasedTerm) ||
            document.type.toLowerCase().includes(lowercasedTerm) ||
            document.contenu.toLowerCase().includes(lowercasedTerm) ||
            document.date_upload.includes(lowercasedTerm),
        ),
      );
    }
  }, [searchTerm, documents]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/document/get", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des documents");
      const data: Document[] = await res.json();

      const documentsWithImages = await Promise.all(
        data.map(async (doc) => {
          try {
            const imgRes = await fetch(
              `http://localhost:3000/user/${doc.patient_id}/image-filename`,
              { credentials: "include" },
            );
            if (!imgRes.ok) throw new Error("Image not found");
            const imgData = await imgRes.json();
            return { ...doc, patientImage: imgData.imageFilename };
          } catch {
            return { ...doc, patientImage: "" };
          }
        }),
      );

      setDocuments(documentsWithImages);
      setFilteredDocuments(documentsWithImages);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        const res = await fetch(`http://localhost:3000/document/delete/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erreur lors de la suppression du document");
        setDocuments((prev) => prev.filter((doc) => doc._id !== id));
        setFilteredDocuments((prev) => prev.filter((doc) => doc._id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    router.push(`/document/edit?id=${id}`);
  };

  // Get document type icon and color
  const getDocumentTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V8l-6-6H7zm0 2h7v5h5v11c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm9 8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-7 1c-.6 0-1 .4-1 1s.4 1 1 1h4c.6 0 1-.4 1-1s-.4-1-1-1H9zm-1 4c-.6 0-1 .4-1 1s.4 1 1 1h2c.6 0 1-.4 1-1s-.4-1-1-1H8z"/>
            </svg>
          ),
          color: "bg-red-100 text-red-600",
          borderColor: "border-red-200",
          gradientFrom: "from-red-500",
          gradientTo: "to-red-600"
        };
      case "image":
      case "jpg":
      case "png":
      case "jpeg":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm0 2h14v14H5V5zm11 10l-3-3-2 2-3-3-3 3v2h14v-2l-3-2z"/>
              <circle cx="9.5" cy="8.5" r="1.5"/>
            </svg>
          ),
          color: "bg-green-100 text-green-600",
          borderColor: "border-green-200",
          gradientFrom: "from-green-500",
          gradientTo: "to-green-600"
        };
      case "doc":
      case "docx":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-4h8v-1H8v1zm0-3h8v-1H8v1zm0-3h5v-1H8v1z"/>
            </svg>
          ),
          color: "bg-blue-100 text-blue-600",
          borderColor: "border-blue-200",
          gradientFrom: "from-blue-500",
          gradientTo: "to-blue-600"
        };
      case "xls":
      case "xlsx":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-4h2v-2H8v2zm4 0h4v-2h-4v2zm-4-4h2v-2H8v2zm4 0h4v-2h-4v2z"/>
            </svg>
          ),
          color: "bg-emerald-100 text-emerald-600",
          borderColor: "border-emerald-200",
          gradientFrom: "from-emerald-500",
          gradientTo: "to-emerald-600"
        };
      case "txt":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-6h8v-1H8v1zm0-3h8v-1H8v1zm0-3h5v-1H8v1z"/>
            </svg>
          ),
          color: "bg-purple-100 text-purple-600",
          borderColor: "border-purple-200",
          gradientFrom: "from-purple-500",
          gradientTo: "to-purple-600"
        };
      case "ppt":
      case "pptx":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm4-8c0 1.1-.9 2-2 2v2h1v-2h1c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2H8v6h2v-3zm0-1v-1H8v1h2z"/>
            </svg>
          ),
          color: "bg-orange-100 text-orange-600",
          borderColor: "border-orange-200",
          gradientFrom: "from-orange-500",
          gradientTo: "to-orange-600"
        };
      case "audio":
      case "mp3":
      case "wav":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          ),
          color: "bg-amber-100 text-amber-600",
          borderColor: "border-amber-200",
          gradientFrom: "from-amber-500",
          gradientTo: "to-amber-600"
        };
      case "video":
      case "mp4":
      case "mov":
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          ),
          color: "bg-sky-100 text-sky-600",
          borderColor: "border-sky-200",
          gradientFrom: "from-sky-500",
          gradientTo: "to-sky-600"
        };
      default:
        return {
          icon: (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-3h8v-1H8v1zm0-3h8v-1H8v1z"/>
            </svg>
          ),
          color: "bg-gray-100 text-gray-600",
          borderColor: "border-gray-200",
          gradientFrom: "from-gray-500",
          gradientTo: "to-gray-600"
        };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Documents
            </h1>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <button
                onClick={() => router.push("/askdrug")}
                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2.5 text-white transition-all hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ask Drug
              </button>
              <button
                onClick={() => router.push("/document/add")}
                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-white transition-all hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Document
              </button>
              
              <div className="relative w-full md:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700 shadow-md">
            <div className="flex items-center">
              <svg className="mr-3 h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => {
                const { icon, color, borderColor, gradientFrom, gradientTo } = getDocumentTypeInfo(document.type);
                return (
                <div
                  key={document._id}
                  onClick={() => router.push(`/document/card?id=${document._id}`)}
                  className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Document type indicator bar - now with gradient */}
                  <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${gradientFrom} ${gradientTo}`}></div>
                  
                  <div className="flex flex-col p-5">
                    {/* Header with document type and date */}
                    <div className="mb-2 flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} shadow-sm`}>
                        {icon}
                      </div>
                      <span className="flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                        <svg className="mr-1 h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(document.date_upload).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  
                    {/* Patient Image - with subtle glow effect on hover */}
                    <div className="mb-4 flex justify-center">
                      {document.patientImage ? (
                        <div className="relative overflow-hidden rounded-full">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                          <img
                            src={`/images/${document.patientImage}`}
                            alt="Patient"
                            className="h-32 w-32 rounded-full border-4 border-gray-100 object-cover shadow-md transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-md transition-transform group-hover:scale-105">
                          <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Document name with hover effect */}
                    <h3 className="mb-3 text-center text-lg font-semibold text-gray-800 transition-colors group-hover:text-blue-600 line-clamp-1">
                      {document.nom}
                    </h3>
                    
                    {/* Document info in a card */}
                    <div className="mb-4 rounded-lg bg-gray-50 p-3 shadow-sm">
                      <div className="flex items-center text-gray-700">
                        <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className={`font-medium ${color.split(" ")[1]}`}>{document.type.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    {/* Preview text with better styling */}
                    <div className="mb-4 rounded-lg bg-gray-50 p-3 shadow-sm">
                      <p className="text-sm text-gray-600 italic line-clamp-2">
                        "{document.contenu.substring(0, 60)}..."
                      </p>
                    </div>

                    {/* Actions with gradient buttons */}
                    <div className="mt-auto flex justify-end space-x-2 pt-4">
                      <button
                        onClick={(event) => handleEdit(event, document._id)}
                        className="flex items-center rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-md"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modify
                      </button>
                      <button
                        onClick={(event) => handleDelete(event, document._id)}
                        className="flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-pink-600 hover:to-rose-700 hover:shadow-md"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )})
            ) : (
              <div className="col-span-full flex h-64 items-center justify-center rounded-xl bg-white p-6 shadow-md">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-gray-900">No documents found</h3>
                  <p className="mb-6 text-gray-500">Get started by creating your first document</p>
                  <button
                    onClick={() => router.push("/document/add")}
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add your first document
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}