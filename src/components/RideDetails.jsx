import { useState, useEffect } from 'react';
import { joinRide, leaveRide, getParticipants, startRide, cancelRide, completeRide } from '../api/ridesApi';
import { useUser } from '../context/UserContext';
import RatingForm from './RatingForm';
import './RideDetails.css';
import { MdClose, MdLocationOn, MdFlag, MdAccessTime, MdPerson, MdAttachMoney, MdEventSeat, MdInfo, MdPlayArrow, MdExitToApp } from 'react-icons/md';

function RideDetails({ ride, onClose, onJoined }) {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, [ride.id, currentUser?.id]);

  const fetchParticipants = async () => {
    try {
      const participantsData = await getParticipants(ride.id);
      setParticipants(participantsData);
      setSelectedParticipants(participantsData.map(p => p.passenger_id));
      
      const userParticipant = participantsData.find(
        p => p.passenger_id === currentUser?.id
      );
      
      setIsParticipant(!!userParticipant);
    } catch (error) {
      console.error('Błąd podczas pobierania uczestników:', error);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    setMessage('');

    try {
      await joinRide(ride.id, currentUser.id);
      setMessage('Pomyślnie dołączono do przejazdu!');
      await fetchParticipants();
      onJoined();
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas dołączania do przejazdu.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await leaveRide(ride.id, currentUser.id);
      setMessage('Pomyślnie opuszczono przejazd.');
      await fetchParticipants();
      onJoined();
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas opuszczania przejazdu.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm('Czy na pewno chcesz anulować ten przejazd?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await cancelRide(ride.id, currentUser.id);
      setMessage('Przejazd został anulowany.');
      setTimeout(() => {
        onJoined();
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas anulowania przejazdu.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
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
      await startRide(ride.id, currentUser.id, selectedParticipants);
      setMessage('Przejazd rozpoczęty pomyślnie!');
      setTimeout(() => {
        onJoined();
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
    if (!window.confirm('Czy na pewno chcesz zakończyć ten przejazd?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await completeRide(ride.id, currentUser.id);
      setMessage('Przejazd zakończony pomyślnie! Uczestnicy mogą teraz ocenić przejazd.');
      setTimeout(() => {
        onJoined();
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Błąd podczas kończenia przejazdu.';
      setMessage(errorMsg);
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
  const canStartRide = new Date() >= new Date(ride.departure_time);

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
              <span className={`status-${ride.status.toLowerCase()}`}>
                {ride.status.toLowerCase() === 'planned' ? 'Zaplanowany' : 
                 ride.status.toLowerCase() === 'in_progress' ? 'W trakcie' :
                 ride.status.toLowerCase() === 'completed' ? 'Zakończony' : 'Anulowany'}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Błąd') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {!isDriverCurrentUser && ride.status.toLowerCase() === 'planned' && (
          <>
            {isParticipant ? (
              <div>
                <div className="participant-status">
                  ✅ Jesteś uczestnikiem tego przejazdu
                </div>
                <button 
                  className="leave-btn" 
                  onClick={handleLeave}
                  disabled={loading}
                >
                  {loading ? 'Opuszczanie...' : <><MdExitToApp /> Wyjdź z przejazdu</>}
                </button>
              </div>
            ) : (
              ride.seats_available > 0 && (
                <button 
                  className="join-btn" 
                  onClick={handleJoin}
                  disabled={loading}
                >
                  {loading ? 'Dołączanie...' : <><MdPlayArrow /> Dołącz do przejazdu</>}
                </button>
              )
            )}
          </>
        )}

        {!isDriverCurrentUser && ride.status.toLowerCase() === 'in_progress' && isParticipant && (
          <div className="participant-status">
            ✅ Jesteś uczestnikiem tego przejazdu (w trakcie)
          </div>
        )}

        {!isDriverCurrentUser && ride.status.toLowerCase() === 'completed' && isParticipant && (
          <div className="participant-completed-section">
            <div className="participant-status">
              ✅ Przejazd zakończony
            </div>
            <button 
              className="rate-ride-btn" 
              onClick={() => setShowRatingForm(true)}
            >
              Oceń przejazd
            </button>
          </div>
        )}

        {isDriverCurrentUser && ride.status.toLowerCase() === 'planned' && (
          <>
            <div className="driver-section">
              <h4>Uczestnicy ({participants.length})</h4>
              {participants.length > 0 ? (
                <ul className="participants-list-compact">
                  {participants.map((p) => (
                    <li key={p.id}>
                      {p.passenger_username || `ID: ${p.passenger_id}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-participants-text">Brak uczestników</p>
              )}
            </div>

            {!showParticipantSelector && (
              <>
                {canStartRide ? (
                  <button 
                    className="start-ride-btn" 
                    onClick={() => setShowParticipantSelector(true)}
                    disabled={loading || participants.length === 0}
                  >
                    Rozpocznij przejazd
                  </button>
                ) : (
                  <button 
                    className="cancel-ride-btn" 
                    onClick={handleCancelRide}
                    disabled={loading}
                  >
                    {loading ? 'Anulowanie...' : 'Anuluj przejazd'}
                  </button>
                )}
              </>
            )}

            {showParticipantSelector && (
              <div className="participant-selector">
                <h4>Wybierz uczestników którzy wsiedli:</h4>
                <div className="participants-checklist">
                  {participants.map((p) => (
                    <label key={p.id} className="participant-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p.passenger_id)}
                        onChange={() => handleToggleParticipant(p.passenger_id)}
                      />
                      <span>{p.passenger_username || `ID: ${p.passenger_id}`}</span>
                    </label>
                  ))}
                </div>
                <div className="selector-actions">
                  <button 
                    className="confirm-start-btn" 
                    onClick={handleStartRide}
                    disabled={loading}
                  >
                    {loading ? 'Rozpoczynanie...' : `Potwierdź (${selectedParticipants.length})`}
                  </button>
                  <button 
                    className="cancel-selector-btn" 
                    onClick={() => setShowParticipantSelector(false)}
                    disabled={loading}
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isDriverCurrentUser && ride.status.toLowerCase() === 'in_progress' && (
          <div className="driver-section">
            <h4>Przejazd w trakcie</h4>
            <p className="ride-in-progress-info">
              Liczba uczestników: {participants.length}
            </p>
            {participants.length > 0 && (
              <ul className="participants-list-compact">
                {participants.map((p) => (
                  <li key={p.id}>
                    {p.passenger_username || `ID: ${p.passenger_id}`}
                  </li>
                ))}
              </ul>
            )}
            <button 
              className="complete-ride-btn" 
              onClick={handleCompleteRide}
              disabled={loading}
            >
              {loading ? 'Kończenie...' : 'Zakończ przejazd'}
            </button>
          </div>
        )}

        {isDriverCurrentUser && ride.status.toLowerCase() === 'completed' && (
          <div className="driver-section completed">
            <h4>Przejazd zakończony</h4>
            <p>Ten przejazd został pomyślnie zakończony.</p>
          </div>
        )}

        {!isDriverCurrentUser && ride.status.toLowerCase() !== 'planned' && !isParticipant && (
          <div className="status-notice">
            Ten przejazd nie przyjmuje już nowych pasażerów
          </div>
        )}
      </div>

      {showRatingForm && (
        <RatingForm 
          ride={ride} 
          onClose={() => setShowRatingForm(false)}
          onRatingSubmitted={() => {
            setShowRatingForm(false);
            onJoined();
          }}
        />
      )}
    </div>
  );
}

export default RideDetails;
