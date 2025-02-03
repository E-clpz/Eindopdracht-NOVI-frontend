import './Navigation.css';
import {useLocation, useNavigate,} from "react-router-dom";
import LogoSmall from '../../assets/Logo MaatjesMatch Small.png';
import Button from "../button/Button.jsx";

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="nav-outer-container">
            <div className="nav-inner-container">
                <Button type="button"
                        variant="invisible"
                        onClick={() => navigate('/')}>
                    <img src={LogoSmall} alt="Logo that links to home page"/>
                </Button>
                <div className="nav-title">
                    <h1>MatchMaatje</h1>
                    <p>Persoonlijk contact op een innovatieve manier</p>
                </div>
                <ul className="nav-links">
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-nav ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={() => navigate('/')}
                        >
                            Home
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-nav ${location.pathname === '/contact' ? 'active' : ''}`}
                            onClick={() => navigate('/contact')}
                        >
                            Contact
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-nav ${location.pathname === '/login' ? 'active' : ''}`}
                            onClick={() => navigate('/login')}
                        >
                            Inloggen
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-nav ${location.pathname === '/signin' ? 'active' : ''}`}
                            onClick={() => navigate('/signin')}
                        >
                            Inschrijven
                        </Button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navigation;
