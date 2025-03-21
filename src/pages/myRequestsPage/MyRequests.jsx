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
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const requestsPerPage = 10;
    const [helperRatings, setHelperRatings] = useState({});
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

    const handleChange = (id, field, value) => {
        setRequests((prevRequests) => prevRequests.map((req) => (req.id === id ? {...req, [field]: value} : req)));
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

            setSuccessMessage("Hulpvraag succesvol bijgewerkt.");
        } catch {
            setErrorMessage("Fout bij bijwerken van hulpvraagtekst.");
            return;
        }

        if (updatedRequest.newFile || updatedRequest.deleteFile) {
            if (updatedRequest.newFile) {
                formData.append("file", updatedRequest.newFile);
            }

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
                    ...request, fileUrl: updatedRequest.newFile ? updatedRequest.newFile.name : request.fileUrl,
                } : request));

                setSuccessMessage("Bestand succesvol bijgewerkt.");
            } catch {
                setErrorMessage("Fout bij bijwerken van bestand.");
                return;
            }
        }

        setTimeout(() => setSuccessMessage(""), 5000);
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
        }
        else if (value.trim().length < 10) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                [id]: { ...prevErrors[id], description: "Beschrijving moet minimaal 10 tekens bevatten." },
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

    const handleFileChange = async (requestId, e) => {
        const selectedFiles = Array.from(e.target.files);

        setErrorMessage((prevErrors) => ({
            ...prevErrors, [requestId]: {...prevErrors[requestId], file: ""},
        }));
        setSuccessMessage('');

        if (files[requestId] && files[requestId].length > 0) {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                [requestId]: {...prevErrors[requestId], file: "Er mag maar 1 bestand per aanvraag worden geüpload."},
            }));
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/bmp", "application/pdf"];
        const validFiles = [];

        selectedFiles.forEach((file) => {
            if (file.size <= 5 * 1024 * 1024) {
                if (allowedTypes.includes(file.type)) {
                    validFiles.push(file);
                } else {
                    setErrorMessage((prevErrors) => ({
                        ...prevErrors,
                        [requestId]: {
                            ...prevErrors[requestId],
                            file: `${file.name} heeft een onjuist bestandstype. Alleen afbeeldingen en PDF-bestanden zijn toegestaan.`
                        },
                    }));
                }
            } else {
                setErrorMessage((prevErrors) => ({
                    ...prevErrors,
                    [requestId]: {...prevErrors[requestId], file: `${file.name} is te groot. Maximale grootte is 5MB.`},
                }));
            }
        });

        if (validFiles.length > 0) {
            try {
                const formData = new FormData();
                validFiles.forEach((file) => {
                    formData.append("file", file);
                });

                formData.append("requestId", requestId);

                await axios.put(`http://localhost:8080/api/requests/${requestId}/file`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data",
                    },
                });

                setFiles((prevFiles) => ({
                    ...prevFiles, [requestId]: [...prevFiles[requestId] || [], ...validFiles],
                }));

                setSuccessMessage("Bestand succesvol geüpload!");
                setTimeout(() => setSuccessMessage(""), 5000);
            } catch {
                setErrorMessage((prevErrors) => ({
                    ...prevErrors,
                    [requestId]: {
                        ...prevErrors[requestId],
                        file: "Fout bij het uploaden van bestand. Probeer het opnieuw."

                    },
                }));
                setTimeout(() => {
                    setErrorMessage((prevErrors) => {
                        const newErrors = { ...prevErrors };
                        delete newErrors[requestId]?.file;
                        return newErrors;
                    });
                }, 5000);

            }
        } else {
            setErrorMessage((prevErrors) => ({
                ...prevErrors, [requestId]: {...prevErrors[requestId], file: "Geen geldige bestanden om te uploaden."},
            }));
        }
    };

    const navigate = useNavigate();

    const handleNavigateToNewRequest = () => {
        navigate("/requests");
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
        } catch {
            setErrorMessage("Er is een fout opgetreden bij het indienen van je beoordeling.");
        }
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
                    ...prevFiles, [requestId]: []
                }));

                setRequests(prevRequests => prevRequests.map(request => request.id === requestId ? {
                    ...request, fileUrl: null
                } : request));

                setSuccessMessage("Bestand succesvol verwijderd!");
                setTimeout(() => setSuccessMessage(""), 5000);
            } else {
                setErrorMessage("Fout bij verwijderen bestand.");
            }
        } catch {
            setErrorMessage("Fout bij het verwijderen van bestand.");
        }
    };

    return (<>
            <section className="upper-section">
                <h2 className="title">Mijn Hulpvragen</h2>
                <ul className="request-list">
                    {visibleRequests.map((request) => (<li key={request.id} className="request-item">
                            <button className="request-summary" onClick={() => toggleExpand(request.id)}>
                                <span className="request-summary-title"><strong>Titel:</strong> {request.title}</span>
                                <span
                                    className="request-summary-status"><strong>Status:</strong> {request.status}</span>
                                <span
                                    className="request-summary-date"><strong>Voorkeursdatum:</strong> {formatDate(request.preferredDate)}</span>
                            </button>
                            {expandedRequest === request.id && (<article className="request-details">
                                    <label>
                                        <strong>Titel:</strong>
                                        <input
                                            type="text"
                                            value={request.title}
                                            onChange={(e) => handleTitleChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.title &&
                                            <p className="error-message">{errorMessage[request.id].title}</p>}
                                    </label>
                                    <label>
                                        <strong>Beschrijving (max 250 tekens):</strong>
                                        <textarea
                                            value={request.description}
                                            onChange={(e) => handleDescriptionChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.description &&
                                            <p className="error-message">{errorMessage[request.id].description}</p>}
                                    </label>
                                    <label>
                                        <strong>Voorkeursdatum:</strong>
                                        <input
                                            type="date"
                                            value={request.preferredDate}
                                            onChange={(e) => handleDateChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errorMessage[request.id]?.date &&
                                            <p className="error-message">{errorMessage[request.id].date}</p>}
                                    </label>
                                    <label>
                                        <strong>Categorie:</strong>
                                        <select
                                            value={request.category ? request.category.name : ""}
                                            onChange={(e) => handleCategoryChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        >
                                            <option value={request.category}>{request.category}</option>
                                            {categories.map((category) => (<option key={category.id}
                                                                                   value={category.name}>{category.name}</option>))}
                                        </select>
                                        {errorMessage[request.id]?.category &&
                                            <p className="error-message">{errorMessage[request.id].category}</p>}
                                    </label>
                                    {!(request.status === "Geaccepteerd" || request.status === "Gesloten") && (
                                        <section className="file-upload">
                                            <input
                                                type="file"
                                                id={`file-input-${request.id}`}
                                                style={{display: "none"}}
                                                onChange={(e) => handleFileChange(request.id, e)}
                                            />
                                            <button
                                                type="button"
                                                className="upload-file-button"
                                                onClick={() => document.getElementById(`file-input-${request.id}`).click()}
                                            >
                                                <img src={attachFileIcon} alt="Upload bestand"
                                                     className="attach-file-icon"/>
                                                <span className="upload-file-text">Bestand toevoegen</span>
                                            </button>
                                        </section>)}
                                    {successMessage && <p className="upload-file-message">{successMessage}</p>}
                                    {errorMessage[request.id]?.file &&
                                        <p className="error-message">{errorMessage[request.id].file}</p>}
                                    {request.fileUrl && (
                                        <label>
                                            <p>Toegevoegd bestand:</p>
                                            <span>
                                                {request.fileUrl.split('/').pop().length > 40 ? (
                                                <span>{request.fileUrl.split('/').pop().slice(0, 40)}...</span>) : (
                                                <span>{request.fileUrl.split('/').pop()}</span>)}
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
                                            {request.helper ? (<section className="helper-info">
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
                                                        />))) : (
                                                    <p><i>{request.helper.username} heeft nog geen beoordeling
                                                        ontvangen.</i></p>)}
                                            </div>
                                            {request.status.toLowerCase() === "gesloten" && !reviewSubmitted && (
                                                <>
                                                    <label className="rating-label">
                                                        <strong>Geef een beoordeling:</strong>
                                                        <select
                                                            value={helperRatings[request.id] || ""}
                                                            onChange={(e) => handleRatingChange(request.id, e.target.value)}
                                                        >
                                                            <option value="">Kies een beoordeling</option>
                                                            {[1, 2, 3, 4, 5].map((rating) => (<option key={rating}
                                                                                                      value={rating}>{rating} Sterren</option>))}
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
                                        </section>) : (request.status !== "Open" && !request.helper &&
                                        <p>Er is geen maatje gekoppeld aan deze aanvraag.</p>)}
                                </article>)}
                        </li>))}
                </ul>
                <nav className="pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        <img src={CaretLeft} alt="Vorige pagina"/>
                    </button>
                    <span>Pagina {currentPage} van {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                        <img src={CaretRight} alt="Volgende pagina"/>
                    </button>
                </nav>
            </section>
            <section className="upper-section">
                <Button variant="primary" onClick={handleNavigateToNewRequest}>Nieuwe hulpvraag maken</Button>
            </section>
        </>
    );
};

export default MyRequests;
