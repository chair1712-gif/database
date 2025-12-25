 # Sistem Data Siswa

Aplikasi manajemen data siswa dengan CRUD API menggunakan Netlify Functions.

## 🎯 Fitur
- ✅ CRUD Lengkap (Create, Read, Update, Delete)
- ✅ Form input dengan validasi
- ✅ Pencarian real-time
- ✅ Filter berdasarkan kelas
- ✅ Statistik otomatis
- ✅ Responsive design
- ✅ API documentation in-app
- ✅ Modal konfirmasi hapus

## 📋 Field Data Siswa
1. **NIS** - Nomor Induk Siswa (unik)
2. **Nama Siswa** - Nama lengkap
3. **TTL** - Tempat, Tanggal Lahir
4. **Alamat** - Alamat lengkap
5. **Kota** - Kota tempat tinggal
6. **Kelas** - Pilihan: 10-12 IPA/IPS

## 🚀 Cara Menjalankan

### 1. Lokal Development
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Clone repository
git clone [repo-url]
cd sistem-siswa

# Jalankan lokal
netlify dev
