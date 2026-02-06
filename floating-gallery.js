/**
 * Floating Photo Gallery Component
 * Vanilla JavaScript implementation for ambient photo floating effect
 */

class FloatingGallery {
    constructor(options = {}) {
        // Configuration
        this.config = {
            images: options.images || [],
            count: options.count || 6,
            size: options.size || 70, // px
            opacity: options.opacity || 0.25,
            blur: options.blur || 1, // px
            driftSpeed: options.driftSpeed || 0.3,
            mouseInfluence: options.mouseInfluence || 0.05,
            mobileScrollInfluence: options.mobileScrollInfluence || 0.02,
            container: options.container || document.body,
            zIndex: options.zIndex || -1
        };

        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.scrollY = 0;
        this.photos = [];
        this.rafId = null;

        this.init();
    }

    init() {
        // Create container
        this.galleryContainer = document.createElement('div');
        this.galleryContainer.className = 'floating-gallery-container';
        this.galleryContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.config.zIndex};
            overflow: hidden;
        `;
        this.config.container.appendChild(this.galleryContainer);

        // Create floating photos
        this.createPhotos();

        // Set up event listeners
        if (!this.isMobile) {
            this.setupMouseTracking();
        } else {
            this.setupScrollTracking();
        }

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    createPhotos() {
        const imageCount = Math.min(this.config.count, this.config.images.length);

        for (let i = 0; i < imageCount; i++) {
            const photo = this.createPhoto(i);
            this.photos.push(photo);
            this.galleryContainer.appendChild(photo.element);
        }
    }

    createPhoto(index) {
        const img = document.createElement('img');
        img.src = this.config.images[index % this.config.images.length];
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');

        // Random initial position avoiding edges and center
        const margins = { top: 100, bottom: 100, left: 100, right: 100 };
        const centerExclusionRadius = 200;

        let x, y;
        do {
            x = margins.left + Math.random() * (window.innerWidth - margins.left - margins.right);
            y = margins.top + Math.random() * (window.innerHeight - margins.top - margins.bottom);
        } while (this.isInCenterZone(x, y, centerExclusionRadius));

        // Random drift direction and speed
        const angle = Math.random() * Math.PI * 2;
        const speed = this.config.driftSpeed * (0.5 + Math.random() * 0.5);

        const photo = {
            element: img,
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            size: this.config.size * (0.8 + Math.random() * 0.4),
            rotation: Math.random() * 20 - 10,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };

        img.style.cssText = `
            position: absolute;
            width: ${photo.size}px;
            height: ${photo.size}px;
            object-fit: cover;
            border-radius: 8px;
            opacity: ${this.config.opacity};
            filter: blur(${this.config.blur}px);
            transform: translate(-50%, -50%) rotate(${photo.rotation}deg);
            transition: opacity 0.3s ease;
            will-change: transform;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;

        return photo;
    }

    isInCenterZone(x, y, radius) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance < radius;
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    setupScrollTracking() {
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });
    }

    animate() {
        this.photos.forEach((photo, index) => {
            // Update base position with drift
            photo.baseX += photo.velocityX;
            photo.baseY += photo.velocityY;
            photo.rotation += photo.rotationSpeed;

            // Bounce off edges with some margin
            const margin = 50;
            if (photo.baseX < margin || photo.baseX > window.innerWidth - margin) {
                photo.velocityX *= -1;
                photo.baseX = Math.max(margin, Math.min(window.innerWidth - margin, photo.baseX));
            }
            if (photo.baseY < margin || photo.baseY > window.innerHeight - margin) {
                photo.velocityY *= -1;
                photo.baseY = Math.max(margin, Math.min(window.innerHeight - margin, photo.baseY));
            }

            let finalX = photo.baseX;
            let finalY = photo.baseY;

            if (!this.isMobile) {
                // Desktop: mouse influence (gentle shift away from cursor)
                const dx = finalX - this.mouseX;
                const dy = finalY - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 300;

                if (distance < maxDistance) {
                    const influence = (1 - distance / maxDistance) * 30;
                    finalX += (dx / distance) * influence * this.config.mouseInfluence * 100;
                    finalY += (dy / distance) * influence * this.config.mouseInfluence * 100;
                }
            } else {
                // Mobile: scroll influence (gentle wave motion)
                const scrollInfluence = Math.sin(this.scrollY * 0.01 + index) * 20;
                finalY += scrollInfluence * this.config.mobileScrollInfluence * 100;
            }

            // Apply transform
            photo.element.style.transform = `
                translate(${finalX}px, ${finalY}px)
                translate(-50%, -50%)
                rotate(${photo.rotation}deg)
            `;
        });

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;

        // Reposition photos if switching between mobile/desktop
        if (wasMobile !== this.isMobile) {
            this.photos.forEach(photo => {
                photo.baseX = Math.random() * window.innerWidth;
                photo.baseY = Math.random() * window.innerHeight;
            });
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        this.galleryContainer.remove();
        window.removeEventListener('resize', this.handleResize);
    }

    // Public methods for dynamic control
    updateOpacity(opacity) {
        this.config.opacity = opacity;
        this.photos.forEach(photo => {
            photo.element.style.opacity = opacity;
        });
    }

    updateBlur(blur) {
        this.config.blur = blur;
        this.photos.forEach(photo => {
            photo.element.style.filter = `blur(${blur}px)`;
        });
    }

    pause() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    resume() {
        if (!this.rafId) {
            this.animate();
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingGallery;
}
