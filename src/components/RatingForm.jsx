import { useState } from 'react';
import { addRating } from '../api/ratingsApi';
import { useUser } from '../context/UserContext';
import './RatingForm.css';
import { MdClose, MdStar, MdStarBorder } from 'react-icons/md';

function RatingForm({ ride, onClose, onRatingSubmitted }) {
  const { currentUser } = useUser();
  const [stars, setStars] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addRating({
        ride_id: ride.id,
        user_id: ride.driver_id,
        rater_id: currentUser.id,
        stars: stars,
      });
      setMessage('Ocena została dodana!');
      setTimeout(() => {
        onRatingSubmitted();
        onClose();
      }, 1500);
    } catch (error) {
      setMessage('Błąd podczas dodawania oceny');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-form-overlay">
      <div className="rating-form-container">
        <div className="rating-form-header">
          <h3>Oceń przejazd</h3>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>

        <div className="rating-content">
          <p>Oceń kierowcę: <strong>{ride.driver_name}</strong></p>
          <p className="route-info">
            {ride.from_address} → {ride.to_address}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="stars-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= stars ? 'active' : ''}`}
                  onClick={() => setStars(star)}
                >
                  {star <= stars ? <MdStar /> : <MdStarBorder />}
                </button>
              ))}
            </div>
            <p className="stars-count">{stars} {stars === 1 ? 'gwiazdka' : 'gwiazdek'}</p>

            {message && (
              <div className={`message ${message.includes('Błąd') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Anuluj
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Zapisywanie...' : 'Wyślij ocenę'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RatingForm;
