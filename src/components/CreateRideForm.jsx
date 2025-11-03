import { useState } from 'react';
import { createRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import './CreateRideForm.css';
import { MdClose } from 'react-icons/md';

function CreateRideForm({ onClose, onRideCreated }) {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
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
    seats_available: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rideData = {
        ...formData,
        driver_id: currentUser.id,
        price_per_seat: parseFloat(formData.price_per_seat),
        seats_available: parseInt(formData.seats_available),
      };

      const newRide = await createRide(rideData);
      onRideCreated(newRide);
      onClose();
    } catch (err) {
      setError(err.message || 'Błąd tworzenia przejazdu');
    } finally {
      setLoading(false);
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

        <div className="form-group">
          <label>Miejsce wyjazdu:</label>
          <input
            type="text"
            name="from_address"
            value={formData.from_address}
            onChange={handleChange}
            required
            placeholder="Adres początkowy"
          />
        </div>

        <div className="form-group">
          <label>Miejsce docelowe:</label>
          <input
            type="text"
            name="to_address"
            value={formData.to_address}
            onChange={handleChange}
            required
            placeholder="Adres docelowy"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Szerokość (start):</label>
            <input
              type="number"
              step="0.000001"
              name="from_lat"
              value={formData.from_lat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Długość (start):</label>
            <input
              type="number"
              step="0.000001"
              name="from_lng"
              value={formData.from_lng}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Szerokość (cel):</label>
            <input
              type="number"
              step="0.000001"
              name="to_lat"
              value={formData.to_lat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Długość (cel):</label>
            <input
              type="number"
              step="0.000001"
              name="to_lng"
              value={formData.to_lng}
              onChange={handleChange}
              required
            />
          </div>
        </div>

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
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Tworzenie...' : 'Utwórz Przejazd'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRideForm;
