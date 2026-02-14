import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

// Helper component to adjust map bounds to fit the polyline
const MapUpdater = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (positions && positions.length > 0) {
            map.fitBounds(positions, { padding: [50, 50] }); // Add padding for better visibility
        }
    }, [map, positions]);

    return null;
};

const ActivityMap = ({ activity }) => {
    // Return null or placeholder if no polyline data
    if (!activity?.map?.summary_polyline) {
        return (
            <div className="w-full h-64 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 text-gray-500">
                <span className="text-sm">Không có dữ liệu bản đồ</span>
            </div>
        );
    }

    // Decode polyline string to dictionary of coordinates [lat, lng]
    const positions = polyline.decode(activity.map.summary_polyline);

    if (!positions || positions.length === 0) return null;

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 relative z-0">
            <MapContainer
                center={positions[0]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Polyline
                    positions={positions}
                    color="#FC4C02" // Strava brand color
                    weight={4}
                    opacity={0.8}
                />
                <MapUpdater positions={positions} />
            </MapContainer>
        </div>
    );
};

export default ActivityMap;
