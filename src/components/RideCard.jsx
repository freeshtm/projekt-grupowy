import './RideCard.css';
import { MdAccessTime, MdPerson, MdAttachMoney, MdEventSeat } from 'react-icons/md';

function RideCard({ ride, onSelect, isSelected }) {
  const departureDate = new Date(ride.departure_time);
  const now = new Date();
  const isPast = departureDate < now;

  const formatDate = (date) => {
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      planned: 'Zaplanowany',
      in_progress: 'W trakcie',
      completed: 'Zakończony',
      cancelled: 'Anulowany',
    };
    return labels[status.toLowerCase()] || status;
  };

  return (
    <div 
      className={`ride-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(ride)}
    >
      <div className="ride-header">
        <h3>
          {ride.from_address} → {ride.to_address}
        </h3>
        <span className={`status-badge status-${ride.status.toLowerCase()}`}>
          {getStatusLabel(ride.status)}
        </span>
      </div>

      <div className="ride-details">
        <div className="detail-row">
          <MdAccessTime className="icon" />
          <span>{formatDate(departureDate)} {formatTime(departureDate)}</span>
        </div>
        <div className="detail-row">
          <MdPerson className="icon" />
          <span>{ride.driver_name || 'Kierowca'}</span>
        </div>
        <div className="detail-row">
          <MdAttachMoney className="icon" />
          <span>{ride.price_per_seat} zł</span>
        </div>
        <div className="detail-row">
          <MdEventSeat className="icon" />
          <span>{ride.seats_available} miejsc</span>
        </div>
      </div>

      {isPast && ride.status.toLowerCase() === 'planned' && (
        <div className="ride-note">
          Przejazd powinien już się rozpocząć
        </div>
      )}
    </div>
  );
}

export default RideCard;
