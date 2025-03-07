import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import Button from "../../components/button/Button.jsx";

function Profile() {
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        phoneNumber: "",
        city: "",
        role: "",
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
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
                    phoneNumber: response.data.phoneNumber || "",
                    city: response.data.city || "",
                    id: response.data.id,
                    role: response.data.role || "",
                });
            } catch (error) {
                console.error("Fout bij ophalen gebruikersinformatie", error);
            }
        };

        fetchUserInfo();
    }, []);

    const validateInput = () => {
        const newErrors = {};

        if (!userInfo.username.trim()) newErrors.username = "Gebruikersnaam is verplicht.";
        if (!userInfo.email.trim()) newErrors.email = "E-mail is verplicht.";

        setErrors(newErrors);
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
            await axios.put(`http://localhost:8080/api/users/${userInfo.id}`, updatedUserInfo, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setSuccessMessage("Profiel succesvol bijgewerkt!");
            const response = await axios.get("http://localhost:8080/api/users/my", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUserInfo({
                username: response.data.username,
                email: response.data.email,
                phoneNumber: response.data.phoneNumber || "",
                city: response.data.city || "",
                id: response.data.id,
                role: response.data.role || "",
            });

        } catch (error) {
            console.error("Fout bij updaten van profiel", error);
            setErrors({ general: "Kan profiel niet bijwerken. Controleer of e-mail of gebruikersnaam uniek is." });
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
                    {errors.username && <span className="error">{errors.username}</span>}

                    <label>E-mail:</label>
                    <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
                    {errors.email && <span className="error">{errors.email}</span>}

                    <label>Telefoonnummer:</label>
                    <input type="text" name="phoneNumber" value={userInfo.phoneNumber} onChange={handleChange} />

                    <label>Woonplaats:</label>
                    <input type="text" name="city" value={userInfo.city} onChange={handleChange} />

                    {errors.general && <span className="error">{errors.general}</span>}
                    {successMessage && <span className="success">{successMessage}</span>}

                    <Button type="submit">Opslaan</Button>
                </form>
                <Button type="button" onClick={handleNavigate}>
                    {userInfo.role === "HELPER" ? "Naar alle hulpvragen" : "Ga naar je hulpvragen"}
                </Button>
            </section>
        </>
    );
}

export default Profile;
