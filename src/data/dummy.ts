import { User, Inquiry } from '../types';

// ==========================================
// DUMMY USERS DATA
// ==========================================
export const dummyUsers: User[] = [
  { 
    user_id: 'prod001', 
    name: 'Ahmad Produksi', 
    role: 'produksi' 
  },
  { 
    user_id: 'qc001', 
    name: 'Sari QC', 
    role: 'qc' 
  },
  { 
    user_id: 'fin001', 
    name: 'Lita Finance', 
    role: 'finance' 
  },
  { 
    user_id: 'help001', 
    name: 'Lisa Helpdesk', 
    role: 'helpdesk' 
  },
];

// ==========================================
// DUMMY INQUIRIES DATA
// ==========================================
export const dummyInquiries: Inquiry[] = [
  // Inquiry 1 - Status: Pending
  {
    id: '1',
    nomor_whatsapp_customer: '081234567890',
    nama_toko: 'Toko Berkah Jaya',
    deskripsi: '<p>Membutuhkan sistem kasir untuk toko kelontong dengan fitur:</p><ul><li>Input barang dan harga</li><li>Cetak struk pembayaran</li><li>Laporan harian penjualan</li></ul>',
    status: 'pending',
    attachments: [],
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
    created_by: 'Lisa Helpdesk',
    edited_by: 'Lisa Helpdesk',
    edited_at: '2025-01-12T10:30:00Z',
  },

  // Inquiry 2 - Status: Progress, Type: Berbayar
  {
    id: '2',
    nomor_whatsapp_customer: '081987654321',
    nama_toko: 'Warung Makan Sederhana',
    deskripsi: '<p>Ingin aplikasi mobile untuk menu dan pemesanan online dengan fitur:</p><ul><li>Tampilan menu makanan</li><li>Keranjang belanja</li><li>Pembayaran online</li><li>Notifikasi pesanan</li></ul>',
    status: 'progress',
    type: 'berbayar',
    fee: 5000000,
    divisi: 'produksi',
    divisi_notes: 'Sedang dalam tahap development. Progress 60% - UI sudah selesai, tinggal integrasi backend.',
    attachments: [
      {
        id: 'att1',
        name: 'proposal.pdf',
        url: 'https://example.com/proposal.pdf',
        type: 'pdf'
      }
    ],
    created_at: '2025-01-09T10:30:00Z',
    updated_at: '2025-01-10T14:00:00Z',
    created_by: 'Lisa Helpdesk',
    produksi_by: 'Ahmad Produksi',
  },

  // Inquiry 3 - Status: Selesai, Type: Berbayar
  {
    id: '3',
    nomor_whatsapp_customer: '081555666777',
    nama_toko: 'Fashion Store Modern',
    deskripsi: '<p>Website e-commerce dengan fitur pembayaran online untuk toko fashion:</p><ul><li>Katalog produk dengan kategori</li><li>Sistem pembayaran terintegrasi</li><li>Dashboard admin untuk manajemen produk</li><li>Responsive design</li></ul>',
    status: 'selesai',
    type: 'berbayar',
    fee: 8500000,
    divisi: 'qc',
    divisi_notes: 'Project telah selesai dan diterima klien. Semua fitur berfungsi dengan baik dan telah melalui testing lengkap.',
    attachments: [
      {
        id: 'att2',
        name: 'final-report.pdf',
        url: 'https://example.com/final-report.pdf',
        type: 'pdf'
      },
      {
        id: 'att3',
        name: 'screenshot.jpg',
        url: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
        type: 'image'
      }
    ],
    created_at: '2025-01-05T09:15:00Z',
    updated_at: '2025-01-10T16:30:00Z',
    created_by: 'Lisa Helpdesk',
    produksi_by: 'Ahmad Produksi',
    qc_by: 'Sari QC',
    finance_by: 'Lita Finance',
  },

  // Inquiry 4 - Status: Pending, Type: Gratis
  {
    id: '4',
    nomor_whatsapp_customer: '081333444555',
    nama_toko: 'Bengkel Motor Jaya',
    deskripsi: '<p>Membutuhkan sistem sederhana untuk pencatatan service motor:</p><ul><li>Data pelanggan dan motor</li><li>Riwayat service</li><li>Reminder service berkala</li></ul><p>Project ini untuk usaha kecil dengan budget terbatas.</p>',
    status: 'pending',
    type: 'gratis',
    attachments: [],
    created_at: '2025-01-11T09:00:00Z',
    updated_at: '2025-01-11T09:00:00Z',
    created_by: 'Lisa Helpdesk',
  },

  // Inquiry 5 - Status: Progress, Type: Gratis
  {
    id: '5',
    nomor_whatsapp_customer: '081777888999',
    nama_toko: 'Perpustakaan Desa Makmur',
    deskripsi: '<p>Aplikasi manajemen perpustakaan sederhana untuk perpustakaan desa:</p><ul><li>Database buku dan anggota</li><li>Sistem peminjaman dan pengembalian</li><li>Laporan bulanan</li></ul><p>Ini adalah project CSR untuk membantu perpustakaan desa.</p>',
    status: 'progress',
    type: 'gratis',
    divisi: 'produksi',
    divisi_notes: 'Project CSR sedang dikerjakan oleh tim volunteer. Progress 30%.',
    attachments: [],
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-11T10:00:00Z',
    created_by: 'Lisa Helpdesk',
    produksi_by: 'Ahmad Produksi',
  },

  // Inquiry 6 - Status: On Progress QA
  {
    id: '6',
    nomor_whatsapp_customer: '081999123456',
    nama_toko: 'Warung Makan Bu Sari',
    deskripsi: '<p>Sistem order makanan online untuk warung makan:</p><ul><li>Menu digital dengan foto makanan</li><li>Sistem order dan pembayaran</li><li>Notifikasi WhatsApp otomatis</li></ul><p>Target selesai minggu depan untuk soft opening.</p>',
    status: 'on progress QA',
    type: 'berbayar',
    fee: 2500000,
    divisi: 'qc',
    divisi_notes: 'Sedang dalam tahap quality assurance, testing fitur payment gateway.',
    attachments: [],
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-14T14:30:00Z',
    created_by: 'Lisa Helpdesk',
    produksi_by: 'Ahmad Produksi',
    qc_by: 'Sari QC',
  },
];