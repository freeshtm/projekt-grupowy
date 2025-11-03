import { useState, useEffect, useRef } from 'react';
import { createRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import './CreateRideForm.css';
import { MdClose } from 'react-icons/md';

function CreateRideForm({ onClose, onRideCreated }) {
  const { currentUser } = useUser();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    from_address: '',
    to_address: '',
    from_lat: 0,
    from_lng: 0,
    to_lat: 0,
    to_lng: 0,
    departure_time: '',
    price_per_seat: '',
    seats_available: ''
  });
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [markers, setMarkers] = useState({ from: null, to: null });
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [pointCount, setPointCount] = useState(0);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 52.2297, lng: 21.0122 },
        zoom: 11,
      });

      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: true
      });
      setDirectionsRenderer(renderer);

      const geocoder = new window.google.maps.Geocoder();

      mapRef.current.addListener('dblclick', (e) => {
        e.stop();

        setError('');

        // Nie pozwól dodać więcej niż dwóch punktów
        setPointCount(prevCount => {
          if (prevCount >= 2) {
            setError('Zresetuj punkty, aby wybrać nowe');
            return prevCount;
          }

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const pointType = prevCount === 0 ? 'from' : 'to';

          geocoder.geocode({ location: { lat, lng }, region: 'pl' }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;

              // Usuń poprzedni marker, jeśli istnieje
              if (markers[pointType]) {
                markers[pointType].setMap(null);
              }

              // Dodaj marker
              const newMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapRef.current,
                icon: {
                  url:
                    pointType === 'from'
                      ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                },
              });

              setMarkers(prev => ({ ...prev, [pointType]: newMarker }));

              // Zapisz dane do formData
              setFormData(prev => ({
                ...prev,
                [`${pointType}_address`]: address,
                [`${pointType}_lat`]: lat,
                [`${pointType}_lng`]: lng,
              }));

              // Jeśli wybrano drugi punkt, rysuj trasę
              if (pointType === 'to') {
                calculateAndDisplayRoute(
                  formData.from_lat || lat,
                  formData.from_lng || lng,
                  lat,
                  lng
                );
              }
            } else {
              setError('Nie udało się pobrać adresu');
            }
          });

          return prevCount + 1;
        });
      });

      mapRef.current.addListener('mousemove', () => {
        mapContainerRef.current.style.cursor = 'crosshair';
      });
    }
  }, [formData, markers]);

  const calculateAndDisplayRoute = async (fromLat, fromLng, toLat, toLng) => {
    const directionsService = new window.google.maps.DirectionsService();
    try {
      const result = await directionsService.route({
        origin: { lat: fromLat, lng: fromLng },
        destination: { lat: toLat, lng: toLng },
        travelMode: window.google.maps.TravelMode.DRIVING
      });
      directionsRenderer.setDirections(result);
    } catch (error) {
      setError('Nie udało się wyznaczyć trasy');
    }
  };

  const resetPoints = () => {
    Object.values(markers).forEach(marker => {
      if (marker) marker.setMap(null);
    });
    
    setMarkers({ from: null, to: null });
    setFormData(prev => ({
      ...prev,
      from_address: '',
      to_address: '',
      from_lat: 0,
      from_lng: 0,
      to_lat: 0,
      to_lng: 0
    }));
    
    setPointCount(0);
    setError('');

    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const rideData = {
        ...formData,
        driver_id: currentUser.id,
        price_per_seat: parseFloat(formData.price_per_seat),
        seats_available: parseInt(formData.seats_available)
      };

      const newRide = await createRide(rideData);
      onRideCreated(newRide);
      onClose();
    } catch (err) {
      setError('Błąd tworzenia przejazdu');
    }
  };

  return (
    <div className="create-ride-form">
      <div className="form-header">
        <h3>Utwórz Nowy Przejazd</h3>
        <button className="close-btn" onClick={onClose}><MdClose /></button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="map-instruction">
          {pointCount === 0
            ? 'Kliknij dwukrotnie, aby wybrać początek'
            : pointCount === 1
            ? 'Kliknij dwukrotnie, aby wybrać cel'
            : 'Wybrano oba punkty'}
        </div>

        <div className="form-group">
          <label>Miejsce wyjazdu:</label>
          <input
            type="text"
            value={formData.from_address}
            readOnly
            placeholder="Punkt początkowy zostanie wybrany na mapie"
          />
        </div>

        <div className="form-group">
          <label>Miejsce docelowe:</label>
          <input
            type="text"
            value={formData.to_address}
            readOnly
            placeholder="Punkt docelowy zostanie wybrany na mapie"
          />
        </div>

        <div className="map-container" ref={mapContainerRef}></div>
        
        <input type="hidden" name="from_lat" value={formData.from_lat} />
        <input type="hidden" name="from_lng" value={formData.from_lng} />
        <input type="hidden" name="to_lat" value={formData.to_lat} />
        <input type="hidden" name="to_lng" value={formData.to_lng} />

        <div className="form-group">
          <label>Data i czas wyjazdu:</label>
          <input
            type="datetime-local"
            name="departure_time"
            value={formData.departure_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cena za miejsce (zł):</label>
            <input
              type="number"
              step="0.01"
              name="price_per_seat"
              value={formData.price_per_seat}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Liczba miejsc:</label>
            <input
              type="number"
              name="seats_available"
              value={formData.seats_available}
              onChange={handleChange}
              required
              min="1"
              max="8"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetPoints}
            className="reset-btn"
          >
            Resetuj punkty
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Anuluj
          </button>
          <button 
            type="submit" 
            disabled={pointCount < 2} 
            className="submit-btn"
          >
            Utwórz Przejazd
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRideForm;
