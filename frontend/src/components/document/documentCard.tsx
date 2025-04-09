import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentCardSkeleton from "./documentSkeleton";
import Utils from "@/lib";
import QRCode from "react-qr-code";
export default function DocumentCard() {
  const [user, setUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
      const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      fetchDocumentAndUser(id);
    }
  }, [id]);

  const fetchDocumentAndUser = async (docId) => {
    try {
      const docRes = await fetch(`http://localhost:3000/document/get/${docId}`, { credentials: "include" });
      if (!docRes.ok) throw new Error("Erreur lors du chargement du document");
      const documentData = await docRes.json();

      const userRes = await fetch(`http://localhost:3000/user/getUser/${documentData.patient_id}`, { credentials: "include" });
      if (!userRes.ok) throw new Error("Erreur lors du chargement de l'utilisateur");
      const userData = await userRes.json();

      setDocument(documentData);
      setUser(userData.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
    const router = useRouter();
  const handleEdit = (id: string) => {
    router.push(`/document/edit?id=${id}`);
  };

  if (loading) return <DocumentCardSkeleton/>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

    // Generate the QR code data (either JSON or a document URL)
    const qrValue = JSON.stringify({
      nom: document.nom,
      type: document.type,
      date_upload: document.date_upload,
      patient: `${user.name} ${user.lastname}`,
      email: user.email,
    });

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl overflow-hidden border border-gray-100">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-3xl font-bold tracking-tight">Pation Details</h2>
      </div>
      
      <div className="p-8">
        {/* User Profile Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-200 pb-6 mb-6">
          <div className="relative">
            {user.image ? (
              <img
                src={`/images/${user.image}`}
                alt={`${user.name} ${user.lastname}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                <span className="text-3xl font-bold text-white">
                  {user.name.charAt(0)}{user.lastname.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{user.name} {user.lastname}</h3>
            <p className="text-blue-600 font-medium mb-1">{user.role}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>
        
        {/* Document Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-4">
          Pation Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Nom</p>
                <p className="text-gray-800 font-semibold">{document.nom}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Type</p>
                <p className="text-gray-800 font-semibold">{document.type}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Date d'Upload</p>
                <p className="text-gray-800 font-semibold">{new Date(document.date_upload).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              </div>

              
            </div>
          </div>
          
          {/* Content Section - Full Width and Expandable */}
          <div className="col-span-full">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-purple-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="w-full">
                <p className="text-sm text-gray-500 font-medium">Contenu</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 mt-1 border border-gray-100 max-h-64 overflow-y-auto">
              <pre className="text-gray-800 whitespace-pre-wrap break-words font-sans">{document.contenu}</pre>
            </div>
          </div>
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center mt-6">
            <p className="text-sm text-gray-600 mb-2">
            Scan this QR Code for details</p>
            <QRCode value={qrValue} size={150} />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => Utils.generatePDF(document, user)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm" onClick={() => handleEdit(document._id)}>Modify</button>
        </div>
      </div>
    </div>
  );};