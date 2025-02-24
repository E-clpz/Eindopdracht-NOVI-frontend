import { useState } from "react";
import Button from "../components/button/Button.jsx";
import "./Requests.css";
import attachFileIcon from "../assets/attach_file.png";
import trashCanIcon from "../assets/Trash Can.png";
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";

function Requests() {
    const [category, setCategory] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [dateError, setDateError] = useState("");
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const categories = ["Boodschappen", "Vervoer", "Gezelschap", "Overig"];

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
            setFile(selectedFile);
        } else {
            alert("Bestand is te groot. Maximale grootte is 5MB.");
        }
    };

    const handleDateChange = (event) => {
        const selectedDate = new Date(event.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setDateError("De datum mag niet in het verleden liggen.");
        } else {
            setDateError("");
            setPreferredDate(event.target.value);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setSuccessMessage("");

        if (!category || !preferredDate || !description) {
            setFormError("Alle velden zijn verplicht.");
            return;
        }

        const formData = new FormData();
        formData.append("category", category);
        formData.append("preferredDate", preferredDate);
        formData.append("description", description);
        if (file) {
            formData.append("file", file);
        }

        try {
            const response = await fetch("http://localhost:8080/api/requests", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Fout bij het indienen van de hulpvraag.");
            }

            setSuccessMessage("Hulpvraag succesvol ingediend!");
            setCategory("");
            setPreferredDate("");
            setFile(null);
            setDescription("");
        } catch (error) {
            setFormError(error.message);
        }
    };

    return (
        <main className="upper-section">
            <h2>Hulpvraag indienen</h2>
            <form onSubmit={handleSubmit} className="requests-form">
                {formError && <ErrorMessage message={formError} />}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <label>
                    Categorie *
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="" disabled>Kies een categorie</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Voorkeursdatum *
                    <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={preferredDate}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
                <Button type="submit" className="primary-button">Hulpvraag indienen</Button>
            </form>
        </main>
    );
}

export default Requests;
