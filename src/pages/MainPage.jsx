import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAllRides } from '../api/ridesApi';
import UserPanel from '../components/UserPanel';
import RideList from '../components/RideList';
import DynamicPanel from '../components/DynamicPanel';
import './MainPage.css';
import { MdAdd } from 'react-icons/md';

function MainPage() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [panelMode, setPanelMode] = useState(null); // null, 'create', 'details'

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const ridesData = await getAllRides();
      setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectRide = (ride) => {
    setSelectedRide(ride);
    setPanelMode('details');
  };

  const handleCreateClick = () => {
    setSelectedRide(null);
    setPanelMode('create');
  };

  const handleClosePanel = () => {
    setPanelMode(null);
    setSelectedRide(null);
  };

  const handleRideCreated = (newRide) => {
    setRides([newRide, ...rides]);
    fetchRides();
  };

  const handleRideJoined = () => {
    fetchRides();
  };

  const handleManageRide = (ride) => {
    setSelectedRide(ride);
    setPanelMode('details');
  };

  return (
    <div className="main-page">
      <aside className="left-panel">
        <UserPanel 
          onLogout={handleLogout}
          onManageRide={handleManageRide}
        />
      </aside>

      <main className={`center-panel ${!panelMode ? 'full-width' : ''}`}>
        <div className="center-header">
          <button className="create-ride-btn" onClick={handleCreateClick}>
            <MdAdd /> Utwórz Przejazd
          </button>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <p>Ładowanie przejazdów...</p>
          </div>
        ) : (
          <RideList 
            rides={rides}
            onSelectRide={handleSelectRide}
            selectedRideId={selectedRide?.id}
            onRefresh={fetchRides}
          />
        )}
      </main>

      {panelMode && (
        <aside className="right-panel">
          <DynamicPanel
            mode={panelMode}
            selectedRide={selectedRide}
            onClose={handleClosePanel}
            onRideCreated={handleRideCreated}
            onRideJoined={handleRideJoined}
          />
        </aside>
      )}
    </div>
  );
}

export default MainPage;
