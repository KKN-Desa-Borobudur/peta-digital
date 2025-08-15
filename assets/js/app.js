// Peta Digital Desa Borobudur - JavaScript Application with Google Sheets Integration

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

        // Google Sheets configuration
        this.spreadsheetId = "167EZvyMk3HIisF3NWdsRvoOCm0MP7WLuGvtTekGW47o";
        this.sheetsConfig = {
            dusun: "Dusun!A:J", // Kolom A sampai H untuk data dusun
            umkm: "UMKM!A:H", // Kolom A sampai H untuk data UMKM
        };

        this.init();
    }

    async init() {
        try {
            console.log("Initializing Peta Digital Desa...");

            // Show loading indicator
            this.showLoading("Memuat aplikasi...");

            // Inisialisasi peta
            this.initMap();
            await this.loadDusunPolygons();

            // Load data dari Google Sheets
            await this.loadDataFromGoogleSheets();

            // Setup event listeners
            this.setupEventListeners();

            // Populate dropdown
            this.populateDropdown();

            // Hide loading indicator
            this.hideLoading();

            console.log("App initialized successfully");
        } catch (error) {
            console.error("Error initializing app:", error);
            this.hideLoading();
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

    async loadDataFromGoogleSheets() {
        try {
            console.log("Loading data from Google Sheets...");

            // Load data dusun dan UMKM secara paralel
            const [dusunData, umkmData] = await Promise.all([
                this.fetchSheetData(this.sheetsConfig.dusun),
                this.fetchSheetData(this.sheetsConfig.umkm),
            ]);

            // Process dan gabungkan data
            this.villagesData = this.processVillagesData(dusunData, umkmData);

            console.log("Data loaded successfully:", this.villagesData);
        } catch (error) {
            console.error("Error loading data from Google Sheets:", error);
            throw new Error("Gagal memuat data dari Google Sheets");
        }
    }

    async fetchSheetData(range) {
        const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&range=${range}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error("Error fetching sheet data:", error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split("\n");
        const headers = lines[0]
            .split(",")
            .map((header) => header.replace(/"/g, "").trim().toLowerCase());

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === "") continue;

            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].replace(/"/g, "").trim();
                });
                data.push(row);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    processVillagesData(dusunData, umkmData) {
        const villages = [];

        // Group UMKM by dusun
        const umkmByDusun = {};
        umkmData.forEach((umkm) => {
            const dusunName = umkm["nama dusun"] || umkm["dusun"];
            if (!dusunName) return;

            if (!umkmByDusun[dusunName]) {
                umkmByDusun[dusunName] = [];
            }

            // Parse koordinat UMKM
            let koordinat = [-7.6088, 110.2037]; // Default coordinates
            if (umkm.koordinat || umkm.latitude) {
                try {
                    if (umkm.koordinat && umkm.koordinat.includes(",")) {
                        const coords = umkm.koordinat.split(",");
                        koordinat = [
                            parseFloat(coords[0].trim()),
                            parseFloat(coords[1].trim()),
                        ];
                    } else if (umkm.latitude && umkm.longitude) {
                        koordinat = [parseFloat(umkm.latitude), parseFloat(umkm.longitude)];
                    }
                } catch (e) {
                    console.warn("Error parsing UMKM coordinates:", e);
                }
            }

            umkmByDusun[dusunName].push({
                nama: umkm.nama || umkm["nama umkm"] || "Tidak ada nama",
                kategori: umkm.kategori || "Lainnya",
                deskripsi: umkm.deskripsi || "Tidak ada deskripsi",
                telepon: umkm.telepon || umkm.phone || "-",
                koordinat: koordinat,
                link_gmaps:
                    umkm["link gmaps"] ||
                    umkm.gmaps ||
                    `https://maps.google.com?q=${koordinat[0]},${koordinat[1]}`,
            });
        });

        // Process dusun data
        dusunData.forEach((dusun, index) => {
            // Parse koordinat dusun
            let koordinat = [-7.6088, 110.2037]; // Default coordinates
            if (dusun.koordinat || dusun.latitude) {
                try {
                    if (dusun.koordinat && dusun.koordinat.includes(",")) {
                        const coords = dusun.koordinat.split(",");
                        koordinat = [
                            parseFloat(coords[0].trim()),
                            parseFloat(coords[1].trim()),
                        ];
                    } else if (dusun.latitude && dusun.longitude) {
                        koordinat = [
                            parseFloat(dusun.latitude),
                            parseFloat(dusun.longitude),
                        ];
                    }
                } catch (e) {
                    console.warn("Error parsing dusun coordinates:", e);
                }
            }

            const dusunName =
                dusun.nama || dusun["nama dusun"] || `Dusun ${index + 1}`;

            villages.push({
                id: `dusun-${index + 1}`,
                nama_dusun: dusunName,
                status: dusun.status || "Aktif",
                koordinat: koordinat,
                data_demografis: {
                    jumlah_penduduk:
                        parseInt(dusun["jumlah penduduk"] || dusun.penduduk || "0") || 0,
                    jumlah_kk: parseInt(dusun["jumlah kk"] || dusun.kk || "0") || 0,
                    jumlah_rt: parseInt(dusun["jumlah rt"] || dusun.rt || "0") || 0,
                    tempat_ibadah: dusun["tempat ibadah"] || dusun.ibadah || "-",
                    pekerjaan_utama: dusun["pekerjaan utama"] || dusun.pekerjaan || "-",
                    luas_wilayah:
                        parseFloat(dusun["luas wilayah"] || dusun.luas || "25") || 0,
                },
                potensi:
                    dusun.potensi ||
                    "Dusun ini memiliki beragam potensi yang mencerminkan kekayaan alam, budaya, maupun kegiatan ekonomi masyarakat setempat. Informasi potensi belum tersedia secara spesifik.",
                umkm: umkmByDusun[dusunName] || [],
            });
        });

        return villages;
    }

    async loadDusunPolygons() {
        try {
            const response = await fetch("assets/data/DesaBorobudur.geojson");
            if (!response.ok) throw new Error("Failed to load GeoJSON");
            const geojson = await response.json();

            // Save reference to polygons for later use if needed
            this.dusunPolygons = L.geoJSON(geojson, {
                style: feature => ({
                    color: "#e74c3c",
                    weight: 2,
                    fillOpacity: 0.15,
                }),
                onEachFeature: (feature, layer) => {
                    // Optionally bind popup with dusun name
                    if (feature.properties && feature.properties.nama) {
                        layer.bindPopup(`<b>Dusun:</b> ${feature.properties.nama}`);
                    }
                    // Optionally: highlight polygon on mouseover
                    layer.on("mouseover", function () {
                        this.setStyle({ fillOpacity: 0.35 });
                    });
                    layer.on("mouseout", function () {
                        this.setStyle({ fillOpacity: 0.15 });
                    });
                },
            }).addTo(this.map);
        } catch (err) {
            console.error("Error loading dusun polygons:", err);
        }
    }

    setupEventListeners() {
        // Event listener untuk dropdown dusun
        const dusunSelect = document.getElementById("dusun-select");
        if (dusunSelect) {
            dusunSelect.addEventListener("change", (e) => {
                this.onDusunChange(e.target.value);
            });
        }

        // Event listener untuk filter kategori
        const kategoriFilter = document.getElementById("kategori-filter");
        if (kategoriFilter) {
            kategoriFilter.addEventListener("change", (e) => {
                this.onKategoriFilterChange(e.target.value);
            });
        }
    }

    populateDropdown() {
        const dusunSelect = document.getElementById("dusun-select");
        if (!dusunSelect) return;

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

        // Reset all polygons to default style, then highlight the selected one
        if (this.dusunPolygons) {
            this.dusunPolygons.eachLayer(layer => {
                // Reset style for all polygons
                this.dusunPolygons.resetStyle(layer);

                // Highlight only the selected dusun
                if (
                    layer.feature &&
                    layer.feature.properties &&
                    layer.feature.properties.nama_dusun === dusun.nama_dusun
                ) {
                    layer.setStyle({ fillOpacity: 0.35, color: "#7ac02bff", weight: 3 });
                    this.map.fitBounds(layer.getBounds());
                    layer.openPopup();
                }
            });
        }
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

        if (
            !infoSection ||
            !namaElement ||
            !statusElement ||
            !demografisElement ||
            !potensiElement
        ) {
            console.warn("Some info elements not found");
            return;
        }

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
        <span class="demografis-label">Jumlah KK:</span>
        <span class="demografis-value">${dusun.data_demografis.jumlah_kk.toLocaleString(
            "id-ID"
        )} KK</span>
    </div>
    <div class="demografis-item">
        <span class="demografis-label">Jumlah RT:</span>
        <span class="demografis-value">${dusun.data_demografis.jumlah_rt
            } RT</span>
    </div>
    <div class="demografis-item">
        <span class="demografis-label">Tempat Ibadah:</span>
        <span class="demografis-value">${dusun.data_demografis.tempat_ibadah
            }</span>
    </div>
    <div class="demografis-item">
        <span class="demografis-label">Pekerjaan Utama:</span>
        <span class="demografis-value">${dusun.data_demografis.pekerjaan_utama
            }</span>
    </div>
    <div class="demografis-item">
        <span class="demografis-label">Luas Wilayah:</span>
        <span class="demografis-value">${dusun.data_demografis.luas_wilayah
            } km²</span>
    </div>
`;

        // Set potensi
        potensiElement.textContent = dusun.potensi;

        // Tampilkan section
        infoSection.classList.remove("hidden");
    }

    showUMKMSection(dusun) {
        const umkmSection = document.getElementById("umkm-section");
        if (!umkmSection) {
            console.warn("UMKM section not found");
            return;
        }

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
        if (!kategoriFilter) return;

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
        if (!tbody) return;

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
                // Simple highlight effect with CSS animation
                const markerElement = targetMarker.getElement();
                if (markerElement) {
                    markerElement.style.animation = "bounce 0.6s ease-in-out";
                    setTimeout(() => {
                        markerElement.style.animation = "";
                    }, 600);
                }
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
            if (tableContainer) {
                tableContainer.parentNode.insertBefore(
                    paginationContainer,
                    tableContainer.nextSibling
                );
            }
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
        <button id="prev-btn" class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""
            }>
          ← Sebelumnya
        </button>
        <div class="page-indicator">
          <span>Halaman</span>
          <span class="current-page">${this.currentPage}</span>
          <span>dari ${this.totalPages}</span>
        </div>
        <button id="next-btn" class="pagination-btn" ${this.currentPage === this.totalPages ? "disabled" : ""
            }>
          Selanjutnya →
        </button>
      </div>
    `;

        // Add event listeners
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderUMKMTable();
                    this.renderPagination();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderUMKMTable();
                    this.renderPagination();
                }
            });
        }
    }

    resetView() {
        // Reset ke view default
        this.map.setView(this.defaultCoordinates, 13);

        // Clear markers
        this.clearDusunAndUMKMMarkers();

        // Hide info sections
        const dusunInfo = document.getElementById("dusun-info");
        const umkmSection = document.getElementById("umkm-section");

        if (dusunInfo) dusunInfo.classList.add("hidden");
        if (umkmSection) umkmSection.classList.add("hidden");

        // Reset current dusun
        this.currentDusun = null;
        this.filteredUMKM = [];

        // Reset pagination
        this.currentPage = 1;
        this.totalPages = 0;
    }

    showLoading(message = "Memuat...") {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById("loading-overlay");
        if (!loadingOverlay) {
            loadingOverlay = document.createElement("div");
            loadingOverlay.id = "loading-overlay";
            loadingOverlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-message">${message}</p>
        </div>
      `;
            document.body.appendChild(loadingOverlay);
        }

        // Update message and show
        const loadingMessage = loadingOverlay.querySelector(".loading-message");
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }

        loadingOverlay.classList.remove("hidden");
        loadingOverlay.style.display = "flex";
    }

    hideLoading() {
        const loadingOverlay = document.getElementById("loading-overlay");
        if (loadingOverlay) {
            loadingOverlay.classList.add("hidden");
            loadingOverlay.style.display = "none";
        }
    }

    showError(message) {
        // Create error toast if it doesn't exist
        let errorToast = document.getElementById("error-toast");
        if (!errorToast) {
            errorToast = document.createElement("div");
            errorToast.id = "error-toast";
            errorToast.className = "error-toast";
            document.body.appendChild(errorToast);
        }

        // Set message and show
        errorToast.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.classList.add('hidden')">✕</button>
      </div>
    `;

        errorToast.classList.remove("hidden");

        // Auto hide after 5 seconds
        setTimeout(() => {
            if (errorToast) {
                errorToast.classList.add("hidden");
            }
        }, 5000);
    }

    // Method untuk export data (opsional)
    exportUMKMData() {
        if (!this.currentDusun || this.filteredUMKM.length === 0) {
            this.showError("Tidak ada data UMKM untuk diekspor");
            return;
        }

        // Prepare data for export
        const exportData = this.filteredUMKM.map((umkm, index) => ({
            No: index + 1,
            Nama: umkm.nama,
            Kategori: umkm.kategori,
            Deskripsi: umkm.deskripsi,
            Telepon: umkm.telepon,
            Koordinat: `${umkm.koordinat[0]}, ${umkm.koordinat[1]}`,
            "Link Google Maps": umkm.link_gmaps,
        }));

        // Convert to CSV
        const csvContent = this.convertToCSV(exportData);

        // Download file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `UMKM_${this.currentDusun.nama_dusun}_${new Date().toISOString().split("T")[0]
            }.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        if (data.length === 0) return "";

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(","));

        // Add data rows
        data.forEach((row) => {
            const values = headers.map((header) => {
                const value = row[header] || "";
                // Escape commas and quotes in values
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(","));
        });

        return csvRows.join("\n");
    }

    // Method untuk print informasi dusun (opsional)
    printDusunInfo() {
        if (!this.currentDusun) {
            this.showError("Pilih dusun terlebih dahulu");
            return;
        }

        const printWindow = window.open("", "_blank");
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informasi ${this.currentDusun.nama_dusun}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
          .demografis-item { display: flex; justify-content: space-between; padding: 5px 0; }
          .umkm-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .umkm-table th, .umkm-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .umkm-table th { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Informasi Dusun ${this.currentDusun.nama_dusun}</h1>
          <p>Desa Borobudur, Kabupaten Magelang, Jawa Tengah</p>
          <p>Dicetak pada: ${new Date().toLocaleDateString("id-ID")}</p>
        </div>
        
        <div class="section">
          <h3>Data Demografis</h3>
          <div class="demografis-item">
            <strong>Status:</strong> <span>${this.currentDusun.status}</span>
          </div>
          <div class="demografis-item">
            <strong>Jumlah Penduduk:</strong> <span>${this.currentDusun.data_demografis.jumlah_penduduk.toLocaleString(
            "id-ID"
        )} jiwa</span>
          </div>
          <div class="demografis-item">
            <strong>Jumlah KK:</strong> <span>${this.currentDusun.data_demografis.jumlah_kk.toLocaleString(
            "id-ID"
        )} KK</span>
          </div>
          <div class="demografis-item">
            <strong>Jumlah RT:</strong> <span>${this.currentDusun.data_demografis.jumlah_rt
            } RT</span>
          </div>
          <div class="demografis-item">
            <strong>Tempat Ibadah:</strong> <span>${this.currentDusun.data_demografis.tempat_ibadah
            }</span>
          </div>
          <div class="demografis-item">
            <strong>Pekerjaan Utama:</strong> <span>${this.currentDusun.data_demografis.pekerjaan_utama
            }</span>
          </div>
          <div class="demografis-item">
            <strong>Luas Wilayah:</strong> <span>${this.currentDusun.data_demografis.luas_wilayah
            } km²</span>
          </div>
        </div>

        <div class="section">
          <h3>Potensi Dusun</h3>
          <p>${this.currentDusun.potensi}</p>
        </div>

        <div class="section">
          <h3>Daftar UMKM (${this.currentDusun.umkm.length} UMKM)</h3>
          <table class="umkm-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama UMKM</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Telepon</th>
              </tr>
            </thead>
            <tbody>
              ${this.currentDusun.umkm
                .map(
                    (umkm, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${umkm.nama}</td>
                  <td>${umkm.kategori}</td>
                  <td>${umkm.deskripsi}</td>
                  <td>${umkm.telepon}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Halaman
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // Method untuk mendapatkan statistik UMKM
    getUMKMStatistics() {
        if (!this.currentDusun) return null;

        const umkmList = this.currentDusun.umkm;
        const statistics = {
            total: umkmList.length,
            byCategory: {},
        };

        // Hitung berdasarkan kategori
        umkmList.forEach((umkm) => {
            const kategori = umkm.kategori;
            if (!statistics.byCategory[kategori]) {
                statistics.byCategory[kategori] = 0;
            }
            statistics.byCategory[kategori]++;
        });

        return statistics;
    }

    // Method untuk search UMKM berdasarkan nama
    searchUMKM(query) {
        if (!this.currentDusun) return;

        const searchQuery = query.toLowerCase().trim();

        if (searchQuery === "") {
            // Reset ke semua UMKM
            this.filteredUMKM = this.currentDusun.umkm;
        } else {
            // Filter berdasarkan nama atau deskripsi
            this.filteredUMKM = this.currentDusun.umkm.filter(
                (umkm) =>
                    umkm.nama.toLowerCase().includes(searchQuery) ||
                    umkm.deskripsi.toLowerCase().includes(searchQuery)
            );
        }

        // Update markers dan tabel
        this.updateUMKMMarkersBasedOnFilter();
        this.currentPage = 1;
        this.calculatePagination();
        this.renderUMKMTable();
        this.renderPagination();
    }
}

// Initialize aplikasi ketika DOM sudah siap
document.addEventListener("DOMContentLoaded", () => {
    try {
        // Check if required elements exist
        const requiredElements = ["map", "dusun-select"];
        const missingElements = requiredElements.filter(
            (id) => !document.getElementById(id)
        );

        if (missingElements.length > 0) {
            console.error("Missing required elements:", missingElements);
            return;
        }

        // Initialize aplikasi
        window.petaDigitalDesa = new PetaDigitalDesa();
        console.log("Peta Digital Desa initialized successfully");
    } catch (error) {
        console.error("Failed to initialize Peta Digital Desa:", error);
    }
});

// CSS Animation untuk marker bounce effect (bisa ditambahkan ke CSS file)
const bounceKeyframes = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

// Inject CSS animation jika belum ada
if (!document.querySelector("#bounce-animation-style")) {
    const style = document.createElement("style");
    style.id = "bounce-animation-style";
    style.textContent = bounceKeyframes;
    document.head.appendChild(style);
}
