import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import Button from "../../components/button/Button.jsx";
import starFilled from "../../assets/Star filled.png";
import starUnfilled from "../../assets/Star unfilled.png";

function Profile() {
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        phoneNumber: "",
        city: "",
        role: "",
        rating: null,
    });

    const [updateFlag, setUpdateFlag] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/users/my", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                setUserInfo({
                    username: response.data.username,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    city: response.data.city,
                    id: response.data.id,
                    role: response.data.role,
                    rating: response.data.role === "HELPER"
                        ? response.data.rating : null,
                });

            } catch (error) {
                console.error("Fout bij ophalen gebruikersinformatie", error);
            }
        };
        fetchUserInfo();

    }, [updateFlag]);

    const validateInput = () => {
        const newErrors = {};

        if (!userInfo.username.trim()) {
            newErrors.username = "Gebruikersnaam is verplicht.";
        } else if (userInfo.username.length < 2 || userInfo.username.length > 25) {
            newErrors.username = "Gebruikersnaam moet tussen 2 en 25 tekens lang zijn.";
        }

        if (!userInfo.email.trim()) {
            newErrors.email = "E-mail is verplicht.";
        } else if (!userInfo.email.includes('@')) {
            newErrors.email = "Ongeldig e-mailadres. E-mailadres moet een '@' bevatten.";
        }

        if (!userInfo.phoneNumber.trim()) {
            newErrors.phoneNumber = "Telefoonnummer is verplicht.";
        } else if (!/^\d{10}$/.test(userInfo.phoneNumber)) {
            newErrors.phoneNumber = "Telefoonnummer moet precies 10 cijfers bevatten.";
        }

        if (!userInfo.city.trim()) {
            newErrors.city = "Woonplaats is verplicht.";
        }

        setErrorMessage(Object.keys(newErrors).length > 0 ? newErrors : "");
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({ ...prevUserInfo, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInput()) return;

        const updatedUserInfo = { ...userInfo };

        try {
            await axios.put("http://localhost:8080/api/users/my", updatedUserInfo, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setSuccessMessage("Profiel succesvol bijgewerkt!");
            setErrorMessage("");
            setUpdateFlag((prev) => !prev);

            const response = await axios.get("http://localhost:8080/api/users/my", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUserInfo({
                username: response.data.username,
                email: response.data.email,
                phoneNumber: response.data.phoneNumber,
                city: response.data.city,
                id: response.data.id,
                rating: response.data.role === "HELPER" && response.data.rating != null
                    ? response.data.rating
                    : null,
            });

        } catch (error) {
            console.error("Fout bij updaten van profiel", error);
            if (error.response) {
                if (error.response.status === 409) {
                    setErrorMessage({ general: "E-mailadres, gebruikersnaam of telefoonnummer is al in gebruik." });
                } else {
                    const serverErrors = error.response.data.errors || {};
                    setErrorMessage(serverErrors);
                }
            } else {
                setErrorMessage({ general: "Er is een onbekende fout opgetreden." });
            }
            setSuccessMessage("");
        }
    };

    const handleNavigate = () => {
        if (userInfo.role === "HELPER") {
            navigate("/requests/overview");
        } else if (userInfo.role === "REQUESTER") {
            navigate("/requests/myrequests");
        }
    };

    return (
        <>
            <section className="upper-section">
                <h2>Profiel Overzicht</h2>
                <form onSubmit={handleSubmit} className="profile-form">
                    <label>Gebruikersnaam:</label>
                    <input type="text" name="username" value={userInfo.username} onChange={handleChange} />
                    {errorMessage.username && <span className="error">{errorMessage.username}</span>}

                    <label>E-mail:</label>
                    <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
                    {errorMessage.email && <span className="error">{errorMessage.email}</span>}

                    <label>Telefoonnummer:</label>
                    <input type="text" name="phoneNumber" value={userInfo.phoneNumber} onChange={handleChange} />
                    {errorMessage.phoneNumber && <span className="error">{errorMessage.phoneNumber}</span>}

                    <label>Woonplaats:</label>
                    <input type="text" name="city" value={userInfo.city} onChange={handleChange} />
                    {errorMessage.city && <span className="error">{errorMessage.city}</span>}

                    {errorMessage && <span className="error">{errorMessage.general}</span>}
                    {!errorMessage && successMessage && <span className="success">{successMessage}</span>}

                    {userInfo.role === "HELPER" && (
                        <div className="rating-section">
                            <label>Jouw beoordeling:</label>
                            {userInfo.rating === null ? (
                                <p className="no-rating">Je hebt nog geen beoordeling ontvangen</p>
                            ) : (
                                <div className="rating-stars">
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <img
                                            key={index}
                                            src={index < userInfo.rating ? starFilled : starUnfilled}
                                            alt={index < userInfo.rating ? "Gevulde ster" : "Lege ster"}
                                            className="star-icon"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <Button type="submit">Wijzigingen opslaan</Button>
                </form>
                <Button type="button" onClick={handleNavigate}>
                    {userInfo.role === "HELPER" ? "Naar alle hulpvragen" : "Ga naar je hulpvragen"}
                </Button>
            </section>
        </>
    );
}

export default Profile;
