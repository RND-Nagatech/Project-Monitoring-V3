import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Inquiry } from '../types';

interface ActionMenuProps {
  inquiry: Inquiry;
  userRole: string;
  selectedActionInquiryId: string | null;
  setSelectedActionInquiryId: (id: string | null) => void;
  onEdit: (inquiry: Inquiry) => void;
  onAction: (inquiry: Inquiry, actionType?: string) => void;
  onFollowUp: (inquiry: Inquiry) => void;
  onProcess: (inquiry: Inquiry) => void;
  onComplete: (inquiry: Inquiry) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  inquiry,
  userRole,
  selectedActionInquiryId,
  setSelectedActionInquiryId,
  onEdit,
  onAction,
  onFollowUp,
  onProcess,
  onComplete,
}) => {

  return (
    <div className="relative flex items-center justify-center">
      <button
        className="action-menu-button p-1 sm:p-2 text-gray-400 hover:text-blue-600 rounded-full transition-colors focus:outline-none"
        title="Aksi"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const newId = inquiry.id === selectedActionInquiryId ? null : inquiry.id;
          setSelectedActionInquiryId(newId);
        }}
      >
        <MoreVertical size={16} className="sm:w-5 sm:h-5" />
      </button>

      {selectedActionInquiryId === inquiry.id && (
        <div className="action-menu-dropdown absolute right-0 mt-2 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fadeIn flex flex-col py-2">
          {userRole === 'helpdesk' && (
            <>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                    onEdit(inquiry);
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                    onAction(inquiry, 'selesai');
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                Selesai
              </button>
              <button
                onClick={() => {
                  onAction(inquiry);
                  setSelectedActionInquiryId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal') {
                    onFollowUp(inquiry);
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                Follow Up
              </button>
            </>
          )}
          {userRole === 'produksi' && (
            <>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                    onAction(inquiry);
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  if (
                    inquiry.status !== 'batal' &&
                    inquiry.status !== 'selesai' &&
                    inquiry.status !== 'progress' &&
                    inquiry.status !== 'wait for payment'
                  ) {
                    onProcess(inquiry);
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              >
                Proses
              </button>
              <button
                onClick={() => {
                  if (inquiry.status === 'progress') {
                    onComplete(inquiry);
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                Selesai
              </button>
            </>
          )}
          {userRole === 'qc' && (
            <>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                    onAction(inquiry, 'proses');
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Proses
              </button>
              <button
                onClick={() => {
                  onAction(inquiry);
                  setSelectedActionInquiryId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                    onAction(inquiry, 'selesai');
                    setSelectedActionInquiryId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                Selesai
              </button>
            </>
          )}
          {userRole === 'finance' && (
            <button
              onClick={() => {
                if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') {
                  onAction(inquiry);
                  setSelectedActionInquiryId(null);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              Update
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
