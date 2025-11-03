import RideCard from './RideCard';
import './RideList.css';
import { MdRefresh } from 'react-icons/md';

function RideList({ rides, onSelectRide, selectedRideId, onRefresh }) {
  if (!rides || rides.length === 0) {
    return (
      <div className="ride-list">
        <div className="ride-list-header">
          <h2>Dostępne Przejazdy (0)</h2>
          {onRefresh && (
            <button className="refresh-btn" onClick={onRefresh} title="Odśwież listę">
              <MdRefresh />
            </button>
          )}
        </div>
        <div className="empty-state">
          <p>Brak dostępnych przejazdów</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-list">
      <div className="ride-list-header">
        <h2>Dostępne Przejazdy ({rides.length})</h2>
        {onRefresh && (
          <button className="refresh-btn" onClick={onRefresh} title="Odśwież listę">
            <MdRefresh />
          </button>
        )}
      </div>
      <div className="rides-container">
        {rides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onSelect={onSelectRide}
            isSelected={selectedRideId === ride.id}
          />
        ))}
      </div>
    </div>
  );
}

export default RideList;
