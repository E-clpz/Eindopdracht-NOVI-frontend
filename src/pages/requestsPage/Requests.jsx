import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button.jsx";
import "./Requests.css";
import attachFileIcon from "../../assets/attach_file.png";
import trashCanIcon from "../../assets/Trash Can.png";
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";
import axios from "axios";

function Requests() {
    const [formData, setFormData] = useState({
        category: "",
        preferredDate: "",
        description: "",
        title: "",
        city: "",
        requestId: "",
    });

    const [file, setFile] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [dateError, setDateError] = useState("");

    const categories = ["Boodschappen", "Vervoer", "Gezelschap", "Overig"];
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            if (selectedFile.size <= 5 * 1024 * 1024) {
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/bmp", "application/pdf"];
                if (allowedTypes.includes(selectedFile.type)) {
                    setFile(selectedFile);
                    setFormErrors((prevErrors) => ({ ...prevErrors, file: null }));
                } else {
                    setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        file: "Onjuist bestandstype. Alleen afbeeldingen en pdf bestanden zijn toegestaan.",
                    }));
                }
            } else {
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    file: "Bestand is te groot. Maximale grootte is 5MB.",
                }));
            }
        }
    };

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setDateError("De datum mag niet in het verleden liggen.");
        } else {
            setDateError("");
            setFormData((prevData) => ({
                ...prevData,
                preferredDate: e.target.value,
            }));
        }
    };

    const validateInput = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Titel mag niet leeg zijn.";
        } else if (formData.title.length < 3 || formData.title.length > 30) {
            newErrors.title = "Titel moet tussen 3 en 30 tekens lang zijn.";
        }

        if (!formData.city.trim()) {
            newErrors.city = "Stad is verplicht.";
        }

        const today = new Date();
        const preferredDate = new Date(formData.preferredDate);

        if (preferredDate < today) {
            newErrors.preferredDate = "De datum mag niet in het verleden liggen.";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Omschrijving is verplicht.";
        } else if (formData.description.length < 10 || formData.description.length > 250) {
            newErrors.description = "Omschrijving moet tussen 10 en 250 tekens lang zijn.";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setSuccessMessage("");  // Reset success message when submitting again

        if (!validateInput()) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const requestData = {
                category: formData.category,
                preferredDate: formData.preferredDate,
                description: formData.description,
                title: formData.title,
                city: formData.city,
            };

            const response = await axios.post("http://localhost:8080/api/requests", requestData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.status !== 201) {
                throw new Error("Er is een fout opgetreden bij het aanmaken van de hulpvraag.");
            }

            const requestId = response.data.id;

            if (file) {
                const fileFormData = new FormData();
                fileFormData.append("file", file);
                fileFormData.append("requestId", requestId);

                await axios.post("http://localhost:8080/single/uploadDb", fileFormData, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
            }

            setSuccessMessage("Hulpvraag succesvol ingediend!");
            setFormData({
                category: "", preferredDate: "", description: "", title: "", city: "",
            });
            setFile(null);
            navigate("/requests/myrequests");

        } catch (error) {
            console.error(error);
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                general: error.response?.data?.message || "Er is iets misgegaan. Probeer het opnieuw.",
            }));
        }
    };

    return (
        <section className="upper-section">
            <h1>Hulpvraag indienen</h1>
            <form onSubmit={handleSubmit} className="requests-form">
                <label>
                    Titel * (max 30 tekens)
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                    {formErrors.title && <ErrorMessage message={formErrors.title}/>}
                </label>
                <label>
                    Categorie *
                    <select
                        name="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        required
                    >
                        <option value="" disabled>Kies een categorie</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Stad *
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                    />
                    {formErrors.city && <ErrorMessage message={formErrors.city}/>}
                </label>
                <label>
                    Voorkeursdatum *
                    <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleDateChange}
                        required
                    />
                    {dateError && <ErrorMessage message={dateError}/>}
                    {formErrors.preferredDate && <ErrorMessage message={formErrors.preferredDate}/>}
                </label>
                <label className="file-upload">
                    <div className="file-upload-container">
                        <img
                            src={attachFileIcon}
                            alt="Upload bestand"
                            style={{ pointerEvents: "none" }}
                        />
                        <p
                            className="file-upload-text">
                        Bijlage toevoegen (max 5MB)
                    </p>
                    </div>
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </label>
                {file && (
                    <span>
                    {file.name.length > 40 ? file.name.slice(0, 40) + "..." : file.name}
                </span>
                )}
                {file && (
                    <div className="file-actions">
                        <img
                            src={trashCanIcon}
                            alt="Verwijder bestand"
                            onClick={() => {
                                setFile(null);
                                document.getElementById('file-input').value = "";
                            }}
                        />
                        <p
                            className="file-delete-text">
                            Verwijder bestand
                        </p>
                    </div>
                )}
                {formErrors.file && <ErrorMessage message={formErrors.file} />}
                {formErrors.general && <ErrorMessage message={formErrors.general} />}
                <label>
                    Beschrijving (max 250 tekens)
                    <textarea
                        minLength="10"
                        maxLength="250"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                    />
                    {formErrors.description && <ErrorMessage message={formErrors.description}/>}
                </label>
                {successMessage && <p className="success-message">{successMessage}</p>}
                <Button type="submit" className="button-secondary">Hulpvraag indienen</Button>
            </form>
        </section>
    );

}

export default Requests;
