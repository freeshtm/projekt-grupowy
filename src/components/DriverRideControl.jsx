import { useState, useEffect } from 'react';
import { getParticipants, startRide, completeRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import './DriverRideControl.css';
import { MdPlayArrow, MdCheckCircle, MdPerson } from 'react-icons/md';

function DriverRideControl({ ride, onClose, onRideUpdated }) {
  const { currentUser } = useUser();
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, [ride.id]);

  const fetchParticipants = async () => {
    try {
      const participantsData = await getParticipants(ride.id);
      setParticipants(participantsData);
      setSelectedParticipants(participantsData.map(p => p.passenger_id));
    } catch (error) {
      console.error('Błąd podczas pobierania uczestników:', error);
    }
  };

  const handleToggleParticipant = (passengerId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(passengerId)) {
        return prev.filter(id => id !== passengerId);
      } else {
        return [...prev, passengerId];
      }
    });
  };

  const handleStartRide = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await startRide(ride.id, currentUser.id, selectedParticipants);
      setMessage(response.message || 'Przejazd rozpoczęty pomyślnie!');
      setTimeout(() => {
        onRideUpdated();
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas rozpoczynania przejazdu.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await completeRide(ride.id, currentUser.id);
      setMessage(response.message || 'Przejazd zakończony pomyślnie!');
      setTimeout(() => {
        onRideUpdated();
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas kończenia przejazdu.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isDriverCurrentUser = ride.driver_id === currentUser?.id;

  if (!isDriverCurrentUser) {
    return (
      <div className="driver-ride-control">
        <div className="error-message">
          Nie masz uprawnień do zarządzania tym przejazdem.
        </div>
      </div>
    );
  }

  return (
    <div className="driver-ride-control">
      <h3>Zarządzaj Przejazdem</h3>

      {ride.status === 'planned' && (
        <div className="participants-section">
          <h4><MdPerson /> Uczestnicy ({participants.length})</h4>
          
          {participants.length === 0 ? (
            <p className="no-participants">Brak uczestników</p>
          ) : (
            <>
              <p className="instruction">
                Zaznacz uczestników, którzy faktycznie wsiedli do pojazdu:
              </p>
              <div className="participants-list">
                {participants.map((participant) => (
                  <label key={participant.id} className="participant-item">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.passenger_id)}
                      onChange={() => handleToggleParticipant(participant.passenger_id)}
                    />
                    <span className="participant-info">
                      <strong>ID: {participant.passenger_id}</strong>
                      <span className="joined-date">
                        Dołączono: {new Date(participant.joined_at).toLocaleString('pl-PL')}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="selection-summary">
                Wybrano: {selectedParticipants.length} z {participants.length}
              </div>
            </>
          )}

          {message && (
            <div className={`message ${message.includes('Błąd') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button 
            className="start-btn" 
            onClick={handleStartRide}
            disabled={loading}
          >
            {loading ? 'Rozpoczynanie...' : <><MdPlayArrow /> Rozpocznij przejazd</>}
          </button>
        </div>
      )}

      {ride.status === 'in_progress' && (
        <div className="in-progress-section">
          <h4>Przejazd w trakcie</h4>
          <p>Liczba uczestników: {participants.length}</p>

          {message && (
            <div className={`message ${message.includes('Błąd') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button 
            className="complete-btn" 
            onClick={handleCompleteRide}
            disabled={loading}
          >
            {loading ? 'Kończenie...' : <><MdCheckCircle /> Zakończ przejazd</>}
          </button>
        </div>
      )}

      {ride.status === 'completed' && (
        <div className="completed-section">
          <h4>Przejazd zakończony</h4>
          <p>Ten przejazd został pomyślnie zakończony.</p>
        </div>
      )}

      {ride.status === 'cancelled' && (
        <div className="cancelled-section">
          <h4>Przejazd anulowany</h4>
          <p>Ten przejazd został anulowany.</p>
        </div>
      )}
    </div>
  );
}

export default DriverRideControl;
