// Peta Digital Desa Borobudur - JavaScript Application

class PetaDigitalDesa {
  constructor() {
    this.map = null;
    this.villagesData = [];
    this.currentDusun = null;
    this.filteredUMKM = [];
    this.umkmMarkers = []; // Array untuk menyimpan marker UMKM
    this.dusunMarker = null; // Marker untuk dusun yang dipilih

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
    this.clearDusunAndUMKMMarkers();

    // Tambahkan marker untuk dusun dengan icon khusus
    this.dusunMarker = L.marker(dusun.koordinat, {
      icon: L.divIcon({
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
            color: white;
            font-weight: bold;
            font-size: 16px;
            font-family: Arial, sans-serif;
          ">
            🏘️
          </div>
        `,
        className: "custom-dusun-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      }),
    })
      .addTo(this.map)
      .bindPopup(
        `
        <div style="min-width: 200px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #e74c3c; font-size: 18px;">
            🏘️ ${dusun.nama_dusun}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #7f8c8d; font-weight: 600;">
            ${dusun.status}
          </p>
          <p style="margin: 0; font-size: 12px; color: #2c3e50;">
            <strong>Penduduk:</strong> ${dusun.data_demografis.jumlah_penduduk.toLocaleString(
              "id-ID"
            )} jiwa
          </p>
        </div>
      `
      )
      .openPopup();

    // Tambahkan marker untuk semua UMKM di dusun
    this.addUMKMMarkers(dusun.umkm);
  }

  addUMKMMarkers(umkmList) {
    // Clear existing UMKM markers
    this.clearUMKMMarkers();

    // Tambahkan marker untuk setiap UMKM
    umkmList.forEach((umkm, index) => {
      // Buat icon berdasarkan kategori
      const icon = this.getUMKMIcon(umkm.kategori);

      const marker = L.marker(umkm.koordinat, { icon }).addTo(this.map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #2c3e50;">${umkm.nama}</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #7f8c8d;">
              <strong>Kategori:</strong> ${umkm.kategori}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.4;">
              ${umkm.deskripsi}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px;">
              <strong>Telepon:</strong> <a href="tel:${umkm.telepon}" style="color: #3498db; text-decoration: none;">${umkm.telepon}</a>
            </p>
            <a href="${umkm.link_gmaps}" target="_blank" 
               style="display: inline-block; padding: 4px 8px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
              Lihat di Google Maps
            </a>
          </div>
        `);

      // Simpan marker ke array
      this.umkmMarkers.push(marker);
    });
  }

  getUMKMIcon(kategori) {
    let iconColor, iconEmoji;

    switch (kategori.toLowerCase()) {
      case "makanan":
        iconColor = "#27ae60";
        iconEmoji = "🍽️";
        break;
      case "toko":
        iconColor = "#f39c12";
        iconEmoji = "🏪";
        break;
      case "kerajinan":
        iconColor = "#9b59b6";
        iconEmoji = "🎨";
        break;
      case "jasa":
        iconColor = "#3498db";
        iconEmoji = "⚙️";
        break;
      case "pertanian":
        iconColor = "#2ecc71";
        iconEmoji = "🌾";
        break;
      default:
        iconColor = "#34495e";
        iconEmoji = "📍";
    }

    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, ${iconColor}, ${this.darkenColor(
        iconColor
      )});
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          font-size: 14px;
          transform: scale(1);
          transition: transform 0.2s ease;
        ">
          ${iconEmoji}
        </div>
      `,
      className: "custom-umkm-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }

  darkenColor(color) {
    // Fungsi untuk membuat warna lebih gelap untuk efek gradient
    const colorMap = {
      "#27ae60": "#1e8449",
      "#f39c12": "#d68910",
      "#9b59b6": "#8e44ad",
      "#3498db": "#2980b9",
      "#2ecc71": "#27ae60",
      "#34495e": "#2c3e50",
    };
    return colorMap[color] || "#2c3e50";
  }

  clearDusunAndUMKMMarkers() {
    // Hapus marker dusun
    if (this.dusunMarker) {
      this.map.removeLayer(this.dusunMarker);
      this.dusunMarker = null;
    }

    // Hapus marker UMKM
    this.clearUMKMMarkers();
  }

  clearUMKMMarkers() {
    this.umkmMarkers.forEach((marker) => {
      this.map.removeLayer(marker);
    });
    this.umkmMarkers = [];
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

    // Update marker UMKM di peta berdasarkan filter
    this.updateUMKMMarkersBasedOnFilter();

    // Reset pagination
    this.currentPage = 1;
    this.calculatePagination();

    // Re-render tabel dan pagination
    this.renderUMKMTable();
    this.renderPagination();
  }

  updateUMKMMarkersBasedOnFilter() {
    // Hapus semua marker UMKM
    this.clearUMKMMarkers();

    // Tambahkan marker hanya untuk UMKM yang difilter
    this.addUMKMMarkers(this.filteredUMKM);
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

      // Add click event to row untuk highlight marker
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        this.highlightUMKMMarker(umkm);
      });

      row.innerHTML = `
                <td>${globalIndex}</td>
                <td><strong>${umkm.nama}</strong></td>
                <td><span class="kategori-badge">${umkm.kategori}</span></td>
                <td>${umkm.deskripsi}</td>
                <td>
                    <a href="tel:${umkm.telepon}" class="telepon-link" onclick="event.stopPropagation()">
                        ${umkm.telepon}
                    </a>
                </td>
                <td>
                    <a href="${umkm.link_gmaps}" target="_blank" class="link-button" onclick="event.stopPropagation()">
                        Lokasi
                    </a>
                </td>
            `;

      tbody.appendChild(row);
    });
  }

  highlightUMKMMarker(umkm) {
    // Cari marker yang sesuai dengan UMKM
    const targetMarker = this.umkmMarkers.find((marker) => {
      const markerLatLng = marker.getLatLng();
      return (
        markerLatLng.lat === umkm.koordinat[0] &&
        markerLatLng.lng === umkm.koordinat[1]
      );
    });

    if (targetMarker) {
      // Pindahkan view ke marker dan buka popup
      this.map.setView(targetMarker.getLatLng(), 17);
      targetMarker.openPopup();

      // Highlight marker sementara
      setTimeout(() => {
        targetMarker.bounce();
      }, 500);
    }
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

    // Hapus marker dusun dan UMKM
    this.clearDusunAndUMKMMarkers();

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
