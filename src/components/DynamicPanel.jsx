import CreateRideForm from './CreateRideForm';
import RideDetails from './RideDetails';
import './DynamicPanel.css';

function DynamicPanel({ mode, selectedRide, onClose, onRideCreated, onRideJoined }) {
  if (mode === 'create') {
    return (
      <div className="dynamic-panel">
        <CreateRideForm 
          onClose={onClose} 
          onRideCreated={onRideCreated}
        />
      </div>
    );
  }

  if (mode === 'details' && selectedRide) {
    return (
      <div className="dynamic-panel">
        <RideDetails 
          ride={selectedRide} 
          onClose={onClose}
          onJoined={onRideJoined}
        />
      </div>
    );
  }

  return null;
}

export default DynamicPanel;
