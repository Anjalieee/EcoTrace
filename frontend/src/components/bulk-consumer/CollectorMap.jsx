import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../../utils/api";

// Fix Leaflet default marker icon broken in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const collectorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const recyclerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recenter map when position changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 12);
  }, [lat, lng, map]);
  return null;
}

export default function CollectorMap({ orgLat, orgLng, orgName, orgCity, batchId, batchUid }) {
  const [collectors, setCollectors] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pickupConfirmation, setPickupConfirmation] = useState(null);
  const [requestingPickup, setRequestingPickup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecyclers, setShowRecyclers] = useState(true);
  const [radiusKm, setRadiusKm] = useState(30);

  useEffect(() => {
    fetchNearby();
  }, [orgLat, orgLng, orgCity, radiusKm]);

  const fetchNearby = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { lat: orgLat, lng: orgLng, city: orgCity, k: 100, radius_km: radiusKm };
      const [nearbyCollectors, nearbyRecyclers] = await Promise.all([
        api.getNearbyCollectors(params),
        api.getNearbyRecyclers(params),
      ]);
      setCollectors(nearbyCollectors);
      setRecyclers(nearbyRecyclers);
    } catch (err) {
      setError("Could not load nearby entities. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const submitPickupRequest = async () => {
    if (!selectedProvider) return;
    setRequestingPickup(true);
    try {
      await api.requestPickup(batchId, selectedProvider.type, selectedProvider.entity.id);
      setPickupConfirmation({ batchUid, providerName: selectedProvider.entity.name, providerType: selectedProvider.type });
    } catch (error) {
      alert(`Failed to request pickup: ${error.message}`);
    } finally {
      setRequestingPickup(false);
    }
  };

  const selectProvider = (type, entity) => setSelectedProvider({ type, entity });

  return (
    <div className="flex flex-col gap-4">

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Search radius:</label>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-sm text-gray-600">Your location</span>
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block ml-3" />
          <span className="text-sm text-gray-600">Collectors ({collectors.length})</span>
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block ml-3" />
          <span className="text-sm text-gray-600">Recyclers ({recyclers.length})</span>
        </div>
        <span className="text-sm font-medium text-gray-700">Showing providers in {orgCity}</span>
        <button
          onClick={() => setShowRecyclers(!showRecyclers)}
          className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
        >
          {showRecyclers ? "Hide" : "Show"} Recyclers
        </button>
      </div>

      {pickupConfirmation && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: 16,
            border: '1px solid rgba(22,163,74,0.3)',
            borderRadius: 8,
            background: 'rgba(22,163,74,0.08)',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--green-400)', marginBottom: 6 }}>
            Pickup request submitted
          </div>
          <div>Batch UID: <span className="mono" style={{ fontWeight: 700 }}>{pickupConfirmation.batchUid}</span></div>
          <div>{pickupConfirmation.providerType === 'collector' ? 'Collector' : 'Recycler'}: {pickupConfirmation.providerName}</div>
          <div>Status: Pickup requested</div>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Follow the batch through collection and handover in the partner workspaces.
          </p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
           style={{ height: "420px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        ) : (
          <MapContainer
            center={[orgLat, orgLng]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            {/* OSM Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap lat={orgLat} lng={orgLng} />

            {/* Search radius circle */}
            <Circle
              center={[orgLat, orgLng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05, weight: 1.5 }}
            />

            {/* Organisation marker */}
            <Marker position={[orgLat, orgLng]} icon={userIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{orgName}</p>
                  <p className="text-gray-500">Your location</p>
                </div>
              </Popup>
            </Marker>

            {/* Collector markers */}
            {collectors.map((c) => (
              <Marker
                key={`collector-${c.id}`}
                position={[parseFloat(c.lat), parseFloat(c.lng)]}
                icon={collectorIcon}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-semibold text-green-700">{c.name}</p>
                    <p className="text-gray-500 text-xs">Reg: {c.registration_number}</p>
                    <p className="text-gray-600 mt-1">
                      {c.distance_km} km away
                    </p>
                    <p className="text-gray-600">
                      Capacity: {c.current_capacity_kg} kg available
                    </p>
                    <p className="text-gray-600">
                      Service radius: {c.service_radius_km} km
                    </p>
                    {batchId && batchUid && (
                      <button
                        onClick={() => selectProvider('collector', c)}
                        className="mt-2 w-full bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700"
                      >
                        Select Collector
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Recycler markers */}
            {showRecyclers && recyclers.map((r) => (
              <Marker
                key={`recycler-${r.id}`}
                position={[parseFloat(r.lat), parseFloat(r.lng)]}
                icon={recyclerIcon}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-semibold text-orange-700">{r.name}</p>
                    <p className="text-gray-500 text-xs">Reg: {r.registration_number}</p>
                    <p className="text-gray-600 mt-1">
                      {r.distance_km} km away
                    </p>
                    <p className="text-gray-600">
                      Specialisation: {r.specialisation}
                    </p>
                    <p className="text-gray-600">
                      Capacity: {r.current_capacity_kg} kg available
                    </p>
                    <button
                      onClick={() => selectProvider('recycler', r)}
                      className="mt-2 w-full bg-orange-600 text-white text-xs py-1.5 rounded hover:bg-orange-700"
                    >
                      Select Recycler
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Collector list below map */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {!loading && collectors.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          No registered collectors found within {radiusKm} km of your location.
          Try increasing the search radius above.
        </div>
      )}

      {collectors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Collectors near you in {orgCity} — click a card or the map marker to request pickup
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collectors.map((c) => (
              <div
                key={c.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedProvider?.type === 'collector' && selectedProvider.entity.id === c.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
                onClick={() => selectProvider('collector', c)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-800">{c.name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {c.distance_km} km
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{c.registration_number}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Available: {c.current_capacity_kg} kg
                </p>
                <button className="mt-2 w-full text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700">
                  Select Collector
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recyclers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recyclers near you in {orgCity} — select a map pin or card</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recyclers.map((r) => (
              <div
                key={r.id}
                className={`border rounded-lg p-3 cursor-pointer ${selectedProvider?.type === 'recycler' && selectedProvider.entity.id === r.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onClick={() => selectProvider('recycler', r)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-800">{r.name}</p>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{r.distance_km} km</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{r.registration_number}</p>
                <p className="text-xs text-gray-600 mt-1">{r.specialisation} · {r.weekly_capacity_kg} kg/week</p>
                <button className="mt-2 w-full text-xs bg-orange-600 text-white py-1.5 rounded hover:bg-orange-700">Select Recycler</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProvider && (
        <div className="flex items-center justify-between gap-4 flex-wrap border rounded-lg p-4">
          <div>
            <strong>Selected {selectedProvider.type}:</strong> {selectedProvider.entity.name}
            <span className="text-sm text-gray-500"> · {selectedProvider.entity.city}</span>
          </div>
          <button className="btn btn-primary" onClick={submitPickupRequest} disabled={requestingPickup || !batchId || Boolean(pickupConfirmation)}>
            {requestingPickup ? 'Submitting…' : pickupConfirmation ? 'Request Submitted' : 'Request Pickup'}
          </button>
        </div>
      )}
    </div>
  );
}