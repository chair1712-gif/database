// Konfigurasi API
const API_BASE_URL = window.location.origin.includes('netlify')
    ? window.location.origin + '/.netlify/functions'
    : 'http://localhost:8888/.netlify/functions';

const API_URL = `${API_BASE_URL}/siswa`;
let siswaToDelete = null;
let isEditing = false;
let currentEditId = null;
let currentFilter = 'all';
let allSiswa = [];

// DOM Elements
const siswaForm = document.getElementById('siswaForm');
const nisInput = document.getElementById('nis');
const namaInput = document.getElementById('nama');
const ttlInput = document.getElementById('ttl');
const alamatInput = document.getElementById('alamat');
const kotaInput = document.getElementById('kota');
const kelasInput = document.getElementById('kelas');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const siswaTableBody = document.getElementById('siswaTableBody');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const apiUrl = document.getElementById('apiUrl');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const filterButtons = document.querySelectorAll('.filter-btn');

// Statistics elements
const totalSiswa = document.getElementById('totalSiswa');
const kelas10 = document.getElementById('kelas10');
const kelas11 = document.getElementById('kelas11');
const kelas12 = document.getElementById('kelas12');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    loadSiswa();
    setupEventListeners();
    apiUrl.textContent = API_URL;
    updateTimestamp();
});

// Cek status API
async function checkAPIStatus() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            statusDot.classList.add('connected');
            statusText.textContent = 'API Terhubung';
        } else {
            statusDot.classList.add('disconnected');
            statusText.textContent = 'API Bermasalah';
        }
    } catch (error) {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'API Tidak Terhubung';
        console.error('API Error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    siswaForm.addEventListener('submit', handleSubmit);
    
    // Cancel edit
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Search input
    searchInput.addEventListener('input', filterSiswa);
    
    // Modal buttons
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
        siswaToDelete = null;
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterSiswa();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
            siswaToDelete = null;
        }
    });
}

// Load semua data siswa
async function loadSiswa() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data');
        
        allSiswa = await response.json();
        filterSiswa();
        updateStatistics();
    } catch (error) {
        showError('Gagal memuat data dari API');
        console.error('Load error:', error);
    }
}

// Filter dan tampilkan siswa
function filterSiswa() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredSiswa = allSiswa.filter(siswa => {
        // Filter berdasarkan kelas
        if (currentFilter !== 'all') {
            if (!siswa.kelas.startsWith(currentFilter)) return false;
        }
        
        // Filter berdasarkan search term
        if (searchTerm) {
            return (
                siswa.nis.toLowerCase().includes(searchTerm) ||
                siswa.nama.toLowerCase().includes(searchTerm) ||
                siswa.kelas.toLowerCase().includes(searchTerm) ||
                (siswa.kota && siswa.kota.toLowerCase().includes(searchTerm))
            );
        }
        
        return true;
    });
    
    displaySiswa(filteredSiswa);
    updateStatistics();
}

// Tampilkan data di tabel
function displaySiswa(siswaList) {
    if (siswaList.length === 0) {
        siswaTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Tidak ada data siswa yang ditemukan</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    siswaTableBody.innerHTML = siswaList.map((siswa, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(siswa.nis)}</strong></td>
            <td>${escapeHtml(siswa.nama)}</td>
            <td>${siswa.ttl ? escapeHtml(siswa.ttl) : '-'}</td>
            <td>${siswa.alamat ? escapeHtml(siswa.alamat) : '-'}</td>
            <td>${siswa.kota ? escapeHtml(siswa.kota) : '-'}</td>
            <td><span class="kelas-badge">${escapeHtml(siswa.kelas)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editSiswa('${siswa.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="showDeleteModal('${siswa.id}', '${escapeHtml(siswa.nama)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStatistics() {
    const total = allSiswa.length;
    const countKelas10 = allSiswa.filter(s => s.kelas.startsWith('10')).length;
    const countKelas11 = allSiswa.filter(s => s.kelas.startsWith('11')).length;
    const countKelas12 = allSiswa.filter(s => s.kelas.startsWith('12')).length;
    
    totalSiswa.textContent = total;
    kelas10.textContent = countKelas10;
    kelas11.textContent = countKelas11;
    kelas12.textContent = countKelas12;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const siswaData = {
        nis: nisInput.value.trim(),
        nama: namaInput.value.trim(),
        ttl: ttlInput.value.trim(),
        alamat: alamatInput.value.trim(),
        kota: kotaInput.value.trim(),
        kelas: kelasInput.value
    };
    
    // Validasi
    if (!siswaData.nis || !siswaData.nama || !siswaData.kelas) {
        showError('NIS, Nama, dan Kelas wajib diisi!');
        return;
    }
    
    try {
        if (isEditing) {
            // Update existing siswa
            const response = await fetch(`${API_URL}/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(siswaData)
            });
            
            if (!response.ok) throw new Error('Gagal mengupdate data');
            
            showSuccess('Data siswa berhasil diupdate!');
            cancelEdit();
        } else {
            // Add new siswa
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(siswaData)
            });
            
            if (!response.ok) throw new Error('Gagal menambah data');
            
            showSuccess('Data siswa berhasil ditambahkan!');
            resetForm();
        }
        
        loadSiswa();
    } catch (error) {
        showError(`Gagal ${isEditing ? 'mengupdate' : 'menambah'} data`);
        console.error('Submit error:', error);
    }
}

// Edit siswa
async function editSiswa(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil data');
        
        const siswa = await response.json();
        
        // Fill form with data
        nisInput.value = siswa.nis;
        namaInput.value = siswa.nama;
        ttlInput.value = siswa.ttl || '';
        alamatInput.value = siswa.alamat || '';
        kotaInput.value = siswa.kota || '';
        kelasInput.value = siswa.kelas;
        
        // Change to edit mode
        isEditing = true;
        currentEditId = id;
        submitBtn.innerHTML = '<i class="fas fa-edit"></i> Update Data';
        cancelBtn.style.display = 'flex';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError('Gagal mengambil data untuk edit');
        console.error('Edit error:', error);
    }
}

// Cancel edit
function cancelEdit() {
    isEditing = false;
    currentEditId = null;
    resetForm();
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    cancelBtn.style.display = 'none';
}

// Reset form
function resetForm() {
    siswaForm.reset();
    nisInput.focus();
}

// Show delete confirmation modal
function showDeleteModal(id, nama) {
    siswaToDelete = id;
    deleteModal.style.display = 'flex';
    deleteModal.querySelector('p').innerHTML = `Apakah Anda yakin ingin menghapus data siswa: <strong>${nama}</strong>?`;
}

// Confirm delete
async function confirmDelete() {
    if (!siswaToDelete) return;
    
    try {
        const response = await fetch(`${API_URL}/${siswaToDelete}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Gagal menghapus data');
        
        showSuccess('Data siswa berhasil dihapus!');
        loadSiswa();
    } catch (error) {
        showError('Gagal menghapus data');
        console.error('Delete error:', error);
    }
    
    deleteModal.style.display = 'none';
    siswaToDelete = null;
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('lastUpdate').textContent = 
        `Terakhir update: ${now.toLocaleDateString('id-ID', options)}`;
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
    updateTimestamp();
}
