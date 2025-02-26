import './Navigation.css';
import {useLocation, useNavigate,} from "react-router-dom";
import LogoSmall from '../../assets/Logo MaatjesMatch Small.png';
import Button from "../button/Button.jsx";
import { useState, useEffect } from 'react';
import axios from 'axios';

function Navigation() {
    const [userName, setUserName] = useState(null);

    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (response.status === 200) {
                    setUserName(response.data.name);
                }
            } catch {
                setUserName(null);
            }
        };
        fetchUser();
    }, []);

    const handleProfileRedirect = () => {
        if (userName) {
            navigate('/profile');
        } else {
            navigate('/signIn');
        }
    };

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
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-primary ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={() => navigate('/')}
                        >
                            Home
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-primary ${location.pathname === '/contact' ? 'active' : ''}`}
                            onClick={() => navigate('/contact')}
                        >
                            Contact
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-primary ${location.pathname === '/signIn' ? 'active' : ''}`}
                            onClick={handleProfileRedirect}
                        >
                            {userName ? userName : 'Inloggen'}
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="primary"
                            className={`button-primary ${location.pathname === '/signUp' ? 'active' : ''}`}
                            onClick={() => navigate('/signUp')}
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