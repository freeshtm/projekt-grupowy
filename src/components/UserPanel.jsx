import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getUserRides } from '../api/ridesApi';
import { getUserProfile } from '../api/authApi';
import './UserPanel.css';
import { MdStar, MdStarBorder, MdLogout, MdDirectionsCar } from 'react-icons/md';

function UserPanel({ onLogout, onManageRide }) {
  const { currentUser } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [recentRides, setRecentRides] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.id);
          setUserProfile(profile);
          
          const rides = await getUserRides(currentUser.id, 3);
          setRecentRides(rides);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={`full-${i}`} />);
    }
    if (hasHalfStar) {
      stars.push(<MdStarBorder key="half" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<MdStarBorder key={`empty-${i}`} />);
    }
    
    return stars;
  };

  return (
    <div className="user-panel">
      <div className="user-profile">
        <div className="profile-avatar">
          {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h3>{currentUser?.username || 'Użytkownik'}</h3>
        <p className="user-email">{currentUser?.email}</p>
        
        {userProfile?.average_rating && (
          <div className="user-rating">
            <span className="rating-stars">{renderStars(userProfile.average_rating)}</span>
            <span className="rating-value">{userProfile.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="recent-rides">
        <h4>Twoje Przejazdy</h4>
        {recentRides.length > 0 ? (
          <ul>
            {recentRides.map((ride) => (
              <li key={ride.id} className="ride-item-clickable">
                <div className="ride-content">
                  <div className="ride-route">
                    {ride.from_address} → {ride.to_address}
                  </div>
                  <div className="ride-date">
                    {new Date(ride.departure_time).toLocaleDateString('pl-PL')}
                  </div>
                  <div className={`ride-status status-${ride.status.toLowerCase()}`}>
                    {ride.status.toLowerCase() === 'planned' && 'Zaplanowany'}
                    {ride.status.toLowerCase() === 'in_progress' && 'W trakcie'}
                    {ride.status.toLowerCase() === 'completed' && 'Zakończony'}
                    {ride.status.toLowerCase() === 'cancelled' && 'Anulowany'}
                  </div>
                </div>
                {ride.status.toLowerCase() !== 'completed' && ride.status.toLowerCase() !== 'cancelled' && ride.driver_id === currentUser?.id && onManageRide && (
                  <button 
                    className="manage-ride-btn"
                    onClick={() => onManageRide(ride)}
                    title="Zarządzaj przejazdem"
                  >
                    <MdDirectionsCar />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-rides">Brak przejazdów</p>
        )}
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <MdLogout /> Wyloguj się
      </button>
    </div>
  );
}

export default UserPanel;
