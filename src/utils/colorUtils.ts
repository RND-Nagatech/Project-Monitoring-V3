export const getStatusColor = (status: string): string => {
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

export const getTypeColor = (type: string | undefined): string => {
  switch (type) {
    case 'berbayar': return 'bg-blue-500 text-white border-blue-600';
    case 'gratis': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getDivisiColor = (divisi: string | undefined): string => {
  switch (divisi?.toLowerCase()) {
    case 'produksi': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'qc': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'finance': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'helpdesk': return 'bg-teal-100 text-teal-800 border-teal-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};