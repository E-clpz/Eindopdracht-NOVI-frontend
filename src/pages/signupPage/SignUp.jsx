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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            username: e.target.username.value,
            city: e.target.city.value,
            email: e.target.email.value,
            phoneNumber: e.target.phoneNumber.value,
            password: e.target.password.value,
            role: e.target.role.value,
        };

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
                throw new Error(errorData.message || "Registratie mislukt.");
            }

            navigate("/signin");
        } catch (err) {
            setError(err.message);
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
                        <Input label="Gebruikersnaam:" type="text" name="username" required value={formData.username}
                               onChange={handleChange}/>
                        <Input label="Wachtwoord:" type="password" name="password" required value={formData.password}
                               onChange={handleChange}/>
                        <Input label="E-mail adres:" type="email" name="email" required value={formData.email}
                               onChange={handleChange}/>
                        <Input label="Tel.nr:" type="tel" name="phoneNumber" required value={formData.phoneNumber}
                               onChange={handleChange}/>
                        <Input label="Woonplaats:" type="text" name="city" required value={formData.city}
                               onChange={handleChange}/>
                        <fieldset>
                            <legend>Rol:</legend>
                            <label>
                                <input type="radio" name="role" value="REQUESTER" required
                                       checked={formData.role === "REQUESTER"} onChange={handleChange}/>
                                Ik ben een aanvrager
                            </label>
                            <label>
                                <input type="radio" name="role" value="HELPER" required
                                       checked={formData.role === "HELPER"} onChange={handleChange}/>
                                Ik ben een maatje
                            </label>
                        </fieldset>

                        {error && <p className="error-message">{error}</p>}

                    </form>
                    <aside className="signup-rules">
                        <h2>Huisregels</h2>
                        <ol>
                            <li>Wees lief voor elkaar en behandel elkaar met respect.</li>
                            <li>
                                Gebruik geen grove taal of racistische opmerkingen. Dit geldt tevens voor de
                                gebruikersnaam.
                                Indien deze regels worden overschreden, kan uw gebruikersaccount worden bevroren of
                                verwijderd.
                            </li>
                            <li>
                                Het is verboden deze app voor illegale doeleinden te gebruiken.
                                Bij schending van deze regel kunnen de autoriteiten worden ingeschakeld.
                            </li>
                            <p>Door je in te schrijven ga je akkoord met bovenstaande huisregels.</p>
                        </ol>
                        <Button type="submit" variant="secondary">Inschrijven</Button>
                    </aside>
                </article>
            </section>
        </>
    );
};

export default SignUp;