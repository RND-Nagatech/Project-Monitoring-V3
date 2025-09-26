import React, { useState } from 'react';
import { LogOut, FileText, Clock, Loader, DollarSign, CheckCircle, XCircle, AlertCircle, TrendingUp, Zap, Plus, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import InquiryForm from './InquiryForm';
import InquiryTable from './InquiryTable';
import DetailInquiryModal from './DetailInquiryModal';
import FilePreviewModal from './FilePreviewModal';
import EditInquiryModal from './EditInquiryModal';
import SimpleActionModal from './SimpleActionModal';
import { Inquiry, Attachment } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, inquiries, updateInquiry } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  
  // Modal states for actions
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');

  const getStatsData = () => {
    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
    const progressInquiries = inquiries.filter(i => i.status === 'progress').length;
    const completedInquiries = inquiries.filter(i => i.status === 'selesai').length;
    const waitForPaymentInquiries = inquiries.filter(i => i.status === 'wait for payment').length;
    const paidOffInquiries = inquiries.filter(i => i.status === 'paid off').length;
    const onGoingQAInquiries = inquiries.filter(i => i.status === 'on going QA').length;
    const onProgressQAInquiries = inquiries.filter(i => i.status === 'on progress QA').length;
    const readyForUpdateInquiries = inquiries.filter(i => i.status === 'ready for update').length;
    const cancelledInquiries = inquiries.filter(i => i.status === 'batal').length;
    const totalRevenue = inquiries
      .filter(i => i.status === 'selesai' && i.fee)
      .reduce((sum, i) => sum + (i.fee || 0), 0);

    return {
      totalInquiries,
      pendingInquiries,
      progressInquiries,
      completedInquiries,
      waitForPaymentInquiries,
      paidOffInquiries,
      onGoingQAInquiries,
      onProgressQAInquiries,
      readyForUpdateInquiries,
      cancelledInquiries,
      totalRevenue,
    };
  };

  const stats = getStatsData();

  const statsCards = [
    {
      title: 'Total Inquiry',
      value: stats.totalInquiries,
      icon: FileText,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    {
      title: 'Pending',
      value: stats.pendingInquiries,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'In Progress',
      value: stats.progressInquiries,
      icon: Loader,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Wait for Payment',
      value: stats.waitForPaymentInquiries,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Paid Off',
      value: stats.paidOffInquiries,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'QA In Progress',
      value: stats.onGoingQAInquiries + stats.onProgressQAInquiries,
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      title: 'Ready for Update',
      value: stats.readyForUpdateInquiries,
      icon: AlertCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      title: 'Completed',
      value: stats.completedInquiries,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledInquiries,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Total Revenue',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
  ];


  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      produksi: 'Produksi',
      qc: 'Quality Control',
      finance: 'Finance',
      helpdesk: 'Helpdesk',
    };
    return roleNames[role] || role;
  };

  const openDetailModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInquiry(null);
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedInquiry(null);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedInquiry(null);
    setActionType('');
  };

  const openActionModal = (inquiry: Inquiry, action?: string) => {
    setSelectedInquiry(inquiry);
    setActionType(action || '');
    setIsActionModalOpen(true);
  };

  const openEditModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsEditModalOpen(true);
  };

  const openProcessModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setActionType('proses');
    setIsActionModalOpen(true);
  };

  const openCompleteModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setActionType('selesai');
    setIsActionModalOpen(true);
  };

  const exportToPDF = (inquiry: Inquiry) => {
    // TODO: Implement PDF export functionality
    console.log('Exporting to PDF:', inquiry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-600 bg-opacity-50 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  Project Monitoring
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 truncate">
                  Inquiry Management System
                </p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-600 bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-300">
                      {getRoleDisplayName(user?.role || '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {(user?.role === 'helpdesk' || user?.role === 'qc') && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-600 bg-opacity-50 hover:bg-opacity-70 text-white font-medium rounded-lg transition-all duration-200 text-sm sm:text-base border border-slate-500"
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Tambah Inquiry</span>
                    <span className="sm:hidden">Tambah</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-600 bg-opacity-50 hover:bg-opacity-70 text-white font-medium rounded-lg transition-all duration-200 text-sm sm:text-base border border-slate-500"
                >
                  <LogOut size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 backdrop-blur-sm rounded-t-2xl shadow-sm">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className={`${card.bgColor} ${card.borderColor} border p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                  {typeof card.value === 'number' && stats.totalInquiries > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {Math.round((card.value / stats.totalInquiries) * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1">
                  {card.title}
                </div>
                <div className={`text-xl sm:text-2xl font-bold ${card.color} mt-1`}>
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Inquiry Table */}
        <InquiryTable 
          openDetailModal={openDetailModal}
          setPreviewAttachment={setPreviewAttachment}
          openEditModal={openEditModal}
          openActionModal={openActionModal}
          openProcessModal={openProcessModal}
          openCompleteModal={openCompleteModal}
        />
      </main>

      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Detail Inquiry Modal */}
      <DetailInquiryModal
        isOpen={isDetailModalOpen}
        inquiry={selectedInquiry}
        onClose={closeDetailModal}
        onExportPDF={exportToPDF}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        attachment={previewAttachment}
        onClose={closePreview}
      />

      {/* Edit Inquiry Modal */}
      <EditInquiryModal
        isOpen={isEditModalOpen}
        inquiry={selectedInquiry}
        user={user}
        onClose={closeEditModal}
        onUpdate={updateInquiry}
      />

      {/* Action Modal */}
      <SimpleActionModal
        isOpen={isActionModalOpen}
        onClose={closeActionModal}
        inquiry={selectedInquiry}
        userRole={user?.role}
        actionType={actionType}
      />
    </div>
  );
};

export default Dashboard;