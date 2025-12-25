// API Siswa dengan Supabase Database
const { createClient } = require('@supabase/supabase-js');

// Ambil credentials dari environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // ===== GET ALL SISWA =====
    if (httpMethod === 'GET' && path.endsWith('/siswa')) {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || [])
      };
    }

    // ===== GET SINGLE SISWA =====
    if (httpMethod === 'GET' && path.includes('/siswa/')) {
      const id = path.split('/').pop();
      
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // ===== CREATE SISWA =====
    if (httpMethod === 'POST' && path.endsWith('/siswa')) {
      const siswaData = JSON.parse(body || '{}');
      
      // Validasi
      if (!siswaData.nis || !siswaData.nama || !siswaData.kelas) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'NIS, Nama, dan Kelas wajib diisi' 
          })
        };
      }

      // Cek NIS duplikat
      const { data: existing } = await supabase
        .from('siswa')
        .select('nis')
        .eq('nis', siswaData.nis)
        .single();

      if (existing) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'NIS sudah terdaftar' 
          })
        };
      }

      // Insert data
      const { data, error } = await supabase
        .from('siswa')
        .insert([{
          nis: siswaData.nis.trim(),
          nama: siswaData.nama.trim(),
          ttl: siswaData.ttl ? siswaData.ttl.trim() : null,
          alamat: siswaData.alamat ? siswaData.alamat.trim() : null,
          kota: siswaData.kota ? siswaData.kota.trim() : null,
          kelas: siswaData.kelas,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .single();

      if (error) throw error;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data)
      };
    }

    // ===== UPDATE SISWA =====
    if (httpMethod === 'PUT' && path.includes('/siswa/')) {
      const id = path.split('/').pop();
      const siswaData = JSON.parse(body || '{}');

      // Cek apakah siswa ada
      const { data: existing } = await supabase
        .from('siswa')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Data siswa tidak ditemukan' 
          })
        };
      }

      // Jika update NIS, cek duplikat
      if (siswaData.nis) {
        const { data: duplicate } = await supabase
          .from('siswa')
          .select('id')
          .eq('nis', siswaData.nis)
          .neq('id', id)
          .single();

        if (duplicate) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'NIS sudah digunakan oleh siswa lain' 
            })
          };
        }
      }

      // Update data
      const { data, error } = await supabase
        .from('siswa')
        .update({
          ...siswaData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // ===== DELETE SISWA =====
    if (httpMethod === 'DELETE' && path.includes('/siswa/')) {
      const id = path.split('/').pop();

      const { error } = await supabase
        .from('siswa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Data siswa berhasil dihapus' 
        })
      };
    }

    // ===== ENDPOINT TIDAK DITEMUKAN =====
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: 'Endpoint tidak ditemukan' 
      })
    };

  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Terjadi kesalahan server',
        details: error.message 
      })
    };
  }
};
