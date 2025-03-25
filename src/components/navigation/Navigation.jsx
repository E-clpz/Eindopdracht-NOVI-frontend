import './Navigation.css';
import { useNavigate, useLocation } from "react-router-dom";
import LogoSmall from '../../assets/Logo MaatjesMatch Small.png';
import Button from "../button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="nav-outer-container">
            <div className="nav-inner-container">
                <Button type="button" variant="invisible" onClick={() => navigate('/')}>
                    <img src={LogoSmall} alt="Logo that links to home page"/>
                </Button>
                <div className="nav-title">
                    <h1>MatchMaatje</h1>
                    <p>Persoonlijk contact op een innovatieve manier</p>
                </div>
                <ul className="nav-links">
                    {user && (
                        <li>
                            <Button
                                type="button"
                                variant="primary"
                                className={`button-primary ${location.pathname === '/profile' ? 'active' : ''}`}
                                onClick={() => navigate('/profile')}
                            >
                                Profiel
                            </Button>
                        </li>
                    )}
                    {!user ? (
                        <>
                            <li>
                                <Button type="button" variant="primary" onClick={() => navigate('/signIn')}>
                                    Inloggen
                                </Button>
                            </li>
                            <li>
                                <Button type="button" variant="primary" onClick={() => navigate('/signUp')}>
                                    Inschrijven
                                </Button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Button type="button" variant="secondary" onClick={logout}>
                                Uitloggen
                            </Button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navigation;
