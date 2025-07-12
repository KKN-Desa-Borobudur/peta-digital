// Peta Digital Desa Borobudur - JavaScript Application

class PetaDigitalDesa {
  constructor() {
    this.map = null;
    this.villagesData = [];
    this.currentDusun = null;
    this.filteredUMKM = [];

    // Pagination properties
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 0;

    // Koordinat default Desa Borobudur
    this.defaultCoordinates = [-7.6088, 110.2037];

    this.init();
  }

  async init() {
    try {
      // Inisialisasi peta
      this.initMap();

      // Load data dusun
      await this.loadVillagesData();

      // Setup event listeners
      this.setupEventListeners();

      // Populate dropdown
      this.populateDropdown();
    } catch (error) {
      console.error("Error initializing app:", error);
      this.showError("Gagal memuat aplikasi. Silakan refresh halaman.");
    }
  }

  initMap() {
    // Inisialisasi peta dengan Leaflet
    this.map = L.map("map").setView(this.defaultCoordinates, 13);

    // Tambahkan tile layer OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Tambahkan marker untuk Desa Borobudur
    L.marker(this.defaultCoordinates)
      .addTo(this.map)
      .bindPopup("<b>Desa Borobudur</b><br>Kabupaten Magelang, Jawa Tengah")
      .openPopup();
  }

  async loadVillagesData() {
    try {
      const response = await fetch("assets/data/villages.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.villagesData = await response.json();
    } catch (error) {
      console.error("Error loading villages data:", error);
      throw new Error("Gagal memuat data dusun");
    }
  }

  setupEventListeners() {
    // Event listener untuk dropdown dusun
    const dusunSelect = document.getElementById("dusun-select");
    dusunSelect.addEventListener("change", (e) => {
      this.onDusunChange(e.target.value);
    });

    // Event listener untuk filter kategori
    const kategoriFilter = document.getElementById("kategori-filter");
    kategoriFilter.addEventListener("change", (e) => {
      this.onKategoriFilterChange(e.target.value);
    });
  }

  populateDropdown() {
    const dusunSelect = document.getElementById("dusun-select");

    // Clear existing options (keep the first default option)
    dusunSelect.innerHTML = '<option value="">-- Pilih Dusun --</option>';

    // Add options from villages data
    this.villagesData.forEach((village) => {
      const option = document.createElement("option");
      option.value = village.id;
      option.textContent = village.nama_dusun;
      dusunSelect.appendChild(option);
    });
  }

  onDusunChange(dusunId) {
    if (!dusunId) {
      // Reset ke view default
      this.resetView();
      return;
    }

    // Cari data dusun
    const dusun = this.villagesData.find((v) => v.id === dusunId);
    if (!dusun) {
      console.error("Dusun not found:", dusunId);
      return;
    }

    this.currentDusun = dusun;

    // Update peta
    this.updateMap(dusun);

    // Tampilkan informasi dusun
    this.showDusunInfo(dusun);

    // Tampilkan UMKM
    this.showUMKMSection(dusun);
  }

  updateMap(dusun) {
    // Pindahkan view peta ke koordinat dusun
    this.map.setView(dusun.koordinat, 15);

    // Hapus marker lama (kecuali marker default Desa Borobudur)
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        // Hanya hapus marker yang bukan marker default
        const markerLatLng = layer.getLatLng();
        if (
          markerLatLng.lat !== this.defaultCoordinates[0] ||
          markerLatLng.lng !== this.defaultCoordinates[1]
        ) {
          this.map.removeLayer(layer);
        }
      }
    });

    // Tambahkan marker untuk dusun (tanpa marker UMKM sesuai permintaan)
    L.marker(dusun.koordinat)
      .addTo(this.map)
      .bindPopup(`<b>${dusun.nama_dusun}</b><br>${dusun.status}`)
      .openPopup();
  }

  showDusunInfo(dusun) {
    const infoSection = document.getElementById("dusun-info");
    const namaElement = document.getElementById("dusun-nama");
    const statusElement = document.getElementById("dusun-status");
    const demografisElement = document.getElementById("demografis-content");
    const potensiElement = document.getElementById("potensi-content");

    // Set nama dan status
    namaElement.textContent = dusun.nama_dusun;
    statusElement.textContent = dusun.status;

    // Set data demografis
    demografisElement.innerHTML = `
            <div class="demografis-item">
                <span class="demografis-label">Jumlah Penduduk:</span>
                <span class="demografis-value">${dusun.data_demografis.jumlah_penduduk.toLocaleString(
                  "id-ID"
                )} jiwa</span>
            </div>
            <div class="demografis-item">
                <span class="demografis-label">Persentase dari Total:</span>
                <span class="demografis-value">${
                  dusun.data_demografis.persentase_dari_total
                }</span>
            </div>
            <div class="demografis-item">
                <span class="demografis-label">RT/RW:</span>
                <span class="demografis-value">${
                  dusun.data_demografis.rt_rw
                }</span>
            </div>
            <div class="demografis-item">
                <span class="demografis-label">Jumlah RT:</span>
                <span class="demografis-value">${
                  dusun.data_demografis.jumlah_rt
                } RT</span>
            </div>
            <div class="demografis-item">
                <span class="demografis-label">Jumlah RW:</span>
                <span class="demografis-value">${
                  dusun.data_demografis.jumlah_rw
                } RW</span>
            </div>
        `;

    // Set potensi
    potensiElement.textContent = dusun.potensi;

    // Tampilkan section
    infoSection.classList.remove("hidden");
  }

  showUMKMSection(dusun) {
    const umkmSection = document.getElementById("umkm-section");

    // Populate kategori filter
    this.populateKategoriFilter(dusun.umkm);

    // Set initial filtered UMKM
    this.filteredUMKM = dusun.umkm;

    // Reset pagination
    this.currentPage = 1;
    this.calculatePagination();

    // Render tabel UMKM
    this.renderUMKMTable();

    // Render pagination
    this.renderPagination();

    // Tampilkan section
    umkmSection.classList.remove("hidden");
  }

  populateKategoriFilter(umkmList) {
    const kategoriFilter = document.getElementById("kategori-filter");

    // Clear existing options
    kategoriFilter.innerHTML = '<option value="">Semua Kategori</option>';

    // Get unique categories
    const categories = [...new Set(umkmList.map((umkm) => umkm.kategori))];

    // Add options
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      kategoriFilter.appendChild(option);
    });
  }

  onKategoriFilterChange(kategori) {
    if (!this.currentDusun) return;

    // Filter UMKM berdasarkan kategori
    if (kategori === "") {
      this.filteredUMKM = this.currentDusun.umkm;
    } else {
      this.filteredUMKM = this.currentDusun.umkm.filter(
        (umkm) => umkm.kategori === kategori
      );
    }

    // Reset pagination
    this.currentPage = 1;
    this.calculatePagination();

    // Re-render tabel dan pagination
    this.renderUMKMTable();
    this.renderPagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredUMKM.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUMKM.slice(startIndex, endIndex);
  }

  renderUMKMTable() {
    const tbody = document.getElementById("umkm-tbody");

    // Clear existing rows
    tbody.innerHTML = "";

    // Check if no UMKM found
    if (this.filteredUMKM.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #666; padding: 2rem;">
                        Tidak ada UMKM yang ditemukan
                    </td>
                </tr>
            `;
      return;
    }

    // Get current page data
    const currentPageData = this.getCurrentPageData();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    // Add rows
    currentPageData.forEach((umkm, index) => {
      const row = document.createElement("tr");
      const globalIndex = startIndex + index + 1;

      row.innerHTML = `
                <td>${globalIndex}</td>
                <td><strong>${umkm.nama}</strong></td>
                <td><span class="kategori-badge">${umkm.kategori}</span></td>
                <td>${umkm.deskripsi}</td>
                <td>
                    <a href="tel:${umkm.telepon}" class="telepon-link">
                        ${umkm.telepon}
                    </a>
                </td>
                <td>
                    <a href="${umkm.link_gmaps}" target="_blank" class="link-button">
                        Lihat Lokasi
                    </a>
                </td>
            `;

      tbody.appendChild(row);
    });
  }

  renderPagination() {
    // Create pagination container if it doesn't exist
    let paginationContainer = document.getElementById("pagination-container");
    if (!paginationContainer) {
      paginationContainer = document.createElement("div");
      paginationContainer.id = "pagination-container";
      paginationContainer.className = "pagination-container";

      // Insert after table container
      const tableContainer = document.querySelector(".table-container");
      tableContainer.parentNode.insertBefore(
        paginationContainer,
        tableContainer.nextSibling
      );
    }

    // Hide pagination if only one page or no data
    if (this.totalPages <= 1) {
      paginationContainer.classList.add("hidden");
      return;
    }

    paginationContainer.classList.remove("hidden");

    // Calculate pagination info
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredUMKM.length
    );
    const totalItems = this.filteredUMKM.length;

    // Render pagination HTML
    paginationContainer.innerHTML = `
      <div class="pagination-info">
        Menampilkan ${startItem}-${endItem} dari ${totalItems} UMKM
      </div>
      <div class="pagination-controls">
        <button id="prev-btn" class="pagination-btn" ${
          this.currentPage === 1 ? "disabled" : ""
        }>
          ← Sebelumnya
        </button>
        <div class="page-indicator">
          <span>Halaman</span>
          <span class="current-page">${this.currentPage}</span>
          <span>dari ${this.totalPages}</span>
        </div>
        <button id="next-btn" class="pagination-btn" ${
          this.currentPage === this.totalPages ? "disabled" : ""
        }>
          Selanjutnya →
        </button>
      </div>
    `;

    // Add event listeners
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderUMKMTable();
        this.renderPagination();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderUMKMTable();
        this.renderPagination();
      }
    });
  }

  resetView() {
    // Reset peta ke view default
    this.map.setView(this.defaultCoordinates, 13);

    // Hapus marker dusun
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const markerLatLng = layer.getLatLng();
        if (
          markerLatLng.lat !== this.defaultCoordinates[0] ||
          markerLatLng.lng !== this.defaultCoordinates[1]
        ) {
          this.map.removeLayer(layer);
        }
      }
    });

    // Sembunyikan section informasi
    document.getElementById("dusun-info").classList.add("hidden");
    document.getElementById("umkm-section").classList.add("hidden");

    // Hide pagination
    const paginationContainer = document.getElementById("pagination-container");
    if (paginationContainer) {
      paginationContainer.classList.add("hidden");
    }

    // Reset current dusun dan pagination
    this.currentDusun = null;
    this.currentPage = 1;
    this.filteredUMKM = [];
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Initialize aplikasi saat DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  new PetaDigitalDesa();
});
