import "./Contact.css";
import { useState } from "react";
import Button from "../../components/button/Button.jsx";
import Input from "../../components/input/Input.jsx";

const Contact = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        message: "",
        report: "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.");
        setErrorMessage("Er is iets misgegaan, probeer het later opnieuw");
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("Je melding is verzonden.");
        setErrorMessage("Er is iets misgegaan, probeer het later opnieuw");
    };

    return (
        <>
            <section className="upper-section">
                <article className="contact-info">
                    <h2>Contactgegevens</h2>
                    <p><strong>E-mail:</strong> support@maatjesmatch.nl</p>
                    <p><strong>Telefoon:</strong> 0800-123456</p>
                </article>
                <article className="contact-form">
                    <h2>Stuur ons een bericht</h2>
                    <form onSubmit={handleSubmit}>
                        <Input label="Gebruikersnaam:" type="text" name="name" required value={formData.username} onChange={handleChange} />
                        <Input label="E-mailadres:" type="email" name="email" required value={formData.email} onChange={handleChange} />
                        <Input label="Bericht:" type="textarea" name="message" required value={formData.message} onChange={handleChange} />
                        <Button type="submit" variant="secondary">Verzenden</Button>
                    </form>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </article>
                </section>
            <section className="lower-section">
                <article className="report-form">
                    <h2>Meld ongewenst taalgebruik</h2>
                    <form onSubmit={handleReportSubmit}>
                        <Input label="Omschrijving:" type="textarea" name="report" required value={formData.report} onChange={handleChange} />
                        <Button type="submit" variant="primary">Melding doen</Button>
                    </form>
                    {successMessage && <p className="success-message-report">{successMessage}</p>}
                    {errorMessage && <p className="error-message-report">{errorMessage}</p>}
                </article>
            </section>
        </>
    );
};

export default Contact;
