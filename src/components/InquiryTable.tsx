import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FileText, Download, X, ClipboardList, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attachment, Inquiry } from '../types';
import ActionModal from './ActionModal';
import jsPDF from 'jspdf';

const InquiryTable: React.FC = () => {
  const { inquiries, user, updateInquiry } = useApp();
  // For action menu (three dots)
  const [selectedActionInquiryId, setSelectedActionInquiryId] = useState<string | null>(null);
  // For modals (edit, detail, etc)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  // Close action menu on outside click
  useEffect(() => {
    if (!selectedActionInquiryId) return;
    function handleClick(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setSelectedActionInquiryId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedActionInquiryId]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(e.target as Node)) {
        setIsRowsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const [isDeskripsiModalOpen, setIsDeskripsiModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInquiry, setEditInquiry] = useState<Inquiry | null>(null);
  const [actionType, setActionType] = useState<string>('cancel');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processInquiry, setProcessInquiry] = useState<Inquiry | null>(null);
  const [processNotes, setProcessNotes] = useState('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeInquiry, setCompleteInquiry] = useState<Inquiry | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  const handleFollowUp = (whatsappNumber: string, namaToko: string, inquiry: Inquiry) => {
    let biayaMsg = '';
    if (inquiry.type === 'berbayar') {
      biayaMsg = `Permintaan Anda dikenakan biaya sebesar ${inquiry.fee ? inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : '-'}.`;
    } else if (inquiry.type === 'gratis') {
      biayaMsg = 'Permintaan Anda tidak dikenakan biaya (gratis).';
    } else {
      biayaMsg = 'Status biaya permintaan Anda belum ditentukan.';
    }
    const statusMsg = `Status permintaan Anda saat ini: ${inquiry.status === 'progress' ? 'Sedang diproses' : inquiry.status === 'selesai' ? 'Sudah selesai' : inquiry.status === 'wait for payment' ? 'Menunggu pembayaran' : inquiry.status === 'on going QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'on progress QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'paid off' ? 'Sudah dibayar' : inquiry.status === 'ready for update' ? 'Siap untuk diupdate' : inquiry.status === 'pending' ? 'Masih dalam tahap pengajuan' : inquiry.status}.`;
    const message = `Halo ${namaToko},\n\n${biayaMsg}\n${statusMsg}\n\nTerima kasih telah menggunakan layanan kami.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openActionModal = (inquiry: Inquiry, actionType?: string) => {
    setSelectedInquiry(inquiry);
    setActionType(actionType || 'cancel');
    setIsModalOpen(true);
  };

  const openEditModal = (inquiry: Inquiry) => {
    setEditInquiry(inquiry);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditInquiry(null);
  };

  const openProcessModal = (inquiry: Inquiry) => {
    setProcessInquiry(inquiry);
    setProcessNotes('');
    setIsProcessModalOpen(true);
  };

  const closeProcessModal = () => {
    setIsProcessModalOpen(false);
    setProcessInquiry(null);
    setProcessNotes('');
  };

  const openCompleteModal = (inquiry: Inquiry) => {
    setCompleteInquiry(inquiry);
    setCompleteNotes('');
    setIsCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setCompleteInquiry(null);
    setCompleteNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'batal': return 'bg-red-100 text-red-800 border-red-200';
      case 'wait for payment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on going QA': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on progress QA': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'paid off': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready for update': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'berbayar': return 'bg-blue-500 text-white border-blue-600';
      case 'gratis': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDivisiColor = (divisi: string | undefined) => {
    switch (divisi?.toLowerCase()) {
      case 'produksi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qc': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'finance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'helpdesk': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };

  const exportToPDF = (inquiry: Inquiry) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper function to parse HTML and render formatted text
    const renderFormattedText = (htmlText: string, startX: number, startY: number, maxWidth: number) => {
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

      return currentY;
    };

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
    doc.text(inquiry.status, valueX, leftY + 16);
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
    renderFormattedText(inquiry.deskripsi, 25, yPosition + 20, pageWidth - 50);

    yPosition += 95;

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
  };

  // Pagination logic
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(inquiries.length / rowsPerPage);
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.nama_toko?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.nomor_whatsapp_customer?.includes(searchTerm) ||
      inquiry.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const pagedInquiries = filteredInquiries.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Daftar Inquiry</h2>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Filter Status</label>
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px] flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">
                  {statusFilter === '' ? 'Semua Status' : statusFilter}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-y-auto custom-scroll"
                style={{ maxHeight: '160px' }} // 40px * 4 item
                >

                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg"
                  >
                    Semua Status
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('pending');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('progress');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Progress
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('wait for payment');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Wait for Payment
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('on going QA');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    On Going QA
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('on progress QA');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    On Progress QA
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('ready for update');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Ready for Update
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('paid off');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Paid Off
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('selesai');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('batal');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Baris per Halaman</label>
            <div className="relative" ref={rowsDropdownRef}>
              <button
                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[120px] flex items-center justify-between cursor-pointer"
              >
                <span>{rowsPerPage}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isRowsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isRowsDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {[10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setRowsPerPage(num);
                        setIsRowsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        num === 10 ? 'rounded-t-lg' : num === 100 ? 'rounded-b-lg' : ''
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-2 sm:hidden">
        <p className="text-xs text-gray-500 text-center">Geser ke samping untuk melihat semua kolom →</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 w-12 sm:w-16">
                No
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[120px]">
                Nama Toko
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[100px]">
                No. HP
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden md:table-cell min-w-[150px]">
                Deskripsi
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden lg:table-cell min-w-[80px]">
                Divisi
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden xl:table-cell min-w-[120px]">
                Divisi Notes
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden sm:table-cell min-w-[80px]">
                Tipe
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden sm:table-cell min-w-[80px]">
                Fee
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[100px]">
                Status
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden md:table-cell min-w-[100px]">
                Lampiran
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[80px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {pagedInquiries.map((inquiry, index) => (
              <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                  {(page - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
                  <div
                    className="font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-[180px]"
                    style={{ wordBreak: 'normal', whiteSpace: 'nowrap' }}
                    title={inquiry.nama_toko}
                  >
                    {inquiry.nama_toko}
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
                  {inquiry.nomor_whatsapp_customer}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium max-w-xs hidden md:table-cell">
                  <button
                    className="bg-transparent border-0 p-0 m-0 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer transition-colors font-medium whitespace-nowrap"
                    style={{ fontWeight: 500 }}
                    onClick={() => { setSelectedInquiry(inquiry); setIsDeskripsiModalOpen(true); }}
                  >
                    Lihat Detail
                  </button>
                </td>
      {/* Deskripsi Detail Modal */}
      {isDeskripsiModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-10" onClick={() => setIsDeskripsiModalOpen(false)} />
          {/* Centered Modal */}
          <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b rounded-t-2xl">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Detail Inquiry</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedInquiry.nama_toko}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToPDF(selectedInquiry)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  title="Export ke PDF"
                >
                  <Download size={16} />
                  Export PDF
                </button>
                <button onClick={() => setIsDeskripsiModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Inquiry Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Informasi Inquiry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Nama Toko:</span>
                    <p className="text-gray-800 mt-1">{selectedInquiry.nama_toko}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">No. WhatsApp:</span>
                    <p className="text-gray-800 mt-1">{selectedInquiry.nomor_whatsapp_customer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className="text-gray-800 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedInquiry.status)}`}>
                        {selectedInquiry.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tipe:</span>
                    <p className="text-gray-800 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(selectedInquiry.type)}`}>
                        {selectedInquiry.type === 'berbayar' ? 'Berbayar' : 'Gratis'}
                      </span>
                    </p>
                  </div>
                  {selectedInquiry.fee && selectedInquiry.fee > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Biaya:</span>
                      <p className="text-gray-800 mt-1 font-semibold">
                        {selectedInquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Tanggal Dibuat:</span>
                    <p className="text-gray-800 mt-1">
                      {new Date(selectedInquiry.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {selectedInquiry.created_by && (
                    <div>
                      <span className="font-medium text-gray-600">Dibuat Oleh:</span>
                      <p className="text-gray-800 mt-1">{selectedInquiry.created_by}</p>
                    </div>
                  )}
                  {selectedInquiry.divisi && (
                    <div>
                      <span className="font-medium text-gray-600">Divisi:</span>
                      <p className="text-gray-800 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getDivisiColor(selectedInquiry.divisi)}`}>
                          {selectedInquiry.divisi}
                        </span>
                      </p>
                    </div>
                  )}
                  {selectedInquiry.divisi_notes && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Catatan Divisi:</span>
                      <p className="text-gray-800 mt-1">{selectedInquiry.divisi_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Deskripsi Permintaan</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div 
                    className="text-gray-800 prose prose-sm max-w-none" 
                    style={{ wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: selectedInquiry.deskripsi }}
                  />
                </div>
              </div>

              {/* Attachments */}
              {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">Lampiran</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInquiry.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <FileText size={16} />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                  {inquiry.divisi ? (
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getDivisiColor(inquiry.divisi)}`}>
                      {inquiry.divisi}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium max-w-40 hidden xl:table-cell">
                  {inquiry.divisi_notes ? (
                    <div className="truncate text-gray-500" title={inquiry.divisi_notes}>
                      {inquiry.divisi_notes}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                  {inquiry.type ? (
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getTypeColor(inquiry.type)}`}>
                      {inquiry.type === 'berbayar' ? 'berbayar' : 'gratis'}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium hidden sm:table-cell">
                  {/* FEE COLUMN */}
                  {inquiry.fee !== undefined && inquiry.fee !== null ? (
                    <span className="text-gray-500">{inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium hidden md:table-cell">
                  {inquiry.attachments && inquiry.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {inquiry.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-1 sm:px-2 py-1 bg-gray-100 rounded text-xs text-blue-600 hover:underline"
                          title={att.name}
                        >
                          <FileText size={12} className="sm:w-4 sm:h-4" />
                          <span className="truncate max-w-[60px] sm:max-w-none">{att.name}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <div className="relative flex items-center justify-center">
                    <button
                      className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 rounded-full transition-colors focus:outline-none"
                      title="Aksi"
                      onClick={() => setSelectedActionInquiryId(inquiry.id === selectedActionInquiryId ? null : inquiry.id)}
                    >
                      <MoreVertical size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    {/* Dropdown menu */}
                    {selectedActionInquiryId === inquiry.id && (
                      <div ref={actionMenuRef} className="absolute right-0 mt-2 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fadeIn flex flex-col py-2">
                        {user?.role === 'helpdesk' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openEditModal(inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'selesai'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => { openActionModal(inquiry); setSelectedActionInquiryId(null); }}
                              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700"
                            >
                              Batalkan
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal') { handleFollowUp(inquiry.nomor_whatsapp_customer, inquiry.nama_toko, inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status === 'batal' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal'}
                            >
                              Follow Up
                            </button>
                          </>
                        )}
                        {user?.role === 'produksi' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => { 
                                if (inquiry.status !== 'batal' && inquiry.status !== 'selesai' && inquiry.status !== 'progress' && inquiry.status !== 'wait for payment') { 
                                  openProcessModal(inquiry);
                                  setSelectedActionInquiryId(null);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' || inquiry.status === 'progress' || inquiry.status === 'wait for payment' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai' || inquiry.status === 'progress' || inquiry.status === 'wait for payment'}
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => { 
                                if (inquiry.status === 'progress') { 
                                  openCompleteModal(inquiry);
                                  setSelectedActionInquiryId(null);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status !== 'progress' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status !== 'progress'}
                            >
                              Selesai
                            </button>
                          </>
                        )}
                        {user?.role === 'qc' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'proses'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => { openActionModal(inquiry); setSelectedActionInquiryId(null); }}
                              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700"
                            >
                              Batalkan
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'selesai'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Selesai
                            </button>
                          </>
                        )}
                        {user?.role === 'finance' && (
                          <button
                            onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry); setSelectedActionInquiryId(null); } }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                            disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                          >
                            Update
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
      {/* Action Modal */}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inquiry={selectedInquiry}
        userRole={user?.role}
        actionType={actionType}
      />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (below table) */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 sm:py-6">
        <button
          className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <span className="hidden sm:inline">Prev</span>
          <span className="sm:hidden">←</span>
        </button>
        <span className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4">
          {page} / {totalPages || 1}
        </span>
        <button
          className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>

      {/* File Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{previewAttachment.name}</h3>
              <div className="flex gap-2">
                <a
                  href={previewAttachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              {previewAttachment.type === 'image' ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText size={64} className="mx-auto text-red-600 mb-4" />
                  <p className="text-gray-600">Preview PDF tidak tersedia</p>
                  <a
                    href={previewAttachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buka di Tab Baru
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for Helpdesk */}
      {user?.role === 'helpdesk' && isEditModalOpen && editInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Edit Data Inquiry</h2>
              <button onClick={closeEditModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form
              className="p-6 space-y-6"
              onSubmit={e => {
                e.preventDefault();
                if (editInquiry) {
                  const updates: Partial<Inquiry> = {
                    nomor_whatsapp_customer: editInquiry.nomor_whatsapp_customer,
                    nama_toko: editInquiry.nama_toko,
                    deskripsi: editInquiry.deskripsi,
                    edited_by: user?.name,
                    edited_at: new Date().toISOString(),
                  };
                  
                  // Jika belum ada helpdesk_by, catat sebagai helpdesk yang memproses
                  if (!editInquiry.helpdesk_by && user?.role === 'helpdesk') {
                    updates.helpdesk_by = user.name;
                  }
                  
                  updateInquiry(editInquiry.id, updates);
                }
                closeEditModal();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp Customer</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editInquiry.nomor_whatsapp_customer}
                  onChange={e => setEditInquiry({ ...editInquiry, nomor_whatsapp_customer: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editInquiry.nama_toko}
                  onChange={e => setEditInquiry({ ...editInquiry, nama_toko: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Permintaan</label>
                <ReactQuill
                  value={editInquiry.deskripsi}
                  onChange={value => setEditInquiry({ ...editInquiry, deskripsi: value })}
                  theme="snow"
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                    ],
                  }}
                  className="bg-white"
                  placeholder="Jelaskan kebutuhan atau permintaan customer..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal for Produksi */}
      {user?.role === 'produksi' && isProcessModalOpen && processInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Proses Inquiry</h2>
              <button onClick={closeProcessModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Inquiry Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-800 mb-3">Inquiry Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Toko:</span> {processInquiry.nama_toko}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">WhatsApp:</span> {processInquiry.nomor_whatsapp_customer}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span> {processInquiry.status}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Created:</span> {new Date(processInquiry.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Created by:</span> {processInquiry.created_by || '-'}
                  </p>
                  {processInquiry.edited_by && processInquiry.edited_at && (
                    <p className="text-gray-600">
                      <span className="font-medium">Edited by:</span> {processInquiry.edited_by} ({new Date(processInquiry.edited_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })})
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Produksi by:</span> {processInquiry.produksi_by || '-'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">QC by:</span> {processInquiry.qc_by || '-'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Finance by:</span> {processInquiry.finance_by || '-'}
                  </p>
                  {processInquiry.helpdesk_by && (
                    <p className="text-gray-600">
                      <span className="font-medium">Helpdesk by:</span> {processInquiry.helpdesk_by}
                    </p>
                  )}
                </div>
                {processInquiry.attachments && processInquiry.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Lampiran</label>
                    <div className="flex flex-wrap gap-2">
                      {processInquiry.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <FileText size={16} />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="process-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="process-notes"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tambahkan catatan proses..."
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeProcessModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (processInquiry) {
                      updateInquiry(processInquiry.id, {
                        divisi: 'produksi',
                        divisi_notes: processNotes || 'Sedang diproses oleh produksi',
                        produksi_by: user?.name,
                        status: 'progress',
                        updated_at: new Date().toISOString(),
                      });
                      closeProcessModal();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Mulai Proses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal for Produksi */}
      {user?.role === 'produksi' && isCompleteModalOpen && completeInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Selesai Proses Inquiry</h2>
              <button onClick={closeCompleteModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Inquiry Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-800 mb-3">Inquiry Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Toko:</span> {completeInquiry.nama_toko}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">WhatsApp:</span> {completeInquiry.nomor_whatsapp_customer}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span> {completeInquiry.status}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Created:</span> {new Date(completeInquiry.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Created by:</span> {completeInquiry.created_by || '-'}
                  </p>
                  {completeInquiry.edited_by && completeInquiry.edited_at && (
                    <p className="text-gray-600">
                      <span className="font-medium">Edited by:</span> {completeInquiry.edited_by} ({new Date(completeInquiry.edited_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })})
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Produksi by:</span> {completeInquiry.produksi_by || '-'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">QC by:</span> {completeInquiry.qc_by || '-'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Finance by:</span> {completeInquiry.finance_by || '-'}
                  </p>
                  {completeInquiry.helpdesk_by && (
                    <p className="text-gray-600">
                      <span className="font-medium">Helpdesk by:</span> {completeInquiry.helpdesk_by}
                    </p>
                  )}
                </div>
                {completeInquiry.attachments && completeInquiry.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Lampiran</label>
                    <div className="flex flex-wrap gap-2">
                      {completeInquiry.attachments.map((attachment, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewAttachment(attachment)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <FileText size={16} />
                          {attachment.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="complete-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="complete-notes"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tambahkan catatan penyelesaian..."
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeCompleteModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (completeInquiry) {
                      updateInquiry(completeInquiry.id, {
                        divisi: 'produksi',
                        divisi_notes: completeNotes || 'Telah diselesaikan oleh produksi',
                        produksi_by: user?.name,
                        status: 'on going QA',
                        updated_at: new Date().toISOString(),
                      });
                      closeCompleteModal();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Selesai Proses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InquiryTable;