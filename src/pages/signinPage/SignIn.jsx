import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/input/Input.jsx";
import Button from "../../components/button/Button.jsx";
import "./SignIn.css";
import logo from "../../assets/Logo MaatjesMatch Big.png";
import axios from "axios";

const SignIn = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        console.log(e);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        console.log("Verstuurde gegevens:", formData);

        try {
            const response = await axios.post("http://localhost:8080/auth/login", {
                userName: formData.identifier,
                password: formData.password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            if (response.data.role === "HELPER") {
                navigate("/requests");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {

            if (err.response && err.response.data) {
                setError(err.response.data.message || "Inloggen mislukt.");
            } else {
                setError("Er is iets misgegaan. Probeer het later opnieuw.");
            }
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
                        <Input label="Gebruikersnaam of e-mail:" type="text" name="identifier" required value={formData.identifier} onChange={handleChange} />
                        <Input label="Wachtwoord:" type="password" name="password" required value={formData.password} onChange={(e) => handleChange(e)} />
                        <a href="/wachtwoord-vergeten" className="forgot-password">Wachtwoord vergeten?</a>
                        {error && <p className="error-message">{error}</p>}
                        <Button type="submit" variant="secondary">Inloggen</Button>
                    </form>
                </article>
            </section>
        </>
    );
};

export default SignIn;
