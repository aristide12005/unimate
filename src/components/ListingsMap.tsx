import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Dakar neighborhood coordinates ────
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
    "Almadies": [14.7413, -17.5116],
    "Mermoz": [14.7050, -17.4714],
    "Sacré-Cœur": [14.7218, -17.4658],
    "Ouakam": [14.7273, -17.4930],
    "Yoff": [14.7623, -17.4843],
    "Plateau": [14.6697, -17.4381],
    "Liberté 6": [14.7115, -17.4576],
    "HLM": [14.7030, -17.4470],
    "Grand Yoff": [14.7320, -17.4510],
    "Point E": [14.6963, -17.4628],
    "Fann": [14.6930, -17.4710],
    "Médina": [14.6820, -17.4450],
    "Parcelles Assainies": [14.7580, -17.4440],
    "Ngor": [14.7510, -17.5150],
    "Dakar Ponty": [14.6760, -17.4360],
};

const DEFAULT_COORDS: [number, number] = [14.7167, -17.4677]; // Central Dakar

function getListingCoordsSync(location: string): [number, number] | null {
    if (!location) return null;
    for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
        if (location.toLowerCase().includes(name.toLowerCase())) {
            return coords;
        }
    }
    return null;
}

export function ListingsMap({ listings, onMarkerClick }: { listings: any[], onMarkerClick?: (id: number) => void }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstance.current) {
            // Initialize map
            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView(DEFAULT_COORDS, 13);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);
            L.control.attribution({ position: "bottomleft" }).addTo(map);

            mapInstance.current = map;
        }

        const map = mapInstance.current;

        // Clear old markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        const newBounds = L.latLngBounds([]);

        listings.forEach(listing => {
            let coords: [number, number] | null = null;
            if (listing.latitude != null && listing.longitude != null) {
                coords = [listing.latitude, listing.longitude];
            } else {
                coords = getListingCoordsSync(listing.location);
            }

            if (coords) {
                // Add a tiny random jitter for identical neighborhood coords so they don't exactly stack
                const jitterLat = listing.latitude ? coords[0] : coords[0] + (Math.random() - 0.5) * 0.005;
                const jitterLon = listing.longitude ? coords[1] : coords[1] + (Math.random() - 0.5) * 0.005;

                const finalCoords: [number, number] = [jitterLat, jitterLon];
                newBounds.extend(finalCoords);

                const priceIcon = L.divIcon({
                    className: "custom-price-marker",
                    html: `
                        <div class="map-price-marker group relative hover:z-50 cursor-pointer" style="text-align: center; transform-origin: center;">
                            <div style="
                                background: white;
                                color: #111827;
                                padding: 6px 12px;
                                border-radius: 24px;
                                font-size: 13px;
                                font-weight: 800;
                                white-space: nowrap;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                                text-align: center;
                                cursor: pointer;
                                transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
                            " class="group-hover:scale-110 group-hover:bg-primary group-hover:text-white hover-target z-10 relative">
                                ${parseInt(listing.price || '0').toLocaleString()} F
                            </div>
                            <div class="absolute opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center pointer-events-none z-50 scale-0 group-hover:scale-100 shadow-xl rounded-xl" style="top: -160px; left: 50%; transform: translateX(-50%); width: 220px; background: white; border: 1px solid #eee;">
                                ${listing.image ? `<img src="${listing.image}" class="w-full h-24 object-cover rounded-t-xl" />` : ''}
                                <div class="p-2 w-full text-left">
                                    <p class="font-bold text-gray-900 truncate">${listing.title}</p>
                                    <p class="text-xs text-gray-500 truncate">${listing.location}</p>
                                </div>
                            </div>
                        </div>
                    `,
                    iconSize: [80, 28],
                    iconAnchor: [40, 14],
                });

                const marker = L.marker(finalCoords, { icon: priceIcon }).addTo(map);

                marker.on('click', () => {
                    if (onMarkerClick) onMarkerClick(listing.id);
                });

                marker.on('mouseover', function () {
                    marker.setZIndexOffset(1000);
                });
                marker.on('mouseout', function () {
                    marker.setZIndexOffset(0);
                });

                markersRef.current.push(marker);
            }
        });

        // Fit bounds if there are markers, otherwise keep default
        if (markersRef.current.length > 0) {
            map.fitBounds(newBounds, { padding: [50, 50], maxZoom: 15 });
        } else {
            map.setView(DEFAULT_COORDS, 13);
        }

    }, [listings, onMarkerClick]);

    return <div ref={mapRef} className="w-full h-full z-0" />;
}
