import { useEffect, useRef } from "react";

const safeNumber = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;

  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export default function RideMap({ ride }) {
  const mapRef = useRef(null);
  const markersRef = useRef({ from: null, to: null });

  useEffect(() => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: { lat: 52.0, lng: 19.0 },
    });

    const fromLat = safeNumber(ride.from_lat);
    const fromLng = safeNumber(ride.from_lng);
    const toLat = safeNumber(ride.to_lat);
    const toLng = safeNumber(ride.to_lng);

    console.log("FROM raw:", ride.from_lat, ride.from_lng);
    console.log("TO raw:", ride.to_lat, ride.to_lng);
    console.log("PARSED:", { fromLat, fromLng, toLat, toLng });

    if (!fromLat || !fromLng || !toLat || !toLng) {
      console.warn("Invalid coordinates, nothing drawn.");
      return;
    }

    markersRef.current.from = new window.google.maps.Marker({
      position: { lat: fromLat, lng: fromLng },
      map,
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    });

    markersRef.current.to = new window.google.maps.Marker({
      position: { lat: toLat, lng: toLng },
      map,
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: false,
    });
    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: { lat: fromLat, lng: fromLng },
        destination: { lat: toLat, lng: toLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(res);
        } else {
          new window.google.maps.Polyline({
            map,
            path: [
              { lat: fromLat, lng: fromLng },
              { lat: toLat, lng: toLng },
            ],
            strokeColor: "#4285F4",
            strokeWeight: 3,
          });
        }
      }
    );

    return () => {
      Object.values(markersRef.current).forEach((m) => { if (m) m.setMap(null); });
      markersRef.current = { from: null, to: null };
      directionsRenderer.setMap(null);
    };
  }, [ride]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
    />
  );
}
