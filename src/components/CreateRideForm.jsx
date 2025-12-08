import { useState, useEffect, useRef } from 'react';
import { createRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import './CreateRideForm.css';
import { MdClose } from 'react-icons/md';

const extractCityFromGoogleResult = (geocodingResult) => {
  if (!geocodingResult || !geocodingResult.address_components) {
    return '';
  }

  const localityComponent = geocodingResult.address_components.find(
    component => component.types.includes('locality')
  );
  
  if (localityComponent) {
    return localityComponent.long_name.toLowerCase();
  }

  const adminArea2 = geocodingResult.address_components.find(
    component => component.types.includes('administrative_area_level_2')
  );
  
  if (adminArea2) {
    return adminArea2.long_name.toLowerCase();
  }

  return '';
};

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
    start_city: '',
    end_city: '',
    departure_time: '',
    price_per_seat: '',
    seats_available: ''
  });

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({ from: null, to: null });
  const directionsRendererRef = useRef(null);
  const [pointCount, setPointCount] = useState(0);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 52.2297, lng: 21.0122 },
        zoom: 11,
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: true
      });

      const geocoder = new window.google.maps.Geocoder();

    
      mapRef.current.addListener('dblclick', (e) => {
        e.stop();
        setError('');

        const hasFrom = !!markersRef.current.from;
        const hasTo = !!markersRef.current.to;

        let pointType;
        if (!hasFrom) pointType = 'from';
        else if (!hasTo) pointType = 'to';
        else {
          setError('Usuń istniejący punkt, aby dodać nowy');
          return;
        }

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        geocoder.geocode({ location: { lat, lng }, region: 'pl' }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const city = extractCityFromGoogleResult(results[0]);
            setMarkerAndData(lat, lng, address, pointType, city);
          } else {
            setError('Nie udało się pobrać adresu');
          }
        });
      });

      mapRef.current.addListener('mousemove', () => {
        mapContainerRef.current.style.cursor = 'crosshair';
      });


      const fromInput = document.getElementById('from-address');
      const toInput = document.getElementById('to-address');

      if (fromInput && toInput && window.google?.maps?.places) {
        const fromAutocomplete = new window.google.maps.places.Autocomplete(fromInput, {
          fields: ['geometry', 'formatted_address'],
          componentRestrictions: { country: 'pl' }
        });

        const toAutocomplete = new window.google.maps.places.Autocomplete(toInput, {
          fields: ['geometry', 'formatted_address'],
          componentRestrictions: { country: 'pl' }
        });

        fromAutocomplete.addListener('place_changed', () => {
          const place = fromAutocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            geocoder.geocode({ location: { lat, lng }, region: 'pl' }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const city = extractCityFromGoogleResult(results[0]);
                setMarkerAndData(lat, lng, place.formatted_address, 'from', city);
              }
            });
          }
        });

        toAutocomplete.addListener('place_changed', () => {
          const place = toAutocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            geocoder.geocode({ location: { lat, lng }, region: 'pl' }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const city = extractCityFromGoogleResult(results[0]);
                setMarkerAndData(lat, lng, place.formatted_address, 'to', city);
              }
            });
          }
        });
      }
    }
  }, []);

  const setMarkerAndData = (lat, lng, address, type, city = '') => {
    if (markersRef.current[type]) {
      markersRef.current[type].setMap(null);
    }

    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      icon: {
        url:
          type === 'from'
            ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    markersRef.current[type] = newMarker;

    setFormData(prev => ({
      ...prev,
      [`${type}_address`]: address,
      [`${type}_lat`]: lat,
      [`${type}_lng`]: lng,
      [`${type === 'from' ? 'start_city' : 'end_city'}`]: city
    }));

    updatePointCount();

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(13);

    const fromMarker = markersRef.current['from'];
    const toMarker = markersRef.current['to'];

    if (fromMarker && toMarker) {
      const fromPos = fromMarker.getPosition();
      const toPos = toMarker.getPosition();
      calculateAndDisplayRoute(
        fromPos.lat(),
        fromPos.lng(),
        toPos.lat(),
        toPos.lng()
      );
    }
  };

  const updatePointCount = () => {
    const hasFrom = !!markersRef.current.from;
    const hasTo = !!markersRef.current.to;
    if (hasFrom && hasTo) setPointCount(2);
    else if (hasFrom || hasTo) setPointCount(1);
    else setPointCount(0);
  };

  const calculateAndDisplayRoute = (fromLat, fromLng, toLat, toLng) => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: fromLat, lng: fromLng },
        destination: { lat: toLat, lng: toLng },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          setError('Nie udało się wyznaczyć trasy: ' + status);
        }
      }
    );
  };

  const clearPoint = (type) => {
    if (markersRef.current[type]) {
      markersRef.current[type].setMap(null);
      markersRef.current[type] = null;
    }

    setFormData(prev => ({
      ...prev,
      [`${type}_address`]: '',
      [`${type}_lat`]: 0,
      [`${type}_lng`]: 0,
      [`${type === 'from' ? 'start_city' : 'end_city'}`]: ''
    }));

    updatePointCount();

    const fromMarker = markersRef.current['from'];
    const toMarker = markersRef.current['to'];
    if (!fromMarker || !toMarker) {
      directionsRendererRef.current.setDirections({ routes: [] });
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
            ? 'Kliknij dwukrotnie lub wpisz, aby wybrać początek'
            : pointCount === 1
            ? 'Kliknij dwukrotnie lub wpisz, aby wybrać cel'
            : 'Wybrano oba punkty'}
        </div>

        
        <div className="form-group address-input">
          <label>Miejsce wyjazdu:</label>
          <div className="input-with-clear">
            <input
              id="from-address"
              type="text"
              name="from_address"
              value={formData.from_address}
              onChange={handleChange}
              placeholder="Wpisz lub wybierz punkt na mapie..."
              required
            />
            {formData.from_address && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearPoint('from')}
                title="Usuń punkt początkowy"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="form-group address-input">
          <label>Miejsce docelowe:</label>
          <div className="input-with-clear">
            <input
              id="to-address"
              type="text"
              name="to_address"
              value={formData.to_address}
              onChange={handleChange}
              placeholder="Wpisz lub wybierz punkt na mapie..."
              required
            />
            {formData.to_address && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => clearPoint('to')}
                title="Usuń punkt docelowy"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="map-container" ref={mapContainerRef}></div>

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
          <button type="button" onClick={onClose} className="cancel-btn">
            Anuluj
          </button>
          <button type="submit" disabled={pointCount < 2} className="submit-btn">
            Utwórz Przejazd
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRideForm;
//k