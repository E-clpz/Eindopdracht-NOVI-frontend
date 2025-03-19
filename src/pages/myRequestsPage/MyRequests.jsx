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
    const [errors, setErrors] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const requestsPerPage = 10;
    const [helperRatings, setHelperRatings] = useState({});

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
            } catch (error) {
                console.error("Fout bij ophalen van hulpvragen", error);
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
            } catch (error) {
                console.error("Fout bij ophalen van categorieën", error);
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

        console.log("Alle requests:", requests);


        const updatedRequest = requests.find((req) => req.id === id);

        if (!updatedRequest) {
            console.error("Request niet gevonden");
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
        console.log(requestData);
        console.log("Gevonden request:", updatedRequest);
        try {
            await axios.put(`http://localhost:8080/api/requests/${id}`, requestData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Hulpvraagtekst succesvol bijgewerkt.");
        } catch (error) {
            console.error("Fout bij bijwerken van hulpvraagtekst", error);
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
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                console.log("Bestand succesvol bijgewerkt.");
            } catch (error) {
                console.error("Fout bij bijwerken van bestand", error);
                return;
            }
        }

        setSuccessMessage("Hulpvraag succesvol bijgewerkt!");
        setTimeout(() => setSuccessMessage(""), 5000);
    };


    const handleDeleteRequest = async (requestId) => {

        try {
            await axios.delete(`http://localhost:8080/api/requests/${requestId}`, {
                headers:
                    {Authorization: `Bearer ${localStorage.getItem("token")}`},
            });

            setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

        } catch (error) {
            console.error("Fout bij verwijderen van de hulpvraag", error);
        }
    };

    const handleTitleChange = (id, value) => {
        if (!value || value.trim() === "") {
            setErrors((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], title: "Titel mag niet leeg zijn."},
            }));
        } else {
            setErrors((prevErrors) => {
                const newErrors = {...prevErrors};
                delete newErrors[id]?.title;
                return newErrors;
            });
        }
        handleChange(id, "title", value);
    };

    const handleDescriptionChange = (id, value) => {
        if (value.length > 250) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [id]: {...prevErrors[id], description: "De beschrijving mag niet meer dan 250 tekens bevatten."},
            }));
            return;
        }
        handleChange(id, "description", value);
        setErrors((prevErrors) => {
            const newErrors = {...prevErrors};
            delete newErrors[id]?.description;
            return newErrors;
        });
    };

    const handleDateChange = (id, value) => {
        const currentDate = new Date().toISOString().split("T")[0];
        if (value < currentDate) {
            setErrors((prevErrors) => ({
                ...prevErrors, [id]: {...prevErrors[id], date: "De datum mag niet in het verleden liggen."},
            }));
            return;
        }
        handleChange(id, "preferredDate", value);
        setErrors((prevErrors) => {
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

        if (files[requestId] && files[requestId].length > 0) {
            setErrors("Er mag maar 1 bestand per aanvraag worden geüpload.");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/bmp", "application/pdf"];
        const validFiles = [];

        selectedFiles.forEach((file) => {

            if (file.size <= 5 * 1024 * 1024) {
                if (allowedTypes.includes(file.type)) {
                    validFiles.push(file);
                } else {
                    console.warn(`${file.name} heeft een onjuist bestandstype. Alleen afbeeldingen en PDF-bestanden zijn toegestaan.`);
                    alert(`${file.name} heeft een onjuist bestandstype. Alleen afbeeldingen en PDF-bestanden zijn toegestaan.`);
                }
            } else {
                console.warn(`${file.name} is te groot. Maximale grootte is 5MB.`);
                alert(`${file.name} is te groot. Maximale grootte is 5MB.`);
            }
        });

        if (validFiles.length > 0) {

            try {
                const formData = new FormData();
                validFiles.forEach((file) => {
                    formData.append("file", file);
                });

                formData.append("requestId", requestId);


                const response = await axios.put(`http://localhost:8080/api/requests/${requestId}/file`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                console.log("Bestand succesvol geüpload:", response.data);

                setFiles((prevFiles) => ({
                    ...prevFiles,
                    [requestId]: validFiles,
                }));
            } catch (error) {
                console.error("Fout bij het uploaden van bestand:", error.response || error);
            }
        } else {
            console.warn("Geen geldige bestanden om te uploaden.");
        }
    };

    const navigate = useNavigate();

    const handleNavigateToNewRequest = () => {
        navigate("/requests");
    };

    const handleRatingChange = (requestId, rating) => {
        setHelperRatings((prevRatings) => ({
            ...prevRatings,
            [requestId]: rating,
        }));
    };

    const handleSubmitReview = async (requestId, helperId, requesterId) => {
        console.log("handleSubmitReview aangeroepen met:", requestId, helperId, requesterId);
        if (!requestId || !helperId || !requesterId) {
            console.error("Fout: requestId, helperId of requesterId ontbreekt", { requestId, helperId, requesterId });
            alert("Er is een fout opgetreden. Probeer het opnieuw.");
            return;
        }

        const rating = helperRatings[requestId];

        if (!rating) {
            alert("Kies een beoordeling voordat je deze indient.");
            return;
        }

        const reviewData = { rating, requestId, helperId, requesterId };

        try {
            await axios.post(`http://localhost:8080/api/reviews/requester/${requesterId}/helper/${helperId}`, reviewData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            console.log("Verzonden reviewData:", reviewData);
            alert("Beoordeling succesvol ingediend!");

        } catch (error) {
            console.error("Fout bij het indienen van de beoordeling:", error);
            alert("Er is een fout opgetreden bij het indienen van je beoordeling.");
        }
    };

    const handleFileDelete = async (requestId) => {
        try {
            console.log("Verwijder bestand voor request ID:", requestId);

            const token = localStorage.getItem("token");

            const response = await axios.delete(`http://localhost:8080/api/requests/${requestId}/file`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                console.log("Bestand succesvol verwijderd");

                setRequests(prevRequests =>
                    prevRequests.map(request =>
                        request.id === requestId ? { ...request, fileUrl: null } : request
                    )
                );
            } else {
                console.error("Fout bij verwijderen bestand: ", response);
            }
        } catch (error) {
            console.error("Fout bij het verwijderen van bestand:", error);
        }
    };

    return (<>
            <section className="upper-section">
                <h2 className="title">Mijn Hulpvragen</h2>
                <ul className="request-list">
                    {visibleRequests.map((request) => (
                        <li key={request.id} className="request-item">
                            <button className="request-summary" onClick={() => toggleExpand(request.id)}>
                                <span className="request-summary-title"><strong>Titel:</strong> {request.title}</span>
                                <span className="request-summary-status"><strong>Status:</strong> {request.status}</span>
                                <span className="request-summary-date"><strong>Voorkeursdatum:</strong> {formatDate(request.preferredDate)}</span>
                            </button>
                            {expandedRequest === request.id && (
                                <div className="request-details">
                                    <label>
                                        <strong>Titel:</strong>
                                        <input
                                            type="text"
                                            value={request.title}
                                            onChange={(e) => handleTitleChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errors[request.id]?.title && <p className="error-message">{errors[request.id].title}</p>}
                                    </label>
                                    <label>
                                        <strong>Beschrijving (max 250 tekens):</strong>
                                        <textarea
                                            value={request.description}
                                            onChange={(e) => handleDescriptionChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errors[request.id]?.description && <p className="error-message">{errors[request.id].description}</p>}
                                    </label>
                                    <label>
                                        <strong>Voorkeursdatum:</strong>
                                        <input
                                            type="date"
                                            value={request.preferredDate}
                                            onChange={(e) => handleDateChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        />
                                        {errors[request.id]?.date && <p className="error-message">{errors[request.id].date}</p>}
                                    </label>
                                    <label>
                                        <strong>Categorie:</strong>
                                        <select
                                            value={request.category ? request.category.name : ""}
                                            onChange={(e) => handleCategoryChange(request.id, e.target.value)}
                                            disabled={request.status === "Geaccepteerd" || request.status === "Gesloten"}
                                        >
                                            <option value={request.category}>{request.category}</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[request.id]?.category && <p className="error-message">{errors[request.id].category}</p>}
                                    </label>
                                    {!(request.status === "Geaccepteerd" || request.status === "Gesloten") && (
                                        <label>
                                            <strong>Bestand toevoegen (max 5 MB):</strong>
                                            <div className="file-upload">
                                                <input
                                                    type="file"
                                                    id={`file-input-${request.id}`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => handleFileChange(request.id, e)}
                                                />
                                                <label htmlFor={`file-input-${request.id}`}>
                                                    <img
                                                        src={attachFileIcon}
                                                        alt="Upload bestand"
                                                        className="attach-file-icon"
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                </label>
                                            </div>
                                        </label>
                                    )}
                                    {request.status !== "Geaccepteerd" && request.status !== "Gesloten" && request.fileUrl && (
                                        <button onClick={() => handleFileDelete(request.id)}>
                                            <img src={Trash} alt="Verwijder bestand" />
                                        </button>
                                    )}
                                    {request.fileUrl && (
                                        <div>
                                            <p>Bijgevoegd bestand:</p>
                                            <span>
                                                {request.fileUrl && request.fileUrl.split('/').pop().length > 50 ? (
                                                    <span>{request.fileUrl.split('/').pop().slice(0, 50)}...</span>
                                                ) : (
                                                    <span>{request.fileUrl.split('/').pop()}</span>
                                                )}
                                            </span>
                                            {request.fileUrl.endsWith(".jpg") ||
                                            request.fileUrl.endsWith(".jpeg") ||
                                            request.fileUrl.endsWith(".png") ||
                                            request.fileUrl.endsWith(".bmp") ? (
                                                <p>Afbeeldingen kunnen niet worden weergegeven.</p>
                                            ) : request.fileUrl.endsWith(".pdf") ? (
                                                <iframe
                                                    src={request.fileUrl}
                                                    width="100%"
                                                    height="500px"
                                                    title="PDF Voorbeeld"
                                                ></iframe>
                                            ) : (
                                                <a href={request.fileUrl} download>
                                                    Download bestand
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <aside className="aside-buttons">
                                        {successMessage && <p className="update-message">{successMessage}</p>}
                                        {request.status === "Open" && (
                                            <div>
                                                <Button variant="secondary"
                                                        onClick={() => handleUpdateRequest(request.id)}>
                                                    Hulpvraag bewerken
                                                </Button>
                                                <Button variant="tertiary"
                                                        onClick={() => handleDeleteRequest(request.id)}>
                                                    Hulpvraag verwijderen
                                                </Button>
                                            </div>
                                        )}
                                    </aside>
                                    {request.helper ? (
                                        <aside className="helper-info">
                                            <p><strong>Geaccepteerd door Maatje:</strong> {request.helper.username}</p>
                                            <p><strong>E-mail Adres:</strong> {request.helper.email}</p>
                                            <p><strong>Telefoonnummer:</strong> {request.helper.phoneNumber}</p>
                                            <strong>Beoordeling:</strong>
                                            {request.helper.rating ? (
                                                [...Array(5)].map((_, i) => (
                                                    <img
                                                        key={i}
                                                        src={i < request.helper.rating ? starFilled : starUnfilled}
                                                        alt="star"
                                                        className="star-icon"
                                                    />
                                                ))
                                            ) : (
                                                <p><i>{request.helper.username} heeft nog geen beoordeling ontvangen.</i></p>
                                            )}
                                            {request.status.toLowerCase() === "gesloten" && (
                                                <>
                                                    <label>
                                                        {successMessage && <p className="success-message">{successMessage}</p>}
                                                        <strong>Geef een beoordeling:</strong>
                                                        <select
                                                            value={helperRatings[request.id] || ""}
                                                            onChange={(e) => handleRatingChange(request.id, e.target.value)}
                                                        >
                                                            <option value="">Kies een beoordeling</option>
                                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                                <option key={rating} value={rating}>{rating} Sterren</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => {
                                                            console.log("Request object:", request);
                                                            console.log("Request requester:", request.requester);
                                                            console.log("Request status:", request.status);

                                                            if (request.helper && request.requester) {
                                                                console.log("Review wordt ingediend...");
                                                                handleSubmitReview(request.id, request.helper.id, request.requester.id);
                                                            } else {
                                                                console.error("Fout: Helper of requester is niet aanwezig", request);
                                                            }
                                                        }}
                                                        disabled={!helperRatings[request.id]}
                                                    >
                                                        Verstuur beoordeling
                                                    </Button>
                                                </>
                                            )}
                                        </aside>
                                    ) : (
                                        <>
                                            {request.status !== "Open" && !request.helper && (
                                                <p>Er is geen maatje gekoppeld aan deze aanvraag.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
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
                <Button variant="primary" onClick={handleNavigateToNewRequest}>
                    Nieuwe hulpvraag maken
                </Button>
            </section>
        </>
    );
};

export default MyRequests;
