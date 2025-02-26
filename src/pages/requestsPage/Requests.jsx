import { useState } from "react";
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
    });

    const [file, setFile] = useState(null);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [dateError, setDateError] = useState("");

    const categories = ["Boodschappen", "Vervoer", "Gezelschap", "Overig"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    //voor git push wijziging gemaakt

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
            setFile(selectedFile);
        } else {
            alert("Bestand is te groot. Maximale grootte is 5MB.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSuccessMessage("");

        if (!formData.category || !formData.preferredDate || !formData.description || !formData.title || !formData.city) {
            setFormError("Alle velden zijn verplicht.");
            return;
        }

        let requestData = new FormData();
        requestData.append("category", formData.category);
        requestData.append("preferredDate", formData.preferredDate);
        requestData.append("description", formData.description);
        requestData.append("title", formData.title);
        requestData.append("city", formData.city);
        if (file) {
            requestData.append("file", file);
        }

        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:8080/api/requests", formData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (response.status !== 201) {
                throw new Error("Fout bij het indienen van de hulpvraag.");
            }

            setSuccessMessage("Hulpvraag succesvol ingediend!");
            setFormData({
                category: "",
                preferredDate: "",
                description: "",
                title: "",
                city: "",
            });
            setFile(null);
        } catch (error) {
            setFormError(error.message);
        }
    };

    return (
        <section className="upper-section">
            <h1>Hulpvraag indienen</h1>
            <form onSubmit={handleSubmit} className="requests-form">
                {formError && <ErrorMessage message={formError} />}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <label>
                    Titel *
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Categorie *
                    <select name="category" value={formData.category} onChange={handleChange} required>
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
                        onChange={handleChange}
                        required
                    />
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
                    {dateError && <ErrorMessage message={dateError} />}
                </label>
                <label className="file-upload">
                    Bijlage (max 5MB)
                    <div className="file-upload-container">
                        <input type="file" onChange={handleFileChange} />
                        <img src={attachFileIcon} alt="Upload bestand" />
                        {file && <span>{file.name}</span>}
                        {file && <img src={trashCanIcon} alt="Verwijder bestand" onClick={() => setFile(null)} />}
                    </div>
                </label>
                <label>
                    Beschrijving (max 250 tekens)
                    <textarea
                        maxLength="250"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </label>
                <Button type="submit" className="button-secondary">Hulpvraag indienen</Button>
            </form>
        </section>
    );
}

export default Requests;
