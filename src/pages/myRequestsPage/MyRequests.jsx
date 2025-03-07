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
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const requestsPerPage = 10;
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/requests/my", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setRequests(response.data);
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

    const handleChange = (id, field, value) => {
        setRequests((prevRequests) => prevRequests.map((req) => (req.id === id ? {...req, [field]: value} : req)));
    };

    const handleUpdateRequest = async (id) => {
        const updatedRequest = requests.find((req) => req.id === id);

        let valid = true;
        const newErrors = {...errors};

        if (!updatedRequest.title || updatedRequest.title.trim() === "") {
            newErrors[id] = {...newErrors[id], title: "Titel mag niet leeg zijn."};
            valid = false;
        } else {
            delete newErrors[id]?.title;
        }

        if (!updatedRequest.description || updatedRequest.description.trim() === "") {
            newErrors[id] = {...newErrors[id], description: "Omschrijving mag niet leeg zijn."};
            valid = false;
        } else if (updatedRequest.description.length > 250) {
            newErrors[id] = {...newErrors[id], description: "De beschrijving mag niet meer dan 250 tekens bevatten."};
            valid = false;
        } else {
            delete newErrors[id]?.description;
        }

        if (!updatedRequest.category || updatedRequest.category.id) {
            newErrors[id] = {...newErrors[id], category: "Kies een categorie."};
            valid = false;
        } else {
            delete newErrors[id]?.category;
        }

        setErrors(newErrors);

        if (!valid) return;

        try {
            await axios.put(`http://localhost:8080/api/requests/${id}`, updatedRequest, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json",
                },
            });

            setSuccessMessage("Hulpvraag succesvol bijgewerkt!");

            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (error) {
            console.error("Fout bij bijwerken van hulpvraag", error);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm("Weet je zeker dat je deze hulpvraag wilt annuleren?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/requests/${requestId}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
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

    const handleCategoryChange = (id, category) => {
        setRequests((prevRequests) =>
            prevRequests.map((req) =>
                req.id === id ? { ...req, category: category } : req
            )
        );
    };

    const handleFileChange = (id, file) => {
        setFiles({...files, [id]: file});
    };

    const navigate = useNavigate();

    const handleNavigateToNewRequest = () => {
        navigate("/requests");
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
                                    className="request-summary-date"><strong>Datum:</strong> {request.preferredDate}</span>
                            </button>
                            {expandedRequest === request.id && (<div className="request-details">
                                    <label>
                                        <strong>Titel:</strong>
                                        <input
                                            type="text"
                                            value={request.title}
                                            onChange={(e) => handleTitleChange(request.id, e.target.value)}
                                        />
                                        {errors[request.id]?.title &&
                                            <p className="error-message">{errors[request.id].title}</p>}
                                    </label>
                                    <label>
                                        <strong>Beschrijving:</strong>
                                        <textarea
                                            value={request.description}
                                            onChange={(e) => handleDescriptionChange(request.id, e.target.value)}
                                        />
                                        {errors[request.id]?.description &&
                                            <p className="error-message">{errors[request.id].description}</p>}
                                    </label>
                                    <label>
                                        <strong>Voorkeursdatum:</strong>
                                        <input
                                            type="date"
                                            value={request.preferredDate}
                                            onChange={(e) => handleDateChange(request.id, e.target.value)}
                                        />
                                        {errors[request.id]?.date &&
                                            <p className="error-message">{errors[request.id].date}</p>}
                                    </label>
                                    <label>
                                        <strong>Categorie:</strong>
                                        <select
                                            value={request.category ? request.category.name : ""}
                                            onChange={(e) => {
                                                const selectedCategory = categories.find(
                                                    (category) => category.name === e.target.value
                                                );
                                                handleCategoryChange(request.id, selectedCategory);
                                            }}
                                        >
                                            <option value="">Selecteer een categorie</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[request.id]?.category &&
                                            <p className="error-message">{errors[request.id].category}</p>}
                                    </label>
                                <label>
                                    <strong>Bestand toevoegen:</strong>
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            id={`file-input-${request.id}`}
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileChange(request.id, e.target.files[0])}
                                        />
                                        <label htmlFor={`file-input-${request.id}`}>
                                            <img src={attachFileIcon} alt="Upload bestand" className="attach-file-icon" style={{ cursor: "pointer" }} />
                                        </label>
                                    </div>

                                    {files[request.id] && (
                                        <>
                                            <span>{files[request.id].name}</span>
                                            <button onClick={() => setFiles({ ...files, [request.id]: null })}>
                                                <img src={Trash} alt="Verwijder bestand" />
                                            </button>
                                        </>
                                    )}
                                        <aside className="aside-buttons">
                                            {successMessage && <p className="update-message">Hulpvraag succesvol bijgewerkt!</p>}
                                            <Button variant="secondary" onClick={() => handleUpdateRequest(request.id)}>Hulpvraag
                                                bewerken</Button>
                                            <Button variant="tertiary" onClick={() => handleDeleteRequest(request.id)}>Hulpvraag
                                                verwijderen</Button>
                                        </aside>
                                        {request.helper && (<aside className="helper-info">
                                                <strong>Geaccepteerd door:</strong>
                                                <p>{request.helper.name}</p>
                                                <strong>Beoordeling:</strong>
                                                {[...Array(5)].map((_, i) => (<img
                                                        key={i}
                                                        src={i < request.helper.rating ? starFilled : starUnfilled}
                                                        alt="star"
                                                        className="star-icon"
                                                    />))}
                                            </aside>)}
                                    </label>
                                </div>)}
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
                <Button variant="primary" onClick={handleNavigateToNewRequest}>
                    Nieuwe hulpvraag aanmaken
                </Button>
            </section>
        </>);
};

export default MyRequests;
