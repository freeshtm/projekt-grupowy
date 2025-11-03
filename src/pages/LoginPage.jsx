import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useUser } from '../context/UserContext';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await loginUser(email, password);
      login(userData);
      navigate('/main');
    } catch (err) {
      setError(err.message || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Carpooling</h1>
        <h2>Logowanie</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Wprowadź email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Wprowadź hasło"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="register-link">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
