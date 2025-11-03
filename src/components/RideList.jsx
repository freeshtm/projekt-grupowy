import RideCard from './RideCard';
import './RideList.css';

function RideList({ rides, onSelectRide, selectedRideId }) {
  if (!rides || rides.length === 0) {
    return (
      <div className="ride-list">
        <div className="empty-state">
          <p>Brak dostępnych przejazdów</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-list">
      <h2>Dostępne Przejazdy ({rides.length})</h2>
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
