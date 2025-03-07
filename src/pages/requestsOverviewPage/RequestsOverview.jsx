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
    const [acceptedRequests, setAcceptedRequests] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8080/api/requests", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                console.log(response.data);

                const updatedRequests = response.data.map((request) => {
                    if (acceptedRequests[request.id]) {
                        request.status = 'Geaccepteerd';
                    }
                    return request;
                });

                setRequests(updatedRequests);

            } catch (error) {
                console.error("Fout bij ophalen hulpvragen:", error);
            }
        };
        fetchRequests();
    }, [acceptedRequests]);

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

            setRequests((prevRequests) => prevRequests.map((request) =>
                request.id === id
                    ? { ...request, status: 'Geaccepteerd' }
                    : request
            ));

        } catch (error) {
            console.error("Er is een fout opgetreden:", error);
            alert("Fout bij het accepteren van de request.");
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
            <ul className="requests-list" style={{ listStyleType: "none" }}>
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <li key={request.id} className="request-item">
                            <button className="request-summary" onClick={() => toggleExpand(request.id)}>
                                <span className="request-summary-title"><strong>Titel:</strong> {request.title}</span>
                                <span
                                    className="request-summary-status"><strong>Status:</strong> {request.status}</span>
                                <span
                                    className="request-summary-date"><strong>Datum:</strong> {request.preferredDate}</span>
                            </button>
                            {expandedRequest === request.id && (
                                <div className="request-details">
                                    <p><strong>Categorie:</strong> {request.category}</p>
                                    <p><strong>Stad:</strong> {request.city}</p>
                                    <p><strong>Datum:</strong> {new Date(request.preferredDate).toLocaleDateString()}</p>
                                    <p><strong>Beschrijving:</strong> {request.description}</p>
                                    {acceptedRequests[request.id] &&
                                        <p className="accepted-message">Deze hulpvraag is aan jou toegewezen.</p>}
                                    {request.status !== 'Geaccepteerd' && (
                                        <Button className="button-primary" onClick={() => handleAcceptRequest(request.id)}
                                                disabled={acceptedRequests[request.id]}>
                                            Accepteer hulpvraag
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
