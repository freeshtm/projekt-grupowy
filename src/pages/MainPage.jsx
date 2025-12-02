import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAllRides } from '../api/ridesApi';
import UserPanel from '../components/UserPanel';
import RideList from '../components/RideList';
import DynamicPanel from '../components/DynamicPanel';
import RideFilterPanel from '../components/RideFilterPanel';
import LogoutModal from '../components/LogoutModal';
import './MainPage.css';
import { MdAdd } from 'react-icons/md';

function MainPage() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [filterInput, setFilterInput] = useState({
    origin: '',
    destination: '',
    date: ''
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (filters = {}) => {
    setLoading(true);
    try {
      const ridesData = await getAllRides(filters);
      setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };


  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
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
    fetchRides(filterInput); 
  };

  const handleRideJoined = () => {
    fetchRides(filterInput);
  };

  const handleManageRide = (ride) => {
    setSelectedRide(ride);
    setPanelMode('details');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInput(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchRides(filterInput);
  };

  const handleClearFilters = () => {
    const emptyFilters = { origin: '', destination: '', date: '' };
    setFilterInput(emptyFilters);
    fetchRides({});
  };

  return (
    <div className="main-page">
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      <aside className="left-panel">
        <UserPanel 
          onLogout={handleLogoutClick}
          onManageRide={handleManageRide}
        />
      </aside>

      <main className={`center-panel ${!panelMode ? 'full-width' : ''}`}>
        <div className="center-header">
          <RideFilterPanel 
            filterValues={filterInput}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
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
            onRefresh={() => fetchRides(filterInput)}
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