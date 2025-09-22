export interface User {
  user_id: string;
  name: string;
  role: 'produksi' | 'qc' | 'finance' | 'helpdesk';
}

export interface Inquiry {
  id: string;
  nomor_whatsapp_customer: string;
  nama_toko: string;
  deskripsi: string;
  status: 'pending' | 'progress' | 'selesai' | 'batal' | 'wait for payment' | 'on going QA' | 'on progress QA' | 'paid off' | 'ready for update';
  type?: 'berbayar' | 'gratis';
  fee?: number;
  divisi?: string;
  divisi_notes?: string;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  created_by?: string; // User name who created the inquiry
  qc_by?: string; // User name who did QC
  produksi_by?: string; // User name who did production
  finance_by?: string; // User name who did finance
  helpdesk_by?: string; // User name who did helpdesk (cancellation)
  edited_by?: string; // User name who last edited the inquiry
  edited_at?: string; // Date when inquiry was last edited
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image';
}