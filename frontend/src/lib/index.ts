import jsPDF from 'jspdf';

export default class Utils {
  static async generatePDF(document, user) {
    const doc = new jsPDF();
    
    // Add document title
    doc.setFontSize(22);
    doc.text("Détails du Document", 20, 20);
    
    // Add user image if available
    if (user.image) {
      try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = "Anonymous";  // Handle CORS if needed
        
        // Create a promise to wait for image loading
        const imageLoaded = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
          img.src = `/images/${user.image}`;
        });
        
        // Wait for image to load
        await imageLoaded;
        
        // Add image to PDF (positioned to the right)
        const imgWidth = 30;
        const imgHeight = 30;
        doc.addImage(img, 'JPEG', 160, 30, imgWidth, imgHeight, undefined, 'FAST');
        
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        // Continue without the image if there's an error
      }
    } else {
      // Add initials circle if no image
      doc.setFillColor(64, 139, 234); // Blue color similar to your UI
      doc.circle(175, 45, 15, 'F');
      doc.setTextColor(255, 255, 255); // White color for text
      doc.setFontSize(16);
      doc.text(`${user.name.charAt(0)}${user.lastname.charAt(0)}`, 175, 48, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset text color to black
    }
    
    // Add user info
    doc.setFontSize(14);
    doc.text(`Utilisateur: ${user.name} ${user.lastname}`, 20, 40);
    doc.text(`Email: ${user.email}`, 20, 50);
    doc.text(`Rôle: ${user.role}`, 20, 60);
    
    // Add document info
    doc.text(`Nom: ${document.nom}`, 20, 80);
    doc.text(`Type: ${document.type}`, 20, 90);
    
    // Add document content
    doc.text("Contenu:", 20, 110);
    const splitContent = doc.splitTextToSize(document.contenu, 180);
    doc.text(splitContent, 20, 120);
    
    // Add document date
    doc.text(`Date d'Upload: ${new Date(document.date_upload).toLocaleDateString('fr-FR')}`, 20, 180);
    
    // Save the PDF
    doc.save(`${document.nom}.pdf`);
  }
}