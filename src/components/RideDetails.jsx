import { useState } from 'react';
import { joinRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import './RideDetails.css';
import { MdClose, MdLocationOn, MdFlag, MdAccessTime, MdPerson, MdAttachMoney, MdEventSeat, MdInfo, MdPlayArrow } from 'react-icons/md';

function RideDetails({ ride, onClose, onJoined }) {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setMessage('');

    try {
      await joinRide(ride.id, currentUser.id);
      setMessage('Pomyślnie dołączono do przejazdu! Oczekiwanie na akceptację kierowcy.');
      setTimeout(() => {
        onJoined();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage('Błąd podczas dołączania do przejazdu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDriverCurrentUser = ride.driver_id === currentUser?.id;

  return (
    <div className="ride-details-panel">
      <div className="details-header">
        <h3>Szczegóły Przejazdu</h3>
        <button className="close-btn" onClick={onClose}><MdClose /></button>
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h4>Trasa</h4>
          <div className="route-info">
            <div className="route-point start">
              <MdLocationOn className="route-icon" />
              <div>
                <strong>Start:</strong>
                <p>{ride.from_address}</p>
              </div>
            </div>
            <div className="route-divider">↓</div>
            <div className="route-point end">
              <MdFlag className="route-icon" />
              <div>
                <strong>Cel:</strong>
                <p>{ride.to_address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Informacje</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label"><MdAccessTime /> Data:</span>
              <span>{formatDate(ride.departure_time)}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MdAccessTime /> Godzina:</span>
              <span>{formatTime(ride.departure_time)}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MdPerson /> Kierowca:</span>
              <span>{ride.driver_name || 'Nieznany'}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MdAttachMoney /> Cena za miejsce:</span>
              <span>{ride.price_per_seat} zł</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MdEventSeat /> Dostępne miejsca:</span>
              <span>{ride.seats_available}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><MdInfo /> Status:</span>
              <span className={`status-${ride.status}`}>
                {ride.status === 'planned' ? 'Zaplanowany' : 
                 ride.status === 'in_progress' ? 'W trakcie' :
                 ride.status === 'completed' ? 'Zakończony' : 'Anulowany'}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Błąd') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {!isDriverCurrentUser && ride.status === 'planned' && ride.seats_available > 0 && (
          <button 
            className="join-btn" 
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? 'Dołączanie...' : <><MdPlayArrow /> Dołącz do przejazdu</>}
          </button>
        )}

        {isDriverCurrentUser && (
          <div className="driver-notice">
            To jest Twój przejazd
          </div>
        )}

        {ride.status !== 'planned' && (
          <div className="status-notice">
            Ten przejazd nie przyjmuje już nowych pasażerów
          </div>
        )}
      </div>
    </div>
  );
}

export default RideDetails;
