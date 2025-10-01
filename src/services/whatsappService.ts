import { Inquiry } from '../types';

export const handleFollowUp = (whatsappNumber: string, namaToko: string, inquiry: Inquiry) => {
  let biayaMsg = '';
  if (inquiry.type === 'berbayar') {
    biayaMsg = `Permintaan Anda dikenakan biaya sebesar ${inquiry.fee ? inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : '-'}.`;
  } else if (inquiry.type === 'gratis') {
    biayaMsg = 'Permintaan Anda tidak dikenakan biaya (gratis).';
  } else {
    biayaMsg = 'Status biaya permintaan Anda belum ditentukan.';
  }
  const statusMsg = inquiry.status
    ? `Status permintaan Anda saat ini: ${inquiry.status === 'progress' ? 'Sedang diproses' : inquiry.status === 'selesai' ? 'Sudah selesai' : inquiry.status === 'wait for payment' ? 'Menunggu pembayaran' : inquiry.status === 'on going QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'on progress QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'paid off' ? 'Sudah dibayar' : inquiry.status === 'ready for update' ? 'Siap untuk diupdate' : inquiry.status === 'pending' ? 'Masih dalam tahap pengajuan' : inquiry.status}.`
    : 'Status permintaan Anda belum ditentukan.';
  const message = `Halo ${namaToko},\n\n${biayaMsg}\n${statusMsg}\n\nTerima kasih telah menggunakan layanan kami.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};