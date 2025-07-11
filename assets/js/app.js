// Peta Digital Desa - Main Application
class PetaDigitalDesa {
  constructor() {
    this.map = null;
    this.villageData = null;
    this.markers = [];
    this.activeVillage = null;

    // Initialize application
    this.init();
  }

  async init() {
    try {
      // Load village data
      await this.loadVillageData();

      // Initialize map
      this.initMap();

      // Render village list
      this.renderVillageList();

      // Add markers to map
      this.addVillageMarkers();
    } catch (error) {
      console.error("Error initializing application:", error);
      this.showError("Gagal memuat data aplikasi");
    }
  }

  async loadVillageData() {
    try {
      // In a real application, this would be an API call
      // For now, we'll use the data from villages.json
      const response = await fetch("assets/data/villages.json");
      if (!response.ok) {
        throw new Error("Failed to load village data");
      }
      this.villageData = await response.json();
    } catch (error) {
      // Fallback data if JSON file is not available
      this.villageData = {
        villages: [
          {
            id: "desa-makmur",
            name: "Desa Makmur",
            coordinates: [-7.2575, 110.8309],
            population: 1250,
            area: "15.5 km²",
            kepala_desa: "Pak Slamet Riyadi",
            umkm: [
              {
                id: 1,
                name: "Warung Nasi Gudeg Bu Sari",
                type: "Kuliner",
                owner: "Ibu Sari Rahayu",
                address: "Jl. Makmur No. 15",
                phone: "0813-xxxx-xxxx",
                established: "2018",
              },
              {
                id: 2,
                name: "Kerajinan Bambu Sejahtera",
                type: "Kerajinan",
                owner: "Pak Bambang Sutrisno",
                address: "Jl. Bambu Raya No. 8",
                phone: "0856-xxxx-xxxx",
                established: "2019",
              },
              {
                id: 3,
                name: "Toko Sembako Berkah",
                type: "Retail",
                owner: "Ibu Ning Suryani",
                address: "Jl. Pasar Desa No. 3",
                phone: "0822-xxxx-xxxx",
                established: "2020",
              },
            ],
          },
          {
            id: "desa-sejahtera",
            name: "Desa Sejahtera",
            coordinates: [-7.2675, 110.8409],
            population: 980,
            area: "12.8 km²",
            kepala_desa: "Ibu Tri Wahyuni",
            umkm: [
              {
                id: 4,
                name: "Warung Pecel Lele Mas Joko",
                type: "Kuliner",
                owner: "Pak Joko Susilo",
                address: "Jl. Sejahtera No. 22",
                phone: "0815-xxxx-xxxx",
                established: "2017",
              },
              {
                id: 5,
                name: "Salon Cantik Indah",
                type: "Jasa",
                owner: "Ibu Indah Permata",
                address: "Jl. Cantik No. 5",
                phone: "0812-xxxx-xxxx",
                established: "2021",
              },
              {
                id: 6,
                name: "Bengkel Motor Jaya",
                type: "Jasa",
                owner: "Pak Surya Dinata",
                address: "Jl. Raya Desa No. 45",
                phone: "0878-xxxx-xxxx",
                established: "2016",
              },
              {
                id: 7,
                name: "Toko Baju Murah",
                type: "Retail",
                owner: "Ibu Ratna Sari",
                address: "Jl. Fashion No. 12",
                phone: "0821-xxxx-xxxx",
                established: "2019",
              },
            ],
          },
          {
            id: "desa-maju",
            name: "Desa Maju",
            coordinates: [-7.2475, 110.8509],
            population: 1450,
            area: "18.2 km²",
            kepala_desa: "Pak Agung Prabowo",
            umkm: [
              {
                id: 8,
                name: "Warung Soto Ayam Pak Hadi",
                type: "Kuliner",
                owner: "Pak Hadi Mulyono",
                address: "Jl. Maju Bersama No. 7",
                phone: "0813-xxxx-xxxx",
                established: "2015",
              },
              {
                id: 9,
                name: "Photocopy dan Print Digital",
                type: "Jasa",
                owner: "Pak Agus Santoso",
                address: "Jl. Digital No. 18",
                phone: "0857-xxxx-xxxx",
                established: "2020",
              },
              {
                id: 10,
                name: "Toko Obat Sehat",
                type: "Kesehatan",
                owner: "Ibu Siti Nurhaliza",
                address: "Jl. Sehat No. 25",
                phone: "0816-xxxx-xxxx",
                established: "2018",
              },
              {
                id: 11,
                name: "Laundry Express",
                type: "Jasa",
                owner: "Ibu Maya Sari",
                address: "Jl. Bersih No. 9",
                phone: "0823-xxxx-xxxx",
                established: "2021",
              },
              {
                id: 12,
                name: "Toko Elektronik Maju",
                type: "Retail",
                owner: "Pak Deni Kurniawan",
                address: "Jl. Elektronik No. 33",
                phone: "0834-xxxx-xxxx",
                established: "2017",
              },
            ],
          },
        ],
      };
    }
  }

  initMap() {
    // Initialize Leaflet map
    this.map = L.map("map").setView([-7.2575, 110.8409], 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    // Add custom map styling
    this.map.getContainer().style.filter = "hue-rotate(20deg) saturate(1.2)";
  }

  addVillageMarkers() {
    this.villageData.villages.forEach((village) => {
      // Create custom marker
      const marker = L.marker(village.coordinates)
        .addTo(this.map)
        .bindPopup(this.createPopupContent(village))
        .on("click", () => this.selectVillage(village));

      // Store marker reference
      this.markers.push({
        marker: marker,
        village: village,
      });
    });
  }

  createPopupContent(village) {
    return `
      <div class="popup-content">
        <div class="popup-title">${village.name}</div>
        <div class="popup-stats">
          <div class="popup-stat">👥 ${village.population.toLocaleString()} jiwa</div>
          <div class="popup-stat">📏 ${village.area}</div>
          <div class="popup-stat">🏢 ${village.umkm.length} UMKM</div>
          <div class="popup-stat">👨‍💼 ${village.kepala_desa}</div>
        </div>
      </div>
    `;
  }

  renderVillageList() {
    const villageListElement = document.getElementById("village-list");

    const villageCards = this.villageData.villages
      .map((village) => {
        return `
        <div class="village-card" data-village-id="${
          village.id
        }" onclick="app.selectVillage(this.dataset.villageId)">
          <div class="village-name">${village.name}</div>
          <div class="village-stats">
            <span>👥 ${village.population.toLocaleString()}</span>
            <span>🏢 ${village.umkm.length} UMKM</span>
          </div>
          <div class="village-info">
            📏 ${village.area} | 👨‍💼 ${village.kepala_desa}
          </div>
        </div>
      `;
      })
      .join("");

    villageListElement.innerHTML = villageCards;
  }

  selectVillage(villageId) {
    // Handle both string ID and village object
    const village =
      typeof villageId === "string"
        ? this.villageData.villages.find((v) => v.id === villageId)
        : villageId;

    if (!village) return;

    // Update active village
    this.activeVillage = village;

    // Update UI active state
    this.updateActiveVillageUI(village.id);

    // Center map on selected village
    this.map.setView(village.coordinates, 15);

    // Update details panel
    this.updateVillageDetails(village);

    // Highlight marker
    this.highlightMarker(village);
  }

  updateActiveVillageUI(villageId) {
    // Remove active class from all cards
    document.querySelectorAll(".village-card").forEach((card) => {
      card.classList.remove("active");
    });

    // Add active class to selected card
    const activeCard = document.querySelector(
      `[data-village-id="${villageId}"]`
    );
    if (activeCard) {
      activeCard.classList.add("active");
    }
  }

  highlightMarker(village) {
    // Reset all markers to default
    this.markers.forEach((item) => {
      item.marker.setIcon(new L.Icon.Default());
    });

    // Highlight selected marker
    const selectedMarker = this.markers.find(
      (item) => item.village.id === village.id
    );
    if (selectedMarker) {
      const highlightIcon = L.divIcon({
        className: "highlight-marker",
        html: `<div style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      selectedMarker.marker.setIcon(highlightIcon);
    }
  }

  updateVillageDetails(village) {
    // Update header
    document.getElementById(
      "selected-village"
    ).textContent = `🏘️ ${village.name} - Detail UMKM`;

    // Update details content
    const detailsElement = document.getElementById("umkm-details");

    if (village.umkm.length === 0) {
      detailsElement.innerHTML = `
        <div class="loading">
          Belum ada data UMKM untuk ${village.name}
        </div>
      `;
      return;
    }

    // Group UMKM by type
    const groupedUMKM = this.groupUMKMByType(village.umkm);

    // Generate UMKM list HTML
    const umkmHTML = Object.entries(groupedUMKM)
      .map(([type, umkmList]) => {
        const umkmItems = umkmList
          .map(
            (umkm) => `
        <div class="umkm-item">
          <div class="umkm-name">${umkm.name}</div>
          <div class="umkm-type">${this.getTypeIcon(umkm.type)} ${
              umkm.type
            }</div>
          <div class="umkm-owner">👤 ${umkm.owner}</div>
          <div class="umkm-address">📍 ${umkm.address}</div>
          <div class="umkm-phone">📞 ${umkm.phone}</div>
          <div class="umkm-established">🗓️ Didirikan: ${umkm.established}</div>
        </div>
      `
          )
          .join("");

        return `
        <div class="umkm-category">
          <h4 style="margin: 20px 0 10px 0; color: #667eea; font-size: 1.1rem;">
            ${this.getTypeIcon(type)} ${type} (${umkmList.length})
          </h4>
          ${umkmItems}
        </div>
      `;
      })
      .join("");

    detailsElement.innerHTML = `
      <div class="umkm-list">
        <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(145deg, #f8f9fa, #e9ecef); border-radius: 10px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">📊 Ringkasan UMKM</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9rem;">
            <div>📈 Total UMKM: <strong>${village.umkm.length}</strong></div>
            <div>🏘️ Populasi: <strong>${village.population.toLocaleString()}</strong></div>
            <div>📏 Luas: <strong>${village.area}</strong></div>
            <div>👨‍💼 Kepala Desa: <strong>${village.kepala_desa}</strong></div>
          </div>
        </div>
        ${umkmHTML}
      </div>
    `;
  }

  groupUMKMByType(umkmList) {
    return umkmList.reduce((groups, umkm) => {
      const type = umkm.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(umkm);
      return groups;
    }, {});
  }

  getTypeIcon(type) {
    const icons = {
      Kuliner: "🍽️",
      Kerajinan: "🎨",
      Retail: "🏪",
      Jasa: "⚙️",
      Kesehatan: "🏥",
    };
    return icons[type] || "🏢";
  }

  showError(message) {
    const errorHTML = `
      <div style="
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        margin: 20px 0;
      ">
        ❌ ${message}
      </div>
    `;

    document.getElementById("village-list").innerHTML = errorHTML;
    document.getElementById("umkm-details").innerHTML = errorHTML;
  }

  // Utility methods
  formatNumber(num) {
    return num.toLocaleString("id-ID");
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PetaDigitalDesa();
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = PetaDigitalDesa;
}
