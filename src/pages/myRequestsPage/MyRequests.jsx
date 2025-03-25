import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import CaretLeft from "../../assets/Caret Square Left.png";
import CaretRight from "../../assets/Caret Square Right.png";
import Trash from "../../assets/Trash Can.png";
import attachFileIcon from "../../assets/attach_file.png";
import starFilled from "../../assets/Star Filled.png";
import starUnfilled from "../../assets/Star Unfilled.png";
import Button from "../../components/button/Button.jsx";
import "./MyRequests.css";

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [files, setFiles] = useState({});
    const [errorMessage, setErrorMessage] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const [helperRatings, setHelperRatings] = useState({});
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const requestsPerPage = 10;
    const totalPages = Math.ceil(requests.length / requestsPerPage);
    const startIndex = (currentPage - 1) * requestsPerPage;
    const visibleRequests = requests.slice(startIndex, startIndex + requestsPerPage);
    const toggleExpand = (id) => {
        setExpandedRequest(expandedRequest === id ? null : id);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const navigate = useNavigate();

    const handleNavigateToNewRequest = () => {
        navigate("/requests");
    };

    const handleChange = (id, field, value) => {
        setRequests((prevRequests) => prevRequests.map((req) => (req.id === id ? {...req, [field]: value} : req)));
    };

    const handleTitleChange = (id, value) => {
        setErrorMessage((prevErrors) => ({...prevErrors, [id]: {...prevErrors[id], title: ""}}));

        if (!value || value.trim() === "") {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], title: "Titel mag niet leeg zijn."},
            }));
        } else if (value.trim().length < 3 || value.trim().length > 30) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], title: "Titel moet tussen de 3 en 30 tekens bevatten."},
            }));
        } else {
            setErrorMessage((prevErrors) => {
                const newErrors = {...prevErrors};
                delete newErrors[id]?.title;
                return newErrors;
            });
        }
        handleChange(id, "title", value);
    };

    const handleDescriptionChange = (id, value) => {
        setErrorMessage((prevErrors) => ({
            ...prevErrors, [id]: {...prevErrors[id], description: ""},
        }));
        if (!value || value.trim() === "") {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], description: "Beschrijving mag niet leeg zijn."},
            }));
        } else if (value.trim().length < 10) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], description: "Beschrijving moet minimaal 10 tekens bevatten."},
            }));
        } else if (value.trim().length > 250) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                [id]: {...prevErrors[id], description: "Beschrijving mag niet langer zijn dan 250 tekens."},
            }));
        } else {
            setErrorMessage((prevErrors) => {
                const newErrors = {...prevErrors};
                delete newErrors[id]?.description;
                return newErrors;
            });
        }
        handleChange(id, "description", value);
    };

    const handleDateChange = (id, value) => {
        const currentDate = new Date().toISOString().split("T")[0];
        if (value < currentDate) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], date: "De datum mag niet in het verleden liggen."},
            }));
            return;
        }
        handleChange(id, "preferredDate", value);
        setErrorMessage((prevErrors) => {
            const newErrors = {...prevErrors};
            delete newErrors[id]?.date;
            return newErrors;
        });
    };

    const handleCategoryChange = (id, value) => {
        handleChange(id, "category", value);
    };

    const handleUpdateRequest = async (id) => {
        const updatedRequest = requests.find((req) => req.id === id);

        if (!updatedRequest) {
            setErrorMessage("Request niet gevonden.");
            return;
        }

        const formData = new FormData();

        const requestData = {
            title: updatedRequest.title,
            description: updatedRequest.description,
            category: updatedRequest.category,
            city: updatedRequest.city,
            preferredDate: updatedRequest.preferredDate,
        };

        try {
            await axios.put(`http://localhost:8080/api/requests/${id}`, requestData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json",
                },
            });

            setSuccessMessage("Hulpvraagtekst succesvol bijgewerkt.");
            setTimeout(() => setSuccessMessage(""), 5000);

        } catch {
            setErrorMessage("Fout bij bijwerken van hulpvraagtekst.");
            return;
        }

        const file = files[id];

        if (updatedRequest.fileUrl && !updatedRequest.deleteFile) {

            if (file) {
                setErrorMessage("Er is al een bestand gekoppeld aan deze hulpvraag.");
                return;
            }
        }

        if (file || updatedRequest.deleteFile) {

            if (!validateFile(file, id)) return;

            formData.append("file", file);

            if (updatedRequest.deleteFile) {
                formData.append("deleteFile", "true");
            }

            try {
                await axios.put(`http://localhost:8080/api/requests/${id}/file`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data",
                    },
                });

                setRequests((prevRequests) => prevRequests.map((request) => request.id === id ? {
                    ...request,
                    fileUrl: file ? file.name : null
                } : request));

                setSuccessMessage("Bestand succesvol bijgewerkt.");
                setTimeout(() => setSuccessMessage(""), 5000);

            } catch {
                setErrorMessage("Fout bij bijwerken van bestand.");
            }
        }
    };

    const validateFile = (file, requestId) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/jpg', 'application/pdf'];

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                [requestId]: {...prevErrors[requestId], file: 'Bestand is te groot. Maximale grootte is 5MB.'}
            }));
            setTimeout(() => {
                setErrorMessage((prevErrors) => {
                    const newErrors = {...prevErrors};
                    delete newErrors[requestId].file;
                    return newErrors;
                });
            }, 5000);
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                [requestId]: {...prevErrors[requestId], file: 'Alleen pdf en afbeeldingsbestanden zijn toegestaan.'}
            }));
            setTimeout(() => {
                setErrorMessage((prevErrors) => {
                    const newErrors = {...prevErrors};
                    delete newErrors[requestId].file;
                    return newErrors;
                });
            }, 5000);
            return false;
        }

        return true;
    };

    const handleFileDelete = async (requestId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.delete(`http://localhost:8080/api/requests/${requestId}/file`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setFiles(prevFiles => ({
                    ...prevFiles, [requestId]: null
                }));

                setRequests(prevRequests => prevRequests.map(request => request.id === requestId ? {
                    ...request,
                    fileUrl: null
                } : request));

                setSuccessMessage("Bestand succesvol verwijderd!");
                setTimeout(() => setSuccessMessage(""), 5000);
            } else {
                setErrorMessage("Fout bij verwijderen bestand.");
            }
        } catch (error) {
            console.error("Fout bij het verwijderen van bestand:", error);
            setErrorMessage("Fout bij het verwijderen van bestand.");
        }
    };

    const handleDeleteRequest = async (requestId) => {
        try {
            await axios.delete(`http://localhost:8080/api/requests/${requestId}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
            });

            setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
        } catch {
            setErrorMessage("Fout bij verwijderen van de hulpvraag.");
        }
    };

    const handleRatingChange = (requestId, rating) => {
        setHelperRatings((prevRatings) => ({
            ...prevRatings, [requestId]: rating,
        }));
    };

    const handleSubmitReview = async (requestId, helperId, requesterId) => {
        if (!requestId || !helperId || !requesterId) {
            setErrorMessage("Er is een fout opgetreden. Probeer het opnieuw.");
            return;
        }

        const rating = helperRatings[requestId];

        if (!rating) {
            setErrorMessage("Kies een beoordeling voordat je deze indient.");
            return;
        }

        const reviewData = {rating, requestId, helperId, requesterId};

        try {
            await axios.post(`http://localhost:8080/api/reviews/requester/${requesterId}/helper/${helperId}`, reviewData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage("Beoordeling succesvol ingediend!");
            setReviewSubmitted(true);
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            if (error.message === "Network Error") {
                console.error("De backend is niet bereikbaar.");
                setErrorMessage("Kan geen verbinding maken met de server. Controleer je internetverbinding.");
            } else {
                console.error("Fout bij indienen beoordeling:", error);
                setErrorMessage("Er is een fout opgetreden bij het indienen van je beoordeling.");
            }
        }
    }

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/requests/my", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setRequests(response.data);

                const updatedFiles = {};
                response.data.forEach(request => {
                    if (request.file) {
                        updatedFiles[request.id] = [request.file];
                    }
                });
                setFiles(updatedFiles);
            } catch {
                setErrorMessage("Fout bij ophalen van hulpvragen.");
            }
        };

        fetchRequests();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/categories", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCategories(response.data);
            } catch {
                setErrorMessage("Fout bij ophalen van categorieën.");
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            <section className="upper-section">
                <h2 className="title">Mijn Hulpvragen</h2>
                <ul className="request-list">
                    {visibleRequests.map((request) => (<li key={request.id} className="request-item">
                            <button className="request-summary" onClick={() => toggleExpand(request.id)}>
                                <span className="request-summary-title">
                                <strong>Titel:</strong> {request.title}
                                </span>
                                <span className="request-summary-status">
                                 <strong>Status:</strong> {request.status}
                                </span>
                                <span className="request-summary-date">
                                <strong>Voorkeursdatum:</strong> {formatDate(request.preferredDate)}
                                </span>
                            </button>
                            {expandedRequest === request.id && (<article className="request-details">
                                    <label>
                                        <strong>Titel (max 30 tekens):</strong>
                                        <input
                                            type="text"
                                            value={request.title}
                                            onChange={(e) => handleTitleChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.title && typeof errorMessage[request.id]?.title === "string" && (
                                            <p className="error-message">{errorMessage[request.id].title}</p>)}
                                    </label>
                                    <label>
                                        <strong>Beschrijving (max 250 tekens):</strong>
                                        <textarea
                                            value={request.description}
                                            onChange={(e) => handleDescriptionChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.description && typeof errorMessage[request.id]?.description === "string" && (
                                            <p className="error-message">{errorMessage[request.id].description}</p>)}
                                    </label>
                                    <label>
                                        <strong>Voorkeursdatum:</strong>
                                        <input
                                            type="date"
                                            value={request.preferredDate}
                                            onChange={(e) => handleDateChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.date && typeof errorMessage[request.id]?.date === "string" && (
                                            <p className="error-message">{errorMessage[request.id].date}</p>)}
                                    </label>
                                    <label>
                                        <strong>Categorie:</strong>
                                        <select
                                            value={request.category ? request.category.name : ""}
                                            onChange={(e) => handleCategoryChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        >
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>))}
                                        </select>
                                        {errorMessage[request.id]?.category && typeof errorMessage[request.id]?.category === "string" && (
                                            <p className="error-message">{errorMessage[request.id].category}</p>)}
                                    </label>
                                    {!(request.status === "Geaccepteerd" || request.status === "Gesloten") && (
                                        <section className="file-upload">
                                            <input
                                                type="file"
                                                id={`file-input-${request.id}`}
                                                style={{display: "none"}}
                                                onChange={(e) => {
                                                    const selectedFile = e.target.files[0];
                                                    if (selectedFile && validateFile(selectedFile, request.id)) {
                                                        setFiles((prevFiles) => ({
                                                            ...prevFiles, [request.id]: selectedFile,
                                                        }));
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="upload-file-button"
                                                onClick={() => document.getElementById(`file-input-${request.id}`).click()}
                                            >
                                                <img src={attachFileIcon} alt="Upload bestand"
                                                     className="attach-file-icon"/>
                                                <span className="upload-file-text">
                                                {files[request.id] ? `Bestand: ${files[request.id].name.length > 40 ? files[request.id].name.slice(0, 40) + "..." : files[request.id].name}` : "Bestand toevoegen"}
                                                </span>
                                            </button>
                                        </section>)}
                                    {errorMessage[request.id]?.file && typeof errorMessage[request.id]?.file === "string" && (
                                        <p className="error-message">{errorMessage[request.id].file}</p>)}
                                    {successMessage && <p className="upload-file-message">{successMessage}</p>}
                                    {request?.fileUrl && (<label>
                                            <p>Toegevoegd bestand:</p>
                                            <span>
                                            {request.fileUrl.split("/").pop()?.length > 40 ? (
                                                <span>{request.fileUrl.split("/").pop().slice(0, 40)}...</span>) : (
                                                <span>{request.fileUrl.split("/").pop()}</span>)}
                                            </span>
                                        </label>)}
                                    {request.status !== "Geaccepteerd" && request.status !== "Gesloten" && request.fileUrl && (
                                        <button className="delete-file-button"
                                                onClick={() => handleFileDelete(request.id)}>
                                            <img src={Trash} alt="Verwijder bestand"/>
                                            <span className="delete-file-text">Toegevoegd bestand verwijderen</span>
                                        </button>)}
                                    {request.status === "Open" && (<div className="button-container">
                                            <Button variant="secondary" onClick={() => handleUpdateRequest(request.id)}>
                                                Hulpvraag bewerken
                                            </Button>
                                            <Button variant="tertiary" onClick={() => handleDeleteRequest(request.id)}>
                                                Hulpvraag verwijderen
                                            </Button>
                                        </div>)}
                                    {errorMessage && typeof errorMessage === "string" &&
                                        <p className="error-message">{errorMessage}</p>}
                                    {request.helper && (<section className="helper-info">
                                            <p><strong>Geaccepteerd door Maatje:</strong> {request.helper.username}</p>
                                            <p><strong>E-mailadres:</strong> {request.helper.email}</p>
                                            <p><strong>Telefoonnummer:</strong> {request.helper.phoneNumber}</p>
                                            <strong>Beoordeling Maatje:</strong>
                                            <div className="rating-container">
                                                {request.helper.rating ? ([...Array(5)].map((_, i) => (<img
                                                            key={i}
                                                            src={i < request.helper.rating ? starFilled : starUnfilled}
                                                            alt="star"
                                                            className="star-icon"
                                                        />))) : (<p>
                                                        <i>{request.helper.username} heeft nog geen beoordeling
                                                            ontvangen.</i>
                                                    </p>)}
                                            </div>
                                            {request.status.toLowerCase() === "gesloten" && !reviewSubmitted && (<>
                                                    <label className="rating-label">
                                                        <strong>Geef een beoordeling:</strong>
                                                        <select
                                                            value={helperRatings[request.id] || ""}
                                                            onChange={(e) => handleRatingChange(request.id, e.target.value)}
                                                        >
                                                            <option value="">Kies een beoordeling</option>
                                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                                <option key={rating} value={rating}>
                                                                    {rating} Sterren
                                                                </option>))}
                                                        </select>
                                                    </label>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => handleSubmitReview(request.id, request.helper.id, request.requesterId)}
                                                        disabled={!helperRatings[request.id]}
                                                    >
                                                        Verstuur beoordeling
                                                    </Button>
                                                </>)}
                                        </section>)}
                                    {!request.helper && request.status !== "Open" && (
                                        <p>Er is geen maatje gekoppeld aan deze aanvraag.</p>)}
                                </article>)}
                        </li>))}
                </ul>
                <nav className="pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        <img src={CaretLeft} alt="Vorige pagina"/>
                    </button>
                    <span>
          Pagina {currentPage} van {totalPages}
                    </span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                        <img src={CaretRight} alt="Volgende pagina"/>
                    </button>
                </nav>
            </section>
            <section className="upper-section">
                <Button variant="primary" onClick={handleNavigateToNewRequest}>
                    Nieuwe hulpvraag maken
                </Button>
            </section>
        </>
    );
};

export default MyRequests;
