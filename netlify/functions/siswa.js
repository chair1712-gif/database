// API Backend untuk Data Siswa
let siswa = [
    {
        id: '1',
        nis: '2024001',
        nama: 'Ahmad Rizki',
        ttl: 'Jakarta, 15 Maret 2008',
        alamat: 'Jl. Merdeka No. 123',
        kota: 'Jakarta Pusat',
        kelas: '10 IPA 1',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
    },
    {
        id: '2',
        nis: '2024002',
        nama: 'Siti Nurhaliza',
        ttl: 'Bandung, 20 April 2008',
        alamat: 'Jl. Asia Afrika No. 45',
        kota: 'Bandung',
        kelas: '10 IPA 2',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z'
    },
    {
        id: '3',
        nis: '2023001',
        nama: 'Budi Santoso',
        ttl: 'Surabaya, 10 Januari 2007',
        alamat: 'Jl. Pahlawan No. 67',
        kota: 'Surabaya',
        kelas: '11 IPS 1',
        createdAt: '2024-01-15T11:30:00Z',
        updatedAt: '2024-01-15T11:30:00Z'
    }
];

exports.handler = async (event, context) => {
    const { httpMethod, path, body } = event;
    
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // GET /api/siswa - Ambil semua data
    if (httpMethod === 'GET' && path.endsWith('/siswa')) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(siswa)
        };
    }

    // GET /api/siswa/{id} - Ambil data spesifik
    if (httpMethod === 'GET' && path.includes('/siswa/')) {
        const id = path.split('/').pop();
        const dataSiswa = siswa.find(s => s.id === id);
        
        if (!dataSiswa) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Data siswa tidak ditemukan' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(dataSiswa)
        };
    }

    // POST /api/siswa - Tambah data baru
    if (httpMethod === 'POST' && path.endsWith('/siswa')) {
        try {
            const data = JSON.parse(body || '{}');
            
            // Validasi required fields
            if (!data.nis || !data.nama || !data.kelas) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'NIS, Nama, dan Kelas wajib diisi' 
                    })
                };
            }
            
            // Cek NIS duplikat
            if (siswa.some(s => s.nis === data.nis)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'NIS sudah terdaftar' 
                    })
                };
            }
            
            const newSiswa = {
                id: Date.now().toString(),
                nis: data.nis.trim(),
                nama: data.nama.trim(),
                ttl: data.ttl ? data.ttl.trim() : '',
                alamat: data.alamat ? data.alamat.trim() : '',
                kota: data.kota ? data.kota.trim() : '',
                kelas: data.kelas,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            siswa.push(newSiswa);
            
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(newSiswa)
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Format data tidak valid' })
            };
        }
    }

    // PUT /api/siswa/{id} - Update data
    if (httpMethod === 'PUT' && path.includes('/siswa/')) {
        try {
            const id = path.split('/').pop();
            const index = siswa.findIndex(s => s.id === id);
            
            if (index === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Data siswa tidak ditemukan' })
                };
            }
            
            const updates = JSON.parse(body || '{}');
            const currentData = siswa[index];
            
            // Cek NIS duplikat (kecuali untuk diri sendiri)
            if (updates.nis && updates.nis !== currentData.nis) {
                if (siswa.some(s => s.nis === updates.nis && s.id !== id)) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ 
                            error: 'NIS sudah digunakan oleh siswa lain' 
                        })
                    };
                }
            }
            
            // Update fields
            const updatedSiswa = {
                ...currentData,
                nis: updates.nis || currentData.nis,
                nama: updates.nama || currentData.nama,
                ttl: updates.ttl !== undefined ? updates.ttl : currentData.ttl,
                alamat: updates.alamat !== undefined ? updates.alamat : currentData.alamat,
                kota: updates.kota !== undefined ? updates.kota : currentData.kota,
                kelas: updates.kelas || currentData.kelas,
                updatedAt: new Date().toISOString()
            };
            
            siswa[index] = updatedSiswa;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(updatedSiswa)
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Format data tidak valid' })
            };
        }
    }

    // DELETE /api/siswa/{id} - Hapus data
    if (httpMethod === 'DELETE' && path.includes('/siswa/')) {
        const id = path.split('/').pop();
        const initialLength = siswa.length;
        
        siswa = siswa.filter(s => s.id !== id);
        
        if (siswa.length === initialLength) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Data siswa tidak ditemukan' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Data siswa berhasil dihapus',
                total: siswa.length 
            })
        };
    }

    // Route tidak ditemukan
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint tidak ditemukan' })
    };
};
