document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('map')) {
        // Initialize map
        const map = L.map('map', {
            center: [36.89077467823917, 10.18329152186601],
            zoom: 18,
            zoomControl: true,
            attributionControl: true
        });

        // Add satellite layer using OpenStreetMap
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
            maxZoom: 19
        }).addTo(map);

        // Add building categories control
        const buildingCategories = L.control({position: 'topright'});
        buildingCategories.onAdd = function() {
            const div = L.DomUtil.create('div', 'building-categories glass-card');
            div.innerHTML = `
                <h3 class="font-bold mb-2 text-lg flex gap-2 items-center">
                <i class="fas fa-book mr-2"></i> 
                Guide</h3>
                <div class="flex flex-col gap-2">
                    <button class="category-btn active" data-category="academic">
                        <i class="fas fa-graduation-cap"></i> Académique
                    </button>
                    <button class="category-btn" data-category="services">
                        <i class="fas fa-utensils"></i> Services
                    </button>
                    <button class="category-btn" data-category="sports">
                        <i class="fas fa-running"></i> Sports
                    </button>
                    <button class="category-btn" data-category="residence">
                        <i class="fas fa-home"></i> Résidence
                    </button>
                </div>
            `;
            return div;
        };
        buildingCategories.addTo(map);
        // Add event listener for category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelector('.category-btn.active').classList.remove('active');
                this.classList.add('active');
                const category = this.getAttribute('data-category');
                document.querySelectorAll('.custom-marker').forEach(marker => {
                    marker.style.display = category === 'all' || marker.classList.contains(category) ? 'block' : 'none';
                });
            });
        });

        // Parse KML and add markers
        fetch('files/isetcom.kml')
            .then(response => response.text())
            .then(kmlText => {
                const parser = new DOMParser();
                const kml = parser.parseFromString(kmlText, 'text/xml');
                
                const placemarks = kml.getElementsByTagName('Placemark');

                Array.from(placemarks).forEach(placemark => {
                    const name = placemark.getElementsByTagName('name')[0]?.textContent;
                    const coords = placemark.getElementsByTagName('coordinates')[0]?.textContent;
                    
                    if (coords && name !== 'Diapositive sans titre') {
                        const [lng, lat, alt] = coords.split(',').map(Number);
                        
                        // Categorize building
                        let category = 'academic';
                        if (name.includes('Restaurant') || name.includes('Bibliothèque') || name.includes('Administration')) {
                            category = 'services';
                        } else if (name.includes('Sport') || name.includes('Terrain')) {
                            category = 'sports';
                        } else if (name.includes('Foyer')) {
                            category = 'residence';
                        }

                        // Create marker
                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: `custom-marker ${category}`,
                                html: `<i class="fas fa-map-marker-alt" style="color: ${getMarkerColor(category)}"></i>`,
                                iconSize: [30, 30],
                                iconAnchor: [15, 30]
                            })
                        });

                        // Add popup
                        marker.bindPopup(`
                            <div class="popup-content">
                                <h3 class="font-bold text-lg">${name}</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i> 
                                    ${getCategoryName(category)}
                                </p>
                                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
                                   class="directions-btn mt-2 block text-center text-white" 
                                   target="_blank">
                                    <i class="fas fa-directions mr-1"></i> Get Directions
                                </a>
                            </div>
                        `);

                        marker.addTo(map);
                    }
                });
            })
            .catch(error => console.error('Error loading KML:', error));

        // Helper functions
        function getMarkerColor(category) {
            const colors = {
                academic: '#2196F3',
                services: '#4CAF50',
                sports: '#FF9800',
                residence: '#9C27B0'
            };
            return colors[category] || '#2196F3';
        }

        function getCategoryName(category) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
});