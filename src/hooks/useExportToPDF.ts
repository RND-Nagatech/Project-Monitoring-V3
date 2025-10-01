import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { Inquiry } from '../types';

export const useExportToPDF = () => {
  const exportToPDF = useCallback((inquiry: Inquiry) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header Section
    doc.setFillColor(41, 128, 185); // Blue header background
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Company/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MONITORING INQUIRY SYSTEM', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Detail Permintaan Inquiry', pageWidth / 2, 25, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Inquiry Info Box
    const boxHeight = (inquiry.fee && inquiry.fee > 0) ? 70 : 60;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(15, yPosition, pageWidth - 30, boxHeight);

    // Title for info section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMASI PERMINTAAN', 20, yPosition + 8);

    // Line under title
    doc.setLineWidth(0.3);
    doc.line(20, yPosition + 12, pageWidth - 20, yPosition + 12);

    // Left column - Labels with aligned colons
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let leftY = yPosition + 20;
    const labelX = 25;
    const colonX = 85; // Fixed position for colons to align them

    // Draw labels and colons separately for perfect alignment
    doc.text('Nama Toko', labelX, leftY);
    doc.text(':', colonX, leftY);

    doc.text('No. WhatsApp', labelX, leftY + 8);
    doc.text(':', colonX, leftY + 8);

    doc.text('Status', labelX, leftY + 16);
    doc.text(':', colonX, leftY + 16);

    doc.text('Tipe', labelX, leftY + 24);
    doc.text(':', colonX, leftY + 24);

    doc.text('Tanggal Dibuat', labelX, leftY + 32);
    doc.text(':', colonX, leftY + 32);

    // Right column values - aligned with colons
    doc.setFont('helvetica', 'bold');
    const valueX = 90; // Start values after colon position
    doc.text(inquiry.nama_toko, valueX, leftY);
    doc.text(inquiry.nomor_whatsapp_customer, valueX, leftY + 8);
    doc.text(inquiry.status || 'Belum ditentukan', valueX, leftY + 16);
    doc.text(inquiry.type === 'berbayar' ? 'Berbayar' : 'Gratis', valueX, leftY + 24);
    doc.text(new Date(inquiry.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), valueX, leftY + 32);

    // Fee if applicable
    if (inquiry.fee && inquiry.fee > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Biaya', labelX, leftY + 40);
      doc.text(':', colonX, leftY + 40);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 20, 60); // Crimson red for price
      doc.text(inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }), valueX, leftY + 40);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += boxHeight + 15;

    // Description Section
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(15, yPosition, pageWidth - 30, 80); // Increased height for formatted content

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DESKRIPSI PERMINTAAN', 20, yPosition + 8);

    doc.setLineWidth(0.3);
    doc.line(20, yPosition + 12, pageWidth - 20, yPosition + 12);

    // Render formatted description with bullet points
    // Render formatted description with support for lists
    const renderDescriptionWithLists = (htmlText: string, startX: number, startY: number, maxWidth: number) => {
      let currentY = startY;
      const lineHeight = 6;

      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      // Function to process text nodes and elements
      const processNode = (node: Node, indentLevel: number = 0) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const indent = indentLevel * 10;
            const wrappedText = doc.splitTextToSize(text, maxWidth - indent);
            doc.text(wrappedText, startX + indent, currentY);

            // Calculate height for wrapped text
            const textHeight = Array.isArray(wrappedText) ? wrappedText.length * lineHeight : lineHeight;
            currentY += textHeight;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          if (tagName === 'ul') {
            // Process list items
            const listItems = element.querySelectorAll('li');
            listItems.forEach((li) => {
              // Bullet point
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              const indent = indentLevel * 10;
              doc.text('•', startX + indent + 5, currentY);

              // Process list item content
              Array.from(li.childNodes).forEach(child => {
                processNode(child, indentLevel + 1);
              });
            });
          } else if (tagName === 'ol') {
            // Process ordered list items
            const listItems = element.querySelectorAll('li');
            listItems.forEach((li, index) => {
              // Numbered list
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              const indent = indentLevel * 10;
              doc.text(`${index + 1}.`, startX + indent + 5, currentY);

              // Process list item content
              Array.from(li.childNodes).forEach(child => {
                processNode(child, indentLevel + 1);
              });
            });
          } else if (tagName === 'li') {
            // This shouldn't happen as we handle ul/ol above, but just in case
            Array.from(element.childNodes).forEach(child => {
              processNode(child, indentLevel);
            });
          } else if (tagName === 'p' || tagName === 'div' || tagName === 'br') {
            // Paragraph or line break
            if (tagName === 'br') {
              currentY += lineHeight;
            } else {
              Array.from(element.childNodes).forEach(child => {
                processNode(child, indentLevel);
              });
              // Add extra space after paragraphs
              if (tagName === 'p') {
                currentY += lineHeight * 0.5;
              }
            }
          } else {
            // Other elements - just process their children
            Array.from(element.childNodes).forEach(child => {
              processNode(child, indentLevel);
            });
          }
        }
      };

      // Process all child nodes of the HTML content
      Array.from(tempDiv.childNodes).forEach(node => {
        processNode(node, 0);
      });

      return currentY - startY; // Return the height used
    };

    // Render the description
    const descriptionHeight = renderDescriptionWithLists(inquiry.deskripsi, 25, yPosition + 20, pageWidth - 50);
    yPosition += Math.max(95, descriptionHeight + 25); // Ensure minimum height

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Dokumen ini dihasilkan oleh Sistem Monitoring Inquiry', pageWidth / 2, pageHeight - 18, { align: 'center' });
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })} | Waktu: ${new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `Inquiry-${inquiry.nama_toko.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }, []);

  return { exportToPDF };
};