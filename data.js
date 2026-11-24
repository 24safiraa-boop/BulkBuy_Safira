/* ==========================================================
   BulkBuy — data contoh prototype
   Semua data di file ini adalah simulasi, bukan data nyata.
   ========================================================== */

const BB_PRODUCTS = [
  {
    id: 'p1',
    name: 'Minyak Goreng Premium 2L',
    emoji: '🛢️',
    category: 'Sembako',
    supplier: 'Sumber Pangan Jaya',
    price: 28500,
    retailPrice: 32000,
    unit: 'pcs',
    target: 100,
    collected: 72,
    deadline: '2026-11-26',
    description: 'Minyak goreng premium kemasan 2 liter untuk kebutuhan produksi dan operasional usaha kuliner. Cocok untuk UMKM bakery, warung makan, dan katering.',
    specs: {
      'Kemasan': 'Botol 2 liter',
      'Isi': '2.000 ml',
      'Kondisi': 'Baru dan tersegel',
      'Asal': 'Medan, Sumatera Utara',
      'Sertifikasi': 'BPOM & Halal'
    },
    shipping: 'Estimasi 2–4 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p2',
    name: 'Cup Plastik 16 oz (1.000 pcs)',
    emoji: '🥤',
    category: 'Kemasan',
    supplier: 'Kemasan Kita',
    price: 165000,
    retailPrice: 185000,
    unit: 'karton',
    target: 20,
    collected: 17,
    deadline: '2026-11-25',
    description: 'Cup plastik bening 16 oz food grade untuk usaha minuman dan take away. Praktis, ringan, dan cocok untuk kemasan es kopi, teh, maupun jus.',
    specs: {
      'Isi': '1.000 pcs per karton',
      'Bahan': 'PP food grade',
      'Ukuran': '16 oz (± 480 ml)',
      'Warna': 'Bening',
      'Tutup': 'Dijual terpisah'
    },
    shipping: 'Estimasi 3–5 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p3',
    name: 'Tepung Terigu 25 kg',
    emoji: '🌾',
    category: 'Bahan Makanan',
    supplier: 'Mitra Tepung Nusantara',
    price: 235000,
    retailPrice: 265000,
    unit: 'karung',
    target: 30,
    collected: 12,
    deadline: '2026-11-29',
    description: 'Tepung terigu protein tinggi untuk produksi roti, kue, dan aneka makanan. Kemasan karung 25 kg dengan kualitas konsisten untuk kebutuhan usaha.',
    specs: {
      'Berat': '25 kg',
      'Kandungan protein': 'Tinggi (11–12%)',
      'Kemasan': 'Karung',
      'Kondisi': 'Baru',
      'Penyimpanan': 'Tempat kering dan sejuk'
    },
    shipping: 'Estimasi 2–4 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p4',
    name: 'Gula Pasir 1 kg',
    emoji: '🍚',
    category: 'Sembako',
    supplier: 'Toko Pangan Makmur',
    price: 15800,
    retailPrice: 18000,
    unit: 'pcs',
    target: 150,
    collected: 96,
    deadline: '2026-11-27',
    description: 'Gula pasir kemasan 1 kg untuk kebutuhan produksi kue, minuman, dan masakan sehari-hari. Harga grosir lebih hemat untuk pembelian kolektif.',
    specs: {
      'Kemasan': 'Plastik 1 kg',
      'Jenis': 'Gula pasir kristal putih',
      'Kondisi': 'Baru',
      'Asal': 'Lampung',
      'Penyimpanan': 'Tempat kering'
    },
    shipping: 'Estimasi 2–4 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p5',
    name: 'Botol Plastik 500 ml',
    emoji: '🧴',
    category: 'Kemasan',
    supplier: 'Botol Jaya',
    price: 120000,
    retailPrice: 138000,
    unit: 'karton',
    target: 15,
    collected: 8,
    deadline: '2026-11-28',
    description: 'Botol plastik PET 500 ml lengkap dengan tutup untuk produk minuman. Cocok untuk usaha jus, sirup, dan minuman kemasan rumahan.',
    specs: {
      'Isi': '48 pcs per karton',
      'Volume': '500 ml',
      'Bahan': 'PET food grade',
      'Tutup': 'Termasuk',
      'Warna': 'Bening'
    },
    shipping: 'Estimasi 3–5 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p6',
    name: 'Kopi Bubuk 1 kg',
    emoji: '☕',
    category: 'Minuman',
    supplier: 'Kopi Aceh Supply',
    price: 98000,
    retailPrice: 115000,
    unit: 'pak',
    target: 25,
    collected: 21,
    deadline: '2026-11-25',
    description: 'Kopi bubuk robusta-arabika untuk warung kopi dan usaha minuman. Aroma kuat dengan rasa seimbang, dikemas dalam paket 1 kg.',
    specs: {
      'Berat': '1 kg',
      'Jenis': 'Robusta–Arabika',
      'Gilingan': 'Medium',
      'Kemasan': 'Pak aluminium foil',
      'Asal': 'Aceh'
    },
    shipping: 'Estimasi 2–3 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p7',
    name: 'Sarung Tangan Plastik (1.000 pcs)',
    emoji: '🧤',
    category: 'Peralatan',
    supplier: 'Perlengkapan Usaha Prima',
    price: 45000,
    retailPrice: 55000,
    unit: 'karton',
    target: 40,
    collected: 40,
    deadline: '2026-11-26',
    description: 'Sarung tangan plastik sekali pakai untuk menjaga higienitas saat menyiapkan makanan. Cocok untuk dapur produksi, katering, dan pelayanan makanan.',
    specs: {
      'Isi': '1.000 pcs per karton',
      'Bahan': 'HDPE food grade',
      'Ukuran': 'S–M (all size)',
      'Warna': 'Bening',
      'Kondisi': 'Baru'
    },
    shipping: 'Estimasi 3–5 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p8',
    name: 'Plastik Wrap 30 cm',
    emoji: '🎞️',
    category: 'Peralatan',
    supplier: 'Kemasan Kita',
    price: 38000,
    retailPrice: 46000,
    unit: 'roll',
    target: 50,
    collected: 18,
    deadline: '2026-11-30',
    description: 'Plastik wrap lebar 30 cm untuk menutup dan menyimpan bahan makanan agar tetap segar. Praktis digunakan di dapur produksi maupun display produk.',
    specs: {
      'Lebar': '30 cm',
      'Panjang': '± 300 meter',
      'Bahan': 'PE food grade',
      'Kemasan': 'Roll',
      'Kondisi': 'Baru'
    },
    shipping: 'Estimasi 3–5 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p9',
    name: 'Sirup Gula 1 Liter',
    emoji: '🧃',
    category: 'Minuman',
    supplier: 'Kopi Aceh Supply',
    price: 27000,
    retailPrice: 32000,
    unit: 'botol',
    target: 60,
    collected: 27,
    deadline: '2026-11-29',
    description: 'Sirup gula cair kemasan 1 liter untuk campuran minuman, kopi, dan dessert. Larut dengan mudah dan praktis untuk operasional usaha minuman.',
    specs: {
      'Volume': '1 liter',
      'Jenis': 'Sirup gula cair',
      'Kemasan': 'Botol plastik',
      'Kondisi': 'Baru',
      'Penyimpanan': 'Suhu ruang'
    },
    shipping: 'Estimasi 2–4 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p10',
    name: 'Beras Premium 5 kg',
    emoji: '🍙',
    category: 'Sembako',
    supplier: 'Toko Pangan Makmur',
    price: 68000,
    retailPrice: 78000,
    unit: 'karung',
    target: 80,
    collected: 68,
    deadline: '2026-11-27',
    description: 'Beras premium kemasan 5 kg dengan bulir pulen dan bersih. Cocok untuk kebutuhan warung makan, katering, dan penjualan eceran.',
    specs: {
      'Berat': '5 kg',
      'Jenis': 'Beras premium',
      'Kemasan': 'Karung plastik',
      'Kondisi': 'Baru',
      'Asal': 'Sulawesi Selatan'
    },
    shipping: 'Estimasi 2–4 hari kerja setelah target grup tercapai.'
  },
  {
    id: 'p11',
    name: 'Tissue Gulung (10 roll)',
    emoji: '🧻',
    category: 'Lainnya',
    supplier: 'Kebersihan Nusantara',
    price: 32000,
    retailPrice: 39000,
    unit: 'pak',
    target: 100,
    collected: 35,
    deadline: '2026-11-30',
    description: 'Tissue gulung isi 10 roll untuk kebutuhan operasional usaha, restoran, dan area pelanggan. Lembut, kuat, dan mudah disobek.',
    specs: {
      'Isi': '10 roll per pak',
      'Lembar': '200 sheet per roll',
      'Bahan': '2 ply',
      'Warna': 'Putih',
      'Kondisi': 'Baru'
    },
    shipping: 'Estimasi 3–5 hari kerja setelah target grup tercapai.'
  }
];

/* Pesanan contoh. Status: target | payment | process | shipped | done | cancelled */
const BB_ORDERS = [
  {
    id: 'BB-2401',
    productId: 'p1',
    qty: 20,
    status: 'target',
    date: '2026-11-22'
  },
  {
    id: 'BB-2398',
    productId: 'p2',
    qty: 2,
    status: 'target',
    date: '2026-11-23'
  },
  {
    id: 'BB-2385',
    productId: 'p7',
    qty: 5,
    status: 'payment',
    date: '2026-11-21',
    groupTarget: 40,
    groupCollected: 40,
    groupDeadline: '2026-11-26',
    shipping: 30000,
    fee: 2500
  },
  {
    id: 'BB-2370',
    productId: 'p3',
    qty: 3,
    status: 'process',
    date: '2026-11-20',
    groupTarget: 30,
    groupCollected: 30,
    groupDeadline: '2026-11-22',
    shipping: 25000,
    fee: 2000,
    payment: {
      method: 'Transfer Bank',
      trx: 'TRX-20261120-2370',
      date: '2026-11-20',
      total: 732000
    }
  },
  {
    id: 'BB-2355',
    productId: 'p6',
    qty: 2,
    status: 'shipped',
    date: '2026-11-18',
    groupTarget: 25,
    groupCollected: 25,
    groupDeadline: '2026-11-20',
    shipping: 20000,
    fee: 2000,
    payment: {
      method: 'Virtual Account',
      trx: 'TRX-20261118-2355',
      date: '2026-11-18',
      total: 218000
    },
    tracking: {
      courier: 'JNE Trucking',
      service: 'REG',
      resi: 'JNE-8821-4402-117',
      eta: '26 Nov 2026',
      address: 'Jl. Usaha Kecil No. 12, Banda Aceh'
    }
  },
  {
    id: 'BB-2314',
    productId: 'p4',
    qty: 10,
    status: 'done',
    date: '2026-11-12',
    completedDate: '2026-11-18',
    groupTarget: 150,
    groupCollected: 150,
    groupDeadline: '2026-11-15',
    shipping: 18000,
    fee: 2000,
    payment: {
      method: 'E-wallet',
      trx: 'TRX-20261112-2314',
      date: '2026-11-12',
      total: 178000
    },
    tracking: {
      courier: 'SiCepat',
      service: 'REG',
      resi: 'SC-7712-0093-441',
      eta: 'Sudah diterima 18 Nov 2026',
      address: 'Jl. Usaha Kecil No. 12, Banda Aceh'
    }
  },
  {
    id: 'BB-2290',
    productId: 'p5',
    qty: 1,
    status: 'done',
    date: '2026-11-10',
    completedDate: '2026-11-15',
    groupTarget: 15,
    groupCollected: 15,
    groupDeadline: '2026-11-12',
    shipping: 25000,
    fee: 2000,
    payment: {
      method: 'Transfer Bank',
      trx: 'TRX-20261110-2290',
      date: '2026-11-10',
      total: 147000
    },
    tracking: {
      courier: 'J&T Express',
      service: 'EZ',
      resi: 'JT-3320-8871-002',
      eta: 'Sudah diterima 15 Nov 2026',
      address: 'Jl. Usaha Kecil No. 12, Banda Aceh'
    }
  },
  {
    id: 'BB-2270',
    productId: 'p11',
    qty: 4,
    status: 'cancelled',
    date: '2026-11-08',
    cancelReason: 'Grup tidak mencapai target MOQ sebelum batas waktu.',
    groupTarget: 100,
    groupCollected: 62,
    groupDeadline: '2026-11-14',
    shipping: 0,
    fee: 0
  }
];

const BB_PROFILE = {
  owner: 'Sari Rahma',
  business: 'Sari Roti UMKM',
  type: 'Bakery / Toko Roti',
  phone: '0812-3456-7890',
  email: 'sari.umkm@email.com',
  city: 'Banda Aceh',
  address: 'Jl. Usaha Kecil No. 12, Banda Aceh',
  description: 'Usaha roti dan kue rumahan yang melayani pesanan harian, hampers, dan snack box untuk wilayah Banda Aceh.',
  avatar: ''
};

const BB_FAQS = [
  {
    category: 'Mulai Belanja',
    question: 'Apa itu BulkBuy?',
    answer: 'BulkBuy adalah platform pengadaan grosir berbasis pembelian kolektif. UMKM dapat menggabungkan pesanan dengan usaha lain agar memenuhi minimum order supplier dan memperoleh harga grosir yang lebih murah.'
  },
  {
    category: 'Mulai Belanja',
    question: 'Bagaimana cara mencari produk grosir?',
    answer: 'Buka menu Produk Grosir, lalu gunakan kolom pencarian atau filter kategori, supplier, harga, dan status grup. Tekan Detail Produk untuk melihat informasi lengkap sebelum bergabung.'
  },
  {
    category: 'Mulai Belanja',
    question: 'Apakah saya harus menjadi penjual untuk berbelanja?',
    answer: 'Tidak. Akun pembeli UMKM dapat langsung berbelanja dan bergabung dengan grup pembelian. Informasi jenis usaha pada profil digunakan untuk pengalaman belanja yang lebih relevan.'
  },
  {
    category: 'Pembelian Bersama',
    question: 'Apa yang dimaksud MOQ?',
    answer: 'MOQ (Minimum Order Quantity) adalah jumlah minimum barang yang harus dipesan agar supplier menerima pesanan atau memberikan harga grosir. Pada BulkBuy, jumlah seluruh peserta grup digabungkan untuk mencapai MOQ tersebut.'
  },
  {
    category: 'Pembelian Bersama',
    question: 'Bagaimana cara bergabung dengan grup pembelian?',
    answer: 'Pilih produk dengan grup aktif, tekan Gabung Grup, lalu tentukan jumlah yang ingin dipesan. Sistem akan menampilkan estimasi biaya sebelum Anda mengonfirmasi. Pesanan Anda otomatis digabungkan dengan peserta lain.'
  },
  {
    category: 'Pembelian Bersama',
    question: 'Apa yang terjadi jika target grup tidak tercapai?',
    answer: 'Jika target belum tercapai sampai batas waktu, grup dinyatakan gagal. Pesanan kolektif tidak dilanjutkan dan pembayaran yang sudah dilakukan mengikuti kebijakan pengembalian dana platform. Pada prototype ini, seluruh alur merupakan simulasi.'
  },
  {
    category: 'Pembelian Bersama',
    question: 'Bisakah saya membuat grup pembelian sendiri?',
    answer: 'Bisa. Buka menu Pembelian Bersama lalu tekan Buat Pembelian Bersama. Isi produk, target jumlah, harga estimasi, dan batas waktu. Grup Anda akan tampil di daftar grup dan dapat diikuti UMKM lain.'
  },
  {
    category: 'Pesanan',
    question: 'Bagaimana cara melihat status pesanan?',
    answer: 'Buka menu Pesanan Saya. Setiap pesanan menampilkan status, jumlah, total, serta progres grup. Tekan Detail Pesanan untuk melihat timeline dan informasi pembayaran maupun pengiriman.'
  },
  {
    category: 'Pesanan',
    question: 'Apakah saya bisa membatalkan pesanan?',
    answer: 'Pesanan yang masih menunggu target dapat dibatalkan sesuai kebijakan grup. Setelah target tercapai dan pembayaran dilakukan, pembatalan mengikuti kebijakan supplier dan platform. Untuk kebutuhan khusus, hubungi Pusat Bantuan.'
  },
  {
    category: 'Pembayaran',
    question: 'Kapan saya harus melakukan pembayaran?',
    answer: 'Pembayaran dilakukan setelah grup mencapai target MOQ. Pesanan akan berstatus Menunggu Pembayaran dan halaman pembayaran menampilkan batas waktu serta instruksi sesuai metode yang dipilih.'
  },
  {
    category: 'Pembayaran',
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Tersedia transfer bank, Virtual Account, dan e-wallet. Pada prototype ini, seluruh proses pembayaran adalah simulasi dan tidak memproses uang sungguhan.'
  },
  {
    category: 'Pengiriman',
    question: 'Berapa lama estimasi pengiriman pesanan?',
    answer: 'Estimasi pengiriman berkisar 2–5 hari kerja setelah target grup tercapai dan pembayaran dikonfirmasi. Waktu dapat berbeda tergantung supplier, lokasi, dan jasa pengiriman yang digunakan.'
  },
  {
    category: 'Pengiriman',
    question: 'Bagaimana cara melacak pengiriman?',
    answer: 'Setelah pesanan dikirim, buka Detail Pesanan untuk melihat nama kurir, nomor resi, dan estimasi tiba. Status pesanan juga berubah menjadi Dikirim pada halaman Pesanan Saya.'
  },
  {
    category: 'Akun',
    question: 'Bagaimana cara mengubah data usaha saya?',
    answer: 'Buka Profil UMKM, tekan Edit Profil, lalu perbarui informasi usaha, kontak, atau alamat. Tekan Simpan Perubahan setelah memastikan data sudah benar.'
  },
  {
    category: 'Akun',
    question: 'Bagaimana cara mengubah kata sandi?',
    answer: 'Buka Profil UMKM dan pilih Ubah Kata Sandi pada bagian Pengaturan Akun. Masukkan kata sandi saat ini, kata sandi baru, lalu konfirmasi. Pada prototype, perubahan kata sandi hanya disimulasikan.'
  }
];

const BB_GUIDES = [
  {
    icon: '🤝',
    title: 'Panduan bergabung ke grup',
    steps: [
      'Buka Produk Grosir atau Pembelian Bersama, lalu pilih produk yang sesuai kebutuhan usaha.',
      'Periksa harga grosir, MOQ, sisa waktu, dan progres grup pada kartu produk.',
      'Tekan Gabung Grup, atur jumlah pesanan, dan cek estimasi subtotal.',
      'Tekan Konfirmasi Bergabung. Pesanan Anda akan muncul di halaman Pesanan Saya.'
    ]
  },
  {
    icon: '📣',
    title: 'Panduan membuat grup pembelian',
    steps: [
      'Buka Pembelian Bersama dan tekan tombol Buat Pembelian Bersama.',
      'Lengkapi nama produk, kategori, target jumlah, harga estimasi, dan batas waktu.',
      'Periksa ringkasan grup di sisi kanan, lalu tekan Buat Grup.',
      'Bagikan grup Anda agar UMKM lain dapat bergabung hingga target MOQ tercapai.'
    ]
  },
  {
    icon: '💳',
    title: 'Panduan pembayaran & pelacakan',
    steps: [
      'Tunggu hingga grup mencapai target MOQ. Status pesanan berubah menjadi Menunggu Pembayaran.',
      'Buka Detail Pesanan lalu tekan Lakukan Pembayaran.',
      'Pilih metode pembayaran, periksa total, dan tekan Bayar Sekarang (simulasi).',
      'Pantau status Diproses dan Dikirim melalui Pesanan Saya, serta lihat resi pada Detail Pesanan.'
    ]
  }
];

window.BB_DATA = {
  products: BB_PRODUCTS,
  orders: BB_ORDERS,
  profile: BB_PROFILE,
  faqs: BB_FAQS,
  guides: BB_GUIDES,
  categories: ['Bahan Makanan', 'Minuman', 'Kemasan', 'Sembako', 'Peralatan', 'Lainnya'],
  categoryEmoji: {
    'Bahan Makanan': '🥫',
    'Minuman': '🥤',
    'Kemasan': '📦',
    'Sembako': '🍚',
    'Peralatan': '🍳',
    'Lainnya': '🧺'
  }
};
