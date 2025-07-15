// Splash Screen JavaScript
class SplashScreen {
  constructor() {
    this.splashElement = null;
    this.progressBar = null;
    this.loadingText = null;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.isLoading = true;
    this.loadingMessages = [
      "Memuat peta digital...",
      "Menginisialisasi data dusun...",
      "Menyiapkan informasi UMKM...",
      "Menyelesaikan pemuatan...",
      "Selamat datang!",
    ];
    this.currentMessageIndex = 0;

    this.init();
  }

  init() {
    // Add splash-active class to body
    document.body.classList.add("splash-active");

    // Create splash screen
    this.createSplashScreen();

    // Start loading simulation
    this.startLoadingSequence();
  }

  createSplashScreen() {
    const splashHTML = `
      <div class="splash-screen" id="splash-screen">
        <div class="splash-particles">
          ${this.createParticles()}
        </div>
        <div class="splash-content">
          <img src="assets/Images/Logo.png" alt="Logo KKN" class="splash-logo" onerror="this.style.display='none'">
          <h1 class="splash-title">Peta Digital</h1>
          <p class="splash-subtitle">Desa Borobudur</p>
          <p class="splash-tagline">Jelajahi potensi dusun dan UMKM lokal</p>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text" id="loading-text">Memuat peta digital...</div>
            <div class="loading-progress">
              <div class="loading-progress-bar" id="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert splash screen at the beginning of body
    document.body.insertAdjacentHTML("afterbegin", splashHTML);

    // Get references to elements
    this.splashElement = document.getElementById("splash-screen");
    this.progressBar = document.getElementById("progress-bar");
    this.loadingText = document.getElementById("loading-text");
  }

  createParticles() {
    let particles = "";
    for (let i = 0; i < 8; i++) {
      const left = Math.random() * 100;
      const animationDuration = 4 + Math.random() * 4;
      const size = 2 + Math.random() * 4;

      particles += `
        <div class="particle" style="
          left: ${left}%; 
          animation-duration: ${animationDuration}s;
          width: ${size}px;
          height: ${size}px;
        "></div>
      `;
    }
    return particles;
  }

  updateProgress(progress) {
    this.targetProgress = Math.min(progress, 100);
    this.animateProgress();
  }

  animateProgress() {
    const progressDiff = this.targetProgress - this.currentProgress;
    const step = progressDiff * 0.1;

    this.currentProgress += step;

    if (this.progressBar) {
      this.progressBar.style.width = this.currentProgress + "%";
    }

    if (Math.abs(progressDiff) > 0.1) {
      requestAnimationFrame(() => this.animateProgress());
    }
  }

  updateLoadingText(message) {
    if (this.loadingText) {
      this.loadingText.style.opacity = "0";
      setTimeout(() => {
        this.loadingText.textContent = message;
        this.loadingText.style.opacity = "1";
      }, 200);
    }
  }

  startLoadingSequence() {
    const sequences = [
      { progress: 20, delay: 500 },
      { progress: 40, delay: 800 },
      { progress: 60, delay: 1000 },
      { progress: 80, delay: 1200 },
      { progress: 100, delay: 1500 },
    ];

    let currentSequence = 0;

    const executeSequence = () => {
      if (currentSequence < sequences.length) {
        const sequence = sequences[currentSequence];

        setTimeout(() => {
          // Update progress
          this.updateProgress(sequence.progress);

          // Update loading message
          if (this.currentMessageIndex < this.loadingMessages.length) {
            this.updateLoadingText(
              this.loadingMessages[this.currentMessageIndex]
            );
            this.currentMessageIndex++;
          }

          currentSequence++;
          executeSequence();
        }, sequence.delay);
      } else {
        // Loading complete
        setTimeout(() => {
          this.completeSplash();
        }, 800);
      }
    };

    executeSequence();
  }

  completeSplash() {
    this.isLoading = false;

    // Add fade-out class
    if (this.splashElement) {
      this.splashElement.classList.add("fade-out");
    }

    // Remove splash screen after animation
    setTimeout(() => {
      if (this.splashElement) {
        this.splashElement.remove();
      }

      // Remove splash-active class from body
      document.body.classList.remove("splash-active");

      // Dispatch custom event when splash is complete
      document.dispatchEvent(new CustomEvent("splashComplete"));

      // Initialize main app if function exists
      if (typeof window.initializeApp === "function") {
        window.initializeApp();
      }
    }, 800);
  }

  // Public method to manually hide splash (if needed)
  hide() {
    if (this.isLoading) {
      this.completeSplash();
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Create splash screen instance
  window.splashScreen = new SplashScreen();
});

// Alternative initialization for immediate execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.splashScreen) {
      window.splashScreen = new SplashScreen();
    }
  });
} else {
  // DOM is already ready
  if (!window.splashScreen) {
    window.splashScreen = new SplashScreen();
  }
}

// Utility functions for integration with main app
window.splashUtils = {
  // Hide splash screen manually
  hideSplash() {
    if (window.splashScreen) {
      window.splashScreen.hide();
    }
  },

  // Check if splash is still active
  isSplashActive() {
    return document.body.classList.contains("splash-active");
  },

  // Listen for splash completion
  onSplashComplete(callback) {
    if (this.isSplashActive()) {
      document.addEventListener("splashComplete", callback, { once: true });
    } else {
      // Splash already completed
      callback();
    }
  },
};

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden, you might want to pause animations
    if (window.splashScreen && window.splashScreen.isLoading) {
      // Optional: pause loading animation
    }
  } else {
    // Page is visible again
    if (window.splashScreen && window.splashScreen.isLoading) {
      // Optional: resume loading animation
    }
  }
});

// Handle window resize during splash
window.addEventListener("resize", () => {
  if (document.body.classList.contains("splash-active")) {
    // Optional: handle responsive adjustments
  }
});

// Error handling for logo loading
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const logoImg = document.querySelector(".splash-logo");
    if (logoImg) {
      logoImg.onerror = function () {
        console.warn("Logo tidak dapat dimuat, menyembunyikan element logo");
        this.style.display = "none";
      };
    }
  }, 100);
});

// Preload critical resources
function preloadCriticalResources() {
  const resources = [
    "assets/Images/Logo.png",
    "assets/css/style.css",
    "assets/js/app.js",
  ];

  resources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource;
    link.as = resource.endsWith(".css")
      ? "style"
      : resource.endsWith(".js")
      ? "script"
      : "image";
    document.head.appendChild(link);
  });
}

// Initialize preloading
preloadCriticalResources();
