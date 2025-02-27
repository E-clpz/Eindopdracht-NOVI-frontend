import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/input/Input.jsx";
import Button from "../../components/button/Button.jsx";
import "./SignIn.css";
import logo from "../../assets/Logo MaatjesMatch Big.png";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const SignIn = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [success, setSuccess] = useState("");

    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("")
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/auth/login", {
                userName: formData.identifier,
                password: formData.password,
            });

            const token = response.headers["authorization"];

            if (token) {
                const bearerToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
                localStorage.setItem("token", bearerToken);

                const decodedToken = jwtDecode(bearerToken);
                const role = decodedToken.roles ? decodedToken.roles[0] : 'undefined';
                localStorage.setItem("role", role);

                navigate("/requests");
            } else {
                setError("Geen token ontvangen, probeer opnieuw.");
            }

        } catch (error) {
            console.error("❌ Fout bij inloggen:", error);
            setError("Ongeldige inloggegevens");
        }
    };

    return (
        <>
            <section className="upper-section">
                <img src={logo} alt="MaatjesMatch Logo" className="signin-logo" />
                <h1>Inloggen bij MaatjesMatch</h1>
            </section>
            <section className="lower-section">
                <article className="signin-form">
                    <form onSubmit={handleSubmit}>
                        <Input label="Gebruikersnaam of e-mail:" type="text" name="identifier" required value={formData.identifier} onChange={(e) => handleChange(e)} />
                        <Input label="Wachtwoord:" type="password" name="password" required value={formData.password} onChange={(e) => handleChange(e)} />
                        <a href="/wachtwoord-vergeten" className="forgot-password">Wachtwoord vergeten?</a>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                        <Button type="submit" variant="secondary">Inloggen</Button>
                    </form>
                </article>
            </section>
        </>
    );
};

export default SignIn;
