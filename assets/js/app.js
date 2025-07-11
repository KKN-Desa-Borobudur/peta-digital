// Peta Digital Desa Borobudur - Main Application
// Author: Village Development Team
// Version: 1.0

class VillageMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.villageData = null;
    this.currentDusun = "ngaran-1";
    this.filters = {
      kategori: "all",
      dusun: "all",
    };

    this.init();
  }

  async init() {
    try {
      await this.loadVillageData();
      this.initMap();
      this.setupEventListeners();
      this.displayDusunInfo(this.currentDusun);
      this.displayUMKMList();
    } catch (error) {
      console.error("Error initializing application:", error);
      this.showError("Gagal memuat data desa. Silakan refresh halaman.");
    }
  }

  async loadVillageData() {
    try {
      // In a real application, this would be a fetch request
      // For now, we'll use the data from the JSON file provided
      this.villageData = {
        desa_overview: {
          id: "desa-borobudur",
          nama_desa: "Desa Borobudur",
          kecamatan: "Borobudur",
          kabupaten: "Magelang",
          provinsi: "Jawa Tengah",
          koordinat: {
            latitude: -7.6079,
            longitude: 110.2038,
          },
          data_administratif: {
            kepala_desa: "Pak Suryanto Widodo",
            jumlah_penduduk: 8945,
            luas_wilayah: "25.8 km²",
            jumlah_dusun: 4,
            jumlah_rw: 12,
            jumlah_rt: 60,
          },
          potensi_ekonomi: {
            total_umkm: 20,
            sektor_unggulan: ["Pariwisata", "Kuliner", "Kerajinan", "Jasa"],
            distribusi_umkm: {
              kuliner: 5,
              kerajinan: 3,
              jasa: 7,
              retail: 4,
              kesehatan: 1,
            },
          },
          potensi_wisata: {
            daya_tarik_utama: "Candi Borobudur",
            jarak_ke_candi: "2 km",
            status: "Desa Wisata",
            fasilitas_pendukung: [
              "Homestay",
              "Rental Sepeda",
              "Souvenir Shop",
              "Warung Kuliner",
            ],
          },
        },
        dusun_data: [
          {
            id: "ngaran-1",
            nama_dusun: "Ngaran I",
            status: "Dusun Utama",
            koordinat: { latitude: -7.6069, longitude: 110.2028 },
            data_demografis: {
              jumlah_penduduk: 2236,
              persentase_dari_total: "25.0%",
              rt_rw: "RT 01-15, RW 01-03",
              jumlah_rt: 15,
              jumlah_rw: 3,
            },
            karakteristik: {
              posisi: "Pusat Desa",
              akses_utama: "Jl. Raya Borobudur",
              keunggulan: "Akses mudah ke Candi Borobudur dan fasilitas umum",
            },
            umkm_list: [
              {
                id: 1,
                nama: "Warung Gudeg Borobudur Bu Tini",
                kategori: "kuliner",
                pemilik: "Ibu Tini Suryawati",
                alamat: "Jl. Raya Borobudur No. 45",
                telepon: "0813-2845-7891",
                tahun_berdiri: 2015,
                spesialisasi: "Gudeg Jogja, Sate Klathak",
                koordinat: { latitude: -7.6075, longitude: 110.2035 },
              },
              {
                id: 2,
                nama: "Souvenir Candi Borobudur",
                kategori: "kerajinan",
                pemilik: "Pak Bambang Sutrisno",
                alamat: "Jl. Badrawati No. 12",
                telepon: "0856-4123-8765",
                tahun_berdiri: 2018,
                spesialisasi: "Miniatur Candi, Kerajinan Batu",
                koordinat: { latitude: -7.6065, longitude: 110.2045 },
              },
              {
                id: 3,
                nama: "Homestay Borobudur View",
                kategori: "jasa",
                pemilik: "Ibu Siti Nurjanah",
                alamat: "Jl. Panorama No. 8",
                telepon: "0822-3456-7890",
                tahun_berdiri: 2019,
                spesialisasi: "Penginapan, Tour Guide",
                koordinat: { latitude: -7.6055, longitude: 110.2025 },
              },
              {
                id: 4,
                nama: "Rental Sepeda Borobudur",
                kategori: "jasa",
                pemilik: "Pak Agus Riyanto",
                alamat: "Jl. Magelang-Yogya KM 40",
                telepon: "0815-6789-1234",
                tahun_berdiri: 2020,
                spesialisasi: "Rental Sepeda, Sepeda Motor",
                koordinat: { latitude: -7.608, longitude: 110.202 },
              },
              {
                id: 18,
                nama: "Warung Nasi Pecel Bu Yanti",
                kategori: "kuliner",
                pemilik: "Ibu Yanti Susilowati",
                alamat: "Jl. Pecel No. 12",
                telepon: "0824-9012-3456",
                tahun_berdiri: 2016,
                spesialisasi: "Nasi Pecel, Gado-gado",
                koordinat: { latitude: -7.607, longitude: 110.203 },
              },
            ],
          },
          {
            id: "ngaran-2",
            nama_dusun: "Ngaran II",
            status: "Dusun Pendukung",
            koordinat: { latitude: -7.6089, longitude: 110.2048 },
            data_demografis: {
              jumlah_penduduk: 2184,
              persentase_dari_total: "24.4%",
              rt_rw: "RT 16-30, RW 04-06",
              jumlah_rt: 15,
              jumlah_rw: 3,
            },
            karakteristik: {
              posisi: "Wilayah Tengah",
              akses_utama: "Jl. Mendut, Jl. Candi",
              keunggulan: "Pusat kerajinan dan layanan kesehatan",
            },
            umkm_list: [
              {
                id: 5,
                nama: "Warung Soto Ayam Pak Harto",
                kategori: "kuliner",
                pemilik: "Pak Harto Subagyo",
                alamat: "Jl. Mendut No. 23",
                telepon: "0813-9876-5432",
                tahun_berdiri: 2016,
                spesialisasi: "Soto Ayam, Rawon",
                koordinat: { latitude: -7.6095, longitude: 110.2055 },
              },
              {
                id: 6,
                nama: "Batik Borobudur Heritage",
                kategori: "kerajinan",
                pemilik: "Ibu Ratna Dewi",
                alamat: "Jl. Candi No. 17",
                telepon: "0812-1357-2468",
                tahun_berdiri: 2017,
                spesialisasi: "Batik Tulis, Batik Cap",
                koordinat: { latitude: -7.6085, longitude: 110.204 },
              },
              {
                id: 7,
                nama: "Toko Oleh-oleh Borobudur",
                kategori: "retail",
                pemilik: "Pak Joko Susilo",
                alamat: "Jl. Syailendra No. 5",
                telepon: "0821-4567-8901",
                tahun_berdiri: 2014,
                spesialisasi: "Oleh-oleh Khas, Makanan Ringan",
                koordinat: { latitude: -7.609, longitude: 110.205 },
              },
              {
                id: 16,
                nama: "Salon Cantik Indah",
                kategori: "jasa",
                pemilik: "Ibu Dewi Sartika",
                alamat: "Jl. Cantik No. 5",
                telepon: "0812-7890-1234",
                tahun_berdiri: 2021,
                spesialisasi: "Potong Rambut, Facial, Makeup",
                koordinat: { latitude: -7.608, longitude: 110.2045 },
              },
              {
                id: 19,
                nama: "Toko Baju Murah",
                kategori: "retail",
                pemilik: "Ibu Ratna Sari",
                alamat: "Jl. Fashion No. 14",
                telepon: "0821-3456-7890",
                tahun_berdiri: 2019,
                spesialisasi: "Pakaian Pria/Wanita, Aksesoris",
                koordinat: { latitude: -7.6088, longitude: 110.2052 },
              },
            ],
          },
          {
            id: "wringin-putih",
            nama_dusun: "Wringin Putih",
            status: "Dusun Berkembang",
            koordinat: { latitude: -7.6059, longitude: 110.2058 },
            data_demografis: {
              jumlah_penduduk: 2298,
              persentase_dari_total: "25.7%",
              rt_rw: "RT 31-45, RW 07-09",
              jumlah_rt: 15,
              jumlah_rw: 3,
            },
            karakteristik: {
              posisi: "Wilayah Strategis",
              akses_utama: "Jl. Wringin Putih, Jl. Bukit Rhema",
              keunggulan:
                "Dekat dengan spot wisata Gereja Ayam dan area komersial",
            },
            umkm_list: [
              {
                id: 8,
                nama: "Laundry Cepat Bersih",
                kategori: "jasa",
                pemilik: "Ibu Maya Sari",
                alamat: "Jl. Wringin Putih No. 15",
                telepon: "0823-7890-1234",
                tahun_berdiri: 2021,
                spesialisasi: "Laundry Kiloan, Dry Cleaning",
                koordinat: { latitude: -7.605, longitude: 110.2065 },
              },
              {
                id: 9,
                nama: "Cafe Sunrise View",
                kategori: "kuliner",
                pemilik: "Pak Deni Kurniawan",
                alamat: "Jl. Bukit Rhema No. 3",
                telepon: "0834-5678-9012",
                tahun_berdiri: 2020,
                spesialisasi: "Kopi Lokal, Makanan Barat",
                koordinat: { latitude: -7.6055, longitude: 110.207 },
              },
              {
                id: 10,
                nama: "Kerajinan Gerabah Tradisional",
                kategori: "kerajinan",
                pemilik: "Pak Sukiman",
                alamat: "Jl. Kerajinan No. 28",
                telepon: "0816-2345-6789",
                tahun_berdiri: 2013,
                spesialisasi: "Gerabah, Keramik Tradisional",
                koordinat: { latitude: -7.6065, longitude: 110.206 },
              },
              {
                id: 17,
                nama: "Toko Obat Sehat",
                kategori: "kesehatan",
                pemilik: "Ibu Siti Nurhaliza",
                alamat: "Jl. Sehat No. 25",
                telepon: "0816-5678-9012",
                tahun_berdiri: 2018,
                spesialisasi: "Obat-obatan, Alat Kesehatan",
                koordinat: { latitude: -7.606, longitude: 110.2055 },
              },
              {
                id: 20,
                nama: "Warung Es Kelapa Muda",
                kategori: "kuliner",
                pemilik: "Pak Sugiarto",
                alamat: "Jl. Kelapa No. 9",
                telepon: "0825-6789-0123",
                tahun_berdiri: 2020,
                spesialisasi: "Es Kelapa Muda, Minuman Segar",
                koordinat: { latitude: -7.6058, longitude: 110.2063 },
              },
            ],
          },
        ],
        potensi_wisata: [
          {
            nama: "Candi Borobudur",
            jarak_dari_pusat: "2 km",
            deskripsi:
              "Candi Buddha terbesar di dunia, UNESCO World Heritage Site",
            kategori: "Wisata Sejarah",
            koordinat: { latitude: -7.6079, longitude: 110.2038 },
          },
          {
            nama: "Sunrise Point Punthuk Setumbu",
            jarak_dari_pusat: "3.5 km",
            deskripsi:
              "Spot terbaik untuk melihat sunrise dengan latar belakang Candi Borobudur",
            kategori: "Wisata Alam",
            koordinat: { latitude: -7.612, longitude: 110.195 },
          },
          {
            nama: "Candi Mendut",
            jarak_dari_pusat: "3 km",
            deskripsi: "Candi Buddha dengan arca Dhyani Buddha yang megah",
            kategori: "Wisata Sejarah",
            koordinat: { latitude: -7.6044, longitude: 110.2289 },
          },
          {
            nama: "Gereja Ayam (Bukit Rhema)",
            jarak_dari_pusat: "5 km",
            deskripsi:
              "Bangunan unik berbentuk burung merpati dengan pemandangan indah",
            kategori: "Wisata Religi & Unik",
            koordinat: { latitude: -7.5925, longitude: 110.2072 },
          },
        ],
      };
    } catch (error) {
      console.error("Error loading village data:", error);
      throw error;
    }
  }

  initMap() {
    const center = [
      this.villageData.desa_overview.koordinat.latitude,
      this.villageData.desa_overview.koordinat.longitude,
    ];

    this.map = L.map("map").setView(center, 14);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    // Add markers for village center
    this.addVillageMarkers();
    this.addDusunMarkers();
    this.addTourismMarkers();
    this.addUMKMMarkers();
  }

  addVillageMarkers() {
    const center = [
      this.villageData.desa_overview.koordinat.latitude,
      this.villageData.desa_overview.koordinat.longitude,
    ];

    const villageIcon = L.divIcon({
      className: "village-marker",
      html: '<div style="background: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(center, { icon: villageIcon }).addTo(this.map)
      .bindPopup(`
        <div class="popup-title">🏛️ Pusat Desa Borobudur</div>
        <div class="popup-info">
          <strong>Kepala Desa:</strong> ${
            this.villageData.desa_overview.data_administratif.kepala_desa
          }<br>
          <strong>Penduduk:</strong> ${this.villageData.desa_overview.data_administratif.jumlah_penduduk.toLocaleString()} jiwa<br>
          <strong>Luas:</strong> ${
            this.villageData.desa_overview.data_administratif.luas_wilayah
          }
        </div>
      `);

    this.markers.push(marker);
  }

  addDusunMarkers() {
    this.villageData.dusun_data.forEach((dusun) => {
      const dusunIcon = L.divIcon({
        className: "dusun-marker",
        html: '<div style="background: #3498db; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker(
        [dusun.koordinat.latitude, dusun.koordinat.longitude],
        { icon: dusunIcon }
      ).addTo(this.map).bindPopup(`
          <div class="popup-title">🏘️ ${dusun.nama_dusun}</div>
          <div class="popup-info">
            <strong>Status:</strong> ${dusun.status}<br>
            <strong>Penduduk:</strong> ${dusun.data_demografis.jumlah_penduduk.toLocaleString()} jiwa<br>
            <strong>RT/RW:</strong> ${dusun.data_demografis.jumlah_rt} RT, ${
        dusun.data_demografis.jumlah_rw
      } RW<br>
            <strong>Posisi:</strong> ${dusun.karakteristik.posisi}
          </div>
        `);

      this.markers.push(marker);
    });
  }

  addTourismMarkers() {
    this.villageData.potensi_wisata.forEach((wisata) => {
      const tourismIcon = L.divIcon({
        className: "tourism-marker",
        html: '<div style="background: #f39c12; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker(
        [wisata.koordinat.latitude, wisata.koordinat.longitude],
        { icon: tourismIcon }
      ).addTo(this.map).bindPopup(`
          <div class="popup-title">🏛️ ${wisata.nama}</div>
          <div class="popup-info">
            <strong>Kategori:</strong> ${wisata.kategori}<br>
            <strong>Jarak:</strong> ${wisata.jarak_dari_pusat}<br>
            <strong>Deskripsi:</strong> ${wisata.deskripsi}
          </div>
        `);

      this.markers.push(marker);
    });
  }

  addUMKMMarkers() {
    this.villageData.dusun_data.forEach((dusun) => {
      dusun.umkm_list.forEach((umkm) => {
        const umkmIcon = L.divIcon({
          className: "umkm-marker",
          html: '<div style="background: #27ae60; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker(
          [umkm.koordinat.latitude, umkm.koordinat.longitude],
          { icon: umkmIcon }
        ).addTo(this.map).bindPopup(`
            <div class="popup-title">🏪 ${umkm.nama}</div>
            <div class="popup-info">
              <strong>Kategori:</strong> ${this.formatKategori(
                umkm.kategori
              )}<br>
              <strong>Pemilik:</strong> ${umkm.pemilik}<br>
              <strong>Alamat:</strong> ${umkm.alamat}<br>
              <strong>Telepon:</strong> ${umkm.telepon}<br>
              <strong>Spesialisasi:</strong> ${umkm.spesialisasi}
            </div>
          `);

        this.markers.push(marker);
      });
    });
  }

  setupEventListeners() {
    // Dusun tabs
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const dusunId = e.target.dataset.dusun;
        this.setActiveTab(dusunId);
        this.displayDusunInfo(dusunId);
      });
    });

    // UMKM filters
    const kategoriFilter = document.getElementById("kategori-filter");
    const dusunFilter = document.getElementById("dusun-filter");

    kategoriFilter.addEventListener("change", (e) => {
      this.filters.kategori = e.target.value;
      this.displayUMKMList();
    });

    dusunFilter.addEventListener("change", (e) => {
      this.filters.dusun = e.target.value;
      this.displayUMKMList();
    });
  }

  setActiveTab(dusunId) {
    // Remove active class from all tabs
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked tab
    document.querySelector(`[data-dusun="${dusunId}"]`).classList.add("active");
    this.currentDusun = dusunId;
  }

  displayDusunInfo(dusunId) {
    const dusun = this.villageData.dusun_data.find((d) => d.id === dusunId);
    if (!dusun) return;

    const container = document.getElementById("dusun-info");
    container.innerHTML = `
      <div class="dusun-stats">
        <div class="stat-item">
          <div class="stat-number">${dusun.data_demografis.jumlah_penduduk.toLocaleString()}</div>
          <div class="stat-label">Penduduk</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${dusun.data_demografis.jumlah_rt}</div>
          <div class="stat-label">RT</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${dusun.data_demografis.jumlah_rw}</div>
          <div class="stat-label">RW</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${dusun.umkm_list.length}</div>
          <div class="stat-label">UMKM</div>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <h3>📍 Lokasi & Akses</h3>
          <p><strong>Posisi:</strong> ${dusun.karakteristik.posisi}</p>
          <p><strong>Akses Utama:</strong> ${
            dusun.karakteristik.akses_utama
          }</p>
          <p><strong>Keunggulan:</strong> ${dusun.karakteristik.keunggulan}</p>
        </div>
        
        <div class="info-card">
          <h3>👥 Demografis</h3>
          <p><strong>Jumlah Penduduk:</strong> ${dusun.data_demografis.jumlah_penduduk.toLocaleString()} jiwa</p>
          <p><strong>Persentase:</strong> ${
            dusun.data_demografis.persentase_dari_total
          }</p>
          <p><strong>RT/RW:</strong> ${dusun.data_demografis.rt_rw}</p>
        </div>
      </div>
    `;
  }

  displayUMKMList() {
    const container = document.getElementById("umkm-list");
    let allUMKM = [];

    // Collect all UMKM from all dusun
    this.villageData.dusun_data.forEach((dusun) => {
      dusun.umkm_list.forEach((umkm) => {
        allUMKM.push({
          ...umkm,
          dusun_id: dusun.id,
          dusun_nama: dusun.nama_dusun,
        });
      });
    });

    // Apply filters
    let filteredUMKM = allUMKM;

    if (this.filters.kategori !== "all") {
      filteredUMKM = filteredUMKM.filter(
        (umkm) => umkm.kategori === this.filters.kategori
      );
    }

    if (this.filters.dusun !== "all") {
      filteredUMKM = filteredUMKM.filter(
        (umkm) => umkm.dusun_id === this.filters.dusun
      );
    }

    // Generate HTML
    if (filteredUMKM.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666; padding: 2rem;">Tidak ada UMKM yang sesuai dengan filter yang dipilih.</p>';
      return;
    }

    container.innerHTML = filteredUMKM
      .map(
        (umkm) => `
      <div class="umkm-card ${umkm.kategori}">
        <div class="umkm-header">
          <div>
            <div class="umkm-name">${umkm.nama}</div>
            <div class="umkm-category ${umkm.kategori}">${this.formatKategori(
          umkm.kategori
        )}</div>
          </div>
        </div>
        
        <div class="umkm-info">
          <p><strong>Pemilik:</strong> ${umkm.pemilik}</p>
          <p><strong>Alamat:</strong> ${umkm.alamat}</p>
          <p><strong>Telepon:</strong> ${umkm.telepon}</p>
          <p><strong>Dusun:</strong> ${umkm.dusun_nama}</p>
          <p><strong>Tahun Berdiri:</strong> ${umkm.tahun_berdiri}</p>
          <p><strong>Spesialisasi:</strong> ${umkm.spesialisasi}</p>
        </div>
        
        <div class="umkm-actions">
          <button class="btn btn-primary" onclick="villageMap.showOnMap(${
            umkm.koordinat.latitude
          }, ${umkm.koordinat.longitude})">
            📍 Lihat di Peta
          </button>
          <a href="tel:${umkm.telepon}" class="btn btn-secondary">
            📞 Hubungi
          </a>
        </div>
      </div>
    `
      )
      .join("");
  }

  formatKategori(kategori) {
    const kategoriMap = {
      kuliner: "Kuliner",
      kerajinan: "Kerajinan",
      jasa: "Jasa",
      retail: "Retail",
      kesehatan: "Kesehatan",
    };
    return kategoriMap[kategori] || kategori;
  }

  showOnMap(lat, lng) {
    this.map.setView([lat, lng], 17);

    // Find and open the popup for this location
    this.markers.forEach((marker) => {
      const markerLatLng = marker.getLatLng();
      if (
        Math.abs(markerLatLng.lat - lat) < 0.001 &&
        Math.abs(markerLatLng.lng - lng) < 0.001
      ) {
        marker.openPopup();
      }
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">${message}</div>
        </div>
      `;
      errorContainer.style.display = "block";
    } else {
      alert(message);
    }
  }

  generateReport() {
    const reportData = this.compileVillageReport();
    this.displayReport(reportData);
  }

  compileVillageReport() {
    const overview = this.villageData.desa_overview;
    const dusunData = this.villageData.dusun_data;

    // Calculate statistics
    const totalUMKM = dusunData.reduce(
      (sum, dusun) => sum + dusun.umkm_list.length,
      0
    );
    const kategoriStats = {};

    dusunData.forEach((dusun) => {
      dusun.umkm_list.forEach((umkm) => {
        kategoriStats[umkm.kategori] = (kategoriStats[umkm.kategori] || 0) + 1;
      });
    });

    const avgUMKMPerDusun = (totalUMKM / dusunData.length).toFixed(1);
    const mostPopularCategory = Object.keys(kategoriStats).reduce((a, b) =>
      kategoriStats[a] > kategoriStats[b] ? a : b
    );

    return {
      overview,
      dusunData,
      statistics: {
        totalUMKM,
        kategoriStats,
        avgUMKMPerDusun,
        mostPopularCategory,
      },
    };
  }

  displayReport(reportData) {
    const modal = document.getElementById("report-modal");
    const reportContent = document.getElementById("report-content");

    reportContent.innerHTML = `
      <div class="report-header">
        <h2>📊 Laporan Komprehensif Desa Borobudur</h2>
        <p class="report-date">Tanggal: ${new Date().toLocaleDateString(
          "id-ID"
        )}</p>
      </div>
      
      <div class="report-section">
        <h3>📋 Ringkasan Umum</h3>
        <div class="report-grid">
          <div class="report-stat">
            <div class="stat-value">${reportData.overview.data_administratif.jumlah_penduduk.toLocaleString()}</div>
            <div class="stat-label">Total Penduduk</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${reportData.statistics.totalUMKM}</div>
            <div class="stat-label">Total UMKM</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${reportData.dusunData.length}</div>
            <div class="stat-label">Jumlah Dusun</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${
              reportData.statistics.avgUMKMPerDusun
            }</div>
            <div class="stat-label">Rata-rata UMKM/Dusun</div>
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h3>📈 Distribusi UMKM per Kategori</h3>
        <div class="category-stats">
          ${Object.entries(reportData.statistics.kategoriStats)
            .map(
              ([kategori, jumlah]) => `
            <div class="category-stat">
              <div class="category-name">${this.formatKategori(kategori)}</div>
              <div class="category-bar">
                <div class="category-fill" style="width: ${
                  (jumlah / reportData.statistics.totalUMKM) * 100
                }%"></div>
              </div>
              <div class="category-count">${jumlah}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      
      <div class="report-section">
        <h3>🏘️ Detail per Dusun</h3>
        ${reportData.dusunData
          .map(
            (dusun) => `
          <div class="dusun-report">
            <h4>${dusun.nama_dusun}</h4>
            <div class="dusun-stats-grid">
              <div class="dusun-stat">
                <strong>Penduduk:</strong> ${dusun.data_demografis.jumlah_penduduk.toLocaleString()} jiwa
              </div>
              <div class="dusun-stat">
                <strong>UMKM:</strong> ${dusun.umkm_list.length} unit
              </div>
              <div class="dusun-stat">
                <strong>RT/RW:</strong> ${dusun.data_demografis.jumlah_rt}/${
              dusun.data_demografis.jumlah_rw
            }
              </div>
              <div class="dusun-stat">
                <strong>Status:</strong> ${dusun.status}
              </div>
            </div>
            <p><strong>Keunggulan:</strong> ${
              dusun.karakteristik.keunggulan
            }</p>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="report-section">
        <h3>🎯 Rekomendasi Pengembangan</h3>
        <div class="recommendations">
          ${this.generateRecommendations(reportData)}
        </div>
      </div>
    `;

    modal.style.display = "block";
  }

  generateRecommendations(reportData) {
    const recommendations = [];

    // Check UMKM distribution
    const umkmPerDusun = reportData.dusunData.map((d) => ({
      nama: d.nama_dusun,
      jumlah: d.umkm_list.length,
    }));

    const minUMKM = Math.min(...umkmPerDusun.map((d) => d.jumlah));
    const maxUMKM = Math.max(...umkmPerDusun.map((d) => d.jumlah));

    if (maxUMKM - minUMKM > 2) {
      const dusunMin = umkmPerDusun.find((d) => d.jumlah === minUMKM);
      recommendations.push(`
        <div class="recommendation">
          <strong>🎯 Pemerataan UMKM:</strong> 
          Dusun ${dusunMin.nama} memiliki UMKM paling sedikit (${minUMKM} unit). 
          Pertimbangkan program pemberdayaan ekonomi khusus untuk dusun ini.
        </div>
      `);
    }

    // Check category diversity
    const categoryCount = Object.keys(
      reportData.statistics.kategoriStats
    ).length;
    if (categoryCount < 5) {
      recommendations.push(`
        <div class="recommendation">
          <strong>📈 Diversifikasi Usaha:</strong> 
          Saat ini hanya ada ${categoryCount} kategori UMKM. Pertimbangkan untuk 
          mengembangkan sektor lain seperti teknologi, agribisnis, atau industri kreatif.
        </div>
      `);
    }

    // Tourism potential
    recommendations.push(`
      <div class="recommendation">
        <strong>🏛️ Potensi Wisata:</strong> 
        Dengan lokasi strategis dekat Candi Borobudur, tingkatkan kualitas homestay 
        dan layanan wisata untuk mendukung ekonomi lokal.
      </div>
    `);

    // Digital presence
    recommendations.push(`
      <div class="recommendation">
        <strong>💻 Digitalisasi:</strong> 
        Kembangkan platform digital untuk mempromosikan UMKM lokal dan 
        memudahkan wisatawan menemukan produk dan layanan desa.
      </div>
    `);

    return recommendations.join("");
  }

  exportReport() {
    const reportData = this.compileVillageReport();
    const csvContent = this.generateCSVReport(reportData);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-desa-borobudur-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateCSVReport(reportData) {
    let csv = "Laporan UMKM Desa Borobudur\n\n";
    csv +=
      "ID,Nama UMKM,Kategori,Pemilik,Alamat,Telepon,Tahun Berdiri,Spesialisasi,Dusun\n";

    reportData.dusunData.forEach((dusun) => {
      dusun.umkm_list.forEach((umkm) => {
        csv += `${umkm.id},"${umkm.nama}","${this.formatKategori(
          umkm.kategori
        )}","${umkm.pemilik}","${umkm.alamat}","${umkm.telepon}",${
          umkm.tahun_berdiri
        },"${umkm.spesialisasi}","${dusun.nama_dusun}"\n`;
      });
    });

    return csv;
  }

  closeModal() {
    document.getElementById("report-modal").style.display = "none";
  }

  searchUMKM() {
    const searchTerm = document
      .getElementById("search-input")
      .value.toLowerCase();
    const umkmCards = document.querySelectorAll(".umkm-card");

    umkmCards.forEach((card) => {
      const umkmName = card
        .querySelector(".umkm-name")
        .textContent.toLowerCase();
      const umkmOwner = card
        .querySelector(".umkm-info p:nth-child(1)")
        .textContent.toLowerCase();
      const umkmAddress = card
        .querySelector(".umkm-info p:nth-child(2)")
        .textContent.toLowerCase();
      const umkmSpecialty = card
        .querySelector(".umkm-info p:nth-child(6)")
        .textContent.toLowerCase();

      if (
        umkmName.includes(searchTerm) ||
        umkmOwner.includes(searchTerm) ||
        umkmAddress.includes(searchTerm) ||
        umkmSpecialty.includes(searchTerm)
      ) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  resetFilters() {
    this.filters = {
      kategori: "all",
      dusun: "all",
    };

    document.getElementById("kategori-filter").value = "all";
    document.getElementById("dusun-filter").value = "all";
    document.getElementById("search-input").value = "";

    this.displayUMKMList();
  }

  toggleLayerVisibility(layerType) {
    const checkbox = document.getElementById(`${layerType}-layer`);
    const isVisible = checkbox.checked;

    this.markers.forEach((marker) => {
      const markerClass = marker.options.icon.options.className;

      if (layerType === "umkm" && markerClass === "umkm-marker") {
        if (isVisible) {
          this.map.addLayer(marker);
        } else {
          this.map.removeLayer(marker);
        }
      } else if (layerType === "tourism" && markerClass === "tourism-marker") {
        if (isVisible) {
          this.map.addLayer(marker);
        } else {
          this.map.removeLayer(marker);
        }
      } else if (layerType === "dusun" && markerClass === "dusun-marker") {
        if (isVisible) {
          this.map.addLayer(marker);
        } else {
          this.map.removeLayer(marker);
        }
      }
    });
  }

  showUMKMDetail(umkmId) {
    let targetUMKM = null;
    let targetDusun = null;

    // Find the UMKM across all dusun
    this.villageData.dusun_data.forEach((dusun) => {
      const umkm = dusun.umkm_list.find((u) => u.id === umkmId);
      if (umkm) {
        targetUMKM = umkm;
        targetDusun = dusun;
      }
    });

    if (!targetUMKM) return;

    const modal = document.getElementById("umkm-detail-modal");
    const content = document.getElementById("umkm-detail-content");

    content.innerHTML = `
      <div class="umkm-detail-header">
        <h2>${targetUMKM.nama}</h2>
        <span class="umkm-category ${
          targetUMKM.kategori
        }">${this.formatKategori(targetUMKM.kategori)}</span>
      </div>
      
      <div class="umkm-detail-info">
        <div class="info-row">
          <strong>Pemilik:</strong> ${targetUMKM.pemilik}
        </div>
        <div class="info-row">
          <strong>Alamat:</strong> ${targetUMKM.alamat}
        </div>
        <div class="info-row">
          <strong>Telepon:</strong> <a href="tel:${targetUMKM.telepon}">${
      targetUMKM.telepon
    }</a>
        </div>
        <div class="info-row">
          <strong>Dusun:</strong> ${targetDusun.nama_dusun}
        </div>
        <div class="info-row">
          <strong>Tahun Berdiri:</strong> ${targetUMKM.tahun_berdiri}
        </div>
        <div class="info-row">
          <strong>Spesialisasi:</strong> ${targetUMKM.spesialisasi}
        </div>
      </div>
      
      <div class="umkm-detail-actions">
        <button class="btn btn-primary" onclick="villageMap.showOnMap(${
          targetUMKM.koordinat.latitude
        }, ${targetUMKM.koordinat.longitude})">
          📍 Lihat di Peta
        </button>
        <a href="tel:${targetUMKM.telepon}" class="btn btn-secondary">
          📞 Hubungi Langsung
        </a>
        <button class="btn btn-info" onclick="villageMap.getDirections(${
          targetUMKM.koordinat.latitude
        }, ${targetUMKM.koordinat.longitude})">
          🗺️ Petunjuk Arah
        </button>
      </div>
    `;

    modal.style.display = "block";
  }

  getDirections(lat, lng) {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  }

  closeUMKMDetail() {
    document.getElementById("umkm-detail-modal").style.display = "none";
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.villageMap = new VillageMap();
});

// Add event listeners for modal closes
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }

  if (e.target.classList.contains("close")) {
    e.target.closest(".modal").style.display = "none";
  }
});

// Add keyboard shortcut for search
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    document.getElementById("search-input").focus();
  }
});

// Export villageMap to global scope for HTML onclick handlers
window.villageMap = null;
