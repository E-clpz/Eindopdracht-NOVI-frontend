import { useEffect, useState } from "react";
import axios from "axios";
import CaretLeft from "../../assets/Caret Square Left.png";
import CaretRight from "../../assets/Caret Square Right.png";
import Button from "../../components/button/Button.jsx";
import "./RequestsOverview.css";

const RequestsOverview = () => {
    const [requests, setRequests] = useState([]);
    const [filters, setFilters] = useState({ category: "", city: "", sortBy: "" });
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [succesMessage, setSuccesMessage] = useState("");
    const [acceptedRequests, setAcceptedRequests] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8080/api/requests", {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                const updatedRequests = response.data.map((request) => ({
                    ...request,
                    status: acceptedRequests[request.id] ? "Geaccepteerd" : request.status,
                }));

                setRequests(updatedRequests);
            } catch {
                setErrorMessage("Fout bij ophalen hulpvragen.");
            }
        };
        fetchRequests();
    }, [acceptedRequests]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const totalPages = Math.ceil(requests.length / requestsPerPage);
    const startIndex = (currentPage - 1) * requestsPerPage;
    const visibleRequests = requests.slice(startIndex, startIndex + requestsPerPage);

    const toggleExpand = (id) => {
        setExpandedRequest(expandedRequest === id ? null : id);
    };

    const filteredRequests = visibleRequests
        .filter((req) => (filters.category ? req.category === filters.category : true))
        .filter((req) => (filters.city ? req.city.toLowerCase().includes(filters.city.toLowerCase()) : true))
        .sort((a, b) => {
            if (filters.sortBy === "asc") return new Date(a.preferredDate) - new Date(b.preferredDate);
            if (filters.sortBy === "desc") return new Date(b.preferredDate) - new Date(a.preferredDate);
            return 0;
        });

    const handleAcceptRequest = async (id) => {
        const token = localStorage.getItem("token");

        try {
            await axios.put(`http://localhost:8080/api/requests/${id}/accept`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAcceptedRequests((prev) => ({
                ...prev,
                [id]: true
            }));

            setRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === id
                        ? { ...request, status: "Geaccepteerd" }
                        : request
                )
            );
        } catch {
            setErrorMessage("Fout bij het accepteren van de hulpvraag.");
            setSuccesMessage("");
        }
    };


    const handleDownloadFile = async (fileUrl) => {
        try {
            const token = localStorage.getItem("token");
            const fileName = fileUrl.split("/").pop();

            const response = await axios.get(`http://localhost:8080/downloadFromDB/${fileName}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer",
            });

            const blob = new Blob([response.data], { type: "application/octet-stream" });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(downloadUrl);
        } catch {
            setErrorMessage("Fout bij het downloaden van het bestand.");
        }
    };

    return (
        <section className="upper-section">
            <h1>Overzicht van hulpvragen</h1>
            <div className="filters">
                <select name="category" onChange={handleFilterChange} value={filters.category}>
                    <option value="">Alle categorieën</option>
                    <option value="Boodschappen">Boodschappen</option>
                    <option value="Vervoer">Vervoer</option>
                    <option value="Gezelschap">Gezelschap</option>
                    <option value="Overig">Overig</option>
                </select>
                <input
                    type="text"
                    name="city"
                    placeholder="Filter op stad"
                    value={filters.city}
                    onChange={handleFilterChange}
                />
                <select name="sortBy" onChange={handleFilterChange} value={filters.sortBy}>
                    <option value="">Sorteer op datum</option>
                    <option value="asc">Datum oplopend</option>
                    <option value="desc">Datum aflopend</option>
                </select>
            </div>
            <ul className="requests-list">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <li key={request.id} className="request-item">
                            <button className="request-summary" onClick={() => toggleExpand(request.id)}>
                                <span className="request-summary-title"><strong>Titel:</strong> {request.title}</span>
                                <span className="request-summary-status"><strong>Status:</strong> {request.status}</span>
                                <span className="request-summary-date"><strong>Voorkeursdatum:</strong> {formatDate(request.preferredDate)}</span>
                            </button>
                            {expandedRequest === request.id && (
                                <div className="request-details">
                                    <p><strong>Categorie:</strong> {request.category}</p>
                                    <p><strong>Stad:</strong> {request.city}</p>
                                    <p><strong>Datum:</strong> {new Date(request.preferredDate).toLocaleDateString()}</p>
                                    <p><strong>Beschrijving:</strong> {request.description}</p>
                                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                                    {succesMessage && <p className="success-message">{succesMessage}</p>}
                                    {acceptedRequests[request.id] && (
                                        <p className="accepted-message">Deze hulpvraag is aan jou toegewezen. Je contactgegevens zijn gedeeld met de aanvrager.</p>
                                    )}
                                    {request.status === 'Open' && !acceptedRequests[request.id] && (
                                        <Button className="button-primary" onClick={() => handleAcceptRequest(request.id)}>
                                            Accepteer hulpvraag
                                        </Button>
                                    )}
                                    {request.fileUrl && (
                                        <Button className="button-secondary" onClick={() => handleDownloadFile(request.fileUrl)}>
                                            Download bestand
                                        </Button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <p>Geen hulpvragen gevonden.</p>
                )}
            </ul>
            <nav className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    <img src={CaretLeft} alt="Vorige pagina" />
                </button>
                <span>Pagina {currentPage} van {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                    <img src={CaretRight} alt="Volgende pagina" />
                </button>
            </nav>
        </section>
    );
};

export default RequestsOverview;
