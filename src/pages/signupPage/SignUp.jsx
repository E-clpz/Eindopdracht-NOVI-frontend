import Input from "../../components/input/Input.jsx"
import "./SignUp.css";
import Button from "../../components/button/Button.jsx"
import {useState} from "react";
import {useNavigate} from "react-router-dom";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        city: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
    });

    const [error, setError] = useState("");
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateInput = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Gebruikersnaam is verplicht.";
        } else if (formData.username.length < 2 || formData.username.length > 25) {
            newErrors.username = "Gebruikersnaam moet tussen 2 en 25 tekens lang zijn.";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Wachtwoord is verplicht.";
        } else if (formData.password.length < 8) {
            newErrors.password = "Wachtwoord moet minimaal 8 tekens lang zijn.";
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Wachtwoord moet ten minste één kleine letter bevatten.";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Wachtwoord moet ten minste één hoofdletter bevatten.";
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = "Wachtwoord moet ten minste één cijfer bevatten.";
        } else if (!/[@#$%^&+=!]/.test(formData.password)) {
            newErrors.password = "Wachtwoord moet ten minste één speciaal teken (@#$%^&+=!) bevatten.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "E-mail is verplicht.";
        } else if (!formData.email.includes('@')) {
            newErrors.email = "Ongeldig e-mailadres. E-mailadres moet een '@' bevatten.";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Telefoonnummer is verplicht.";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Telefoonnummer moet precies 10 cijfers bevatten.";
        }

        if (!formData.city.trim()) {
            newErrors.city = "Woonplaats is verplicht.";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInput()) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    setError("Gebruikersnaam, e-mailadres of telefoonnummer is al in gebruik.");
                } else {
                    setError(errorData.message || "Registratie mislukt.");
                }
                return;
            }

            navigate("/signin");
        } catch (error) {
            console.error("Fout bij inschrijven", error);
            if (error.response) {
                if (error.response.status === 409) {
                    setError("Gebruikersnaam, e-mailadres of telefoonnummer is al in gebruik.");
                } else {
                    const serverErrors = error.response.data.errors || {};
                    setError(serverErrors.general || "Er is een onbekende fout opgetreden.");
                }
            } else {
                setError("Er is een onbekende fout opgetreden.");
            }
        }
    };

    return (
        <>
            <section className="upper-section">
                <h1>Inschrijven bij MatchMaatje</h1>
            </section>
            <section className="signup-content">
                <article className="signup-form">
                    <form onSubmit={handleSubmit}>
                        {formErrors.username && <p className="error-message">{formErrors.username}</p>}
                        <Input
                            label="Gebruikersnaam:"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        {formErrors.password && <p className="error-message">{formErrors.password}</p>}
                        <Input
                            label="Wachtwoord:"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                        <Input
                            label="E-mailadres:"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {formErrors.phoneNumber && <p className="error-message">{formErrors.phoneNumber}</p>}
                        <Input
                            label="Tel.nr:"
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        {formErrors.city && <p className="error-message">{formErrors.city}</p>}
                        <Input
                            label="Woonplaats:"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        <fieldset>
                            <legend>Rol:</legend>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="REQUESTER"
                                    required
                                    checked={formData.role === "REQUESTER"}
                                    onChange={handleChange}
                                />
                                Ik ben een aanvrager
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="HELPER"
                                    required
                                    checked={formData.role === "HELPER"}
                                    onChange={handleChange}
                                />
                                Ik ben een maatje
                            </label>
                        </fieldset>
                        <Button type="submit" variant="secondary">
                            Inschrijven
                        </Button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                    <aside className="signup-rules">
                        <h2>Huisregels</h2>
                        <ol>
                            <li>Wees lief voor elkaar en behandel elkaar met respect.</li>
                            <li>
                                Gebruik geen grove taal of racistische opmerkingen. Dit geldt tevens voor de gebruikersnaam.
                                Indien deze regels worden overschreden, kan uw gebruikersaccount worden bevroren of verwijderd.
                            </li>
                            <li>
                                Het is verboden deze app voor illegale doeleinden te gebruiken. Bij schending van deze regel kunnen de autoriteiten worden ingeschakeld.
                            </li>
                            <p><i>Door je in te schrijven ga je akkoord met bovenstaande huisregels.</i></p>
                        </ol>
                    </aside>
                </article>
            </section>
        </>
    );
};

export default SignUp;