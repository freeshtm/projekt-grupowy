import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData);
      alert('Rejestracja udana! Możesz się teraz zalogować.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Błąd rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Carpooling</h1>
        <h2>Rejestracja</h2>
        
        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Wprowadź nazwę użytkownika"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Wprowadź email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Wprowadź hasło"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="login-link">
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
