import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import InquiryForm from './InquiryForm';
import InquiryTable from './InquiryTable';

const Dashboard: React.FC = () => {
  const { user, logout, inquiries } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);

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


  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      produksi: 'Produksi',
      qc: 'Quality Control',
      finance: 'Finance',
      helpdesk: 'Helpdesk',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-0 sm:h-16">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Monitoring Inquiry
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Selamat datang, {user?.name} ({getRoleDisplayName(user?.role || '')})
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {(user?.role === 'helpdesk' || user?.role === 'qc') && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                >
                  <span className="hidden xs:inline">Tambah Inquiry</span>
                  <span className="xs:hidden">Tambah</span>
                </button>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <LogOut size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border">
            <div className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Inquiry</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {stats.totalInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.pendingInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.progressInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Wait for Payment</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {stats.waitForPaymentInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Paid Off</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {stats.paidOffInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">On Going QA</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {stats.onGoingQAInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">On Progress QA</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {stats.onProgressQAInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Ready for Update</div>
            <div className="text-2xl font-bold text-cyan-600 mt-1">
              {stats.readyForUpdateInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.completedInquiries}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="text-sm font-medium text-gray-500">Cancelled</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats.cancelledInquiries}
            </div>
          </div>
        </div>

        {/* Inquiry Table */}
        <InquiryTable />
      </main>

      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default Dashboard;