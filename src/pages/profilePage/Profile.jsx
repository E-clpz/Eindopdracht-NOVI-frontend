import { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error("Er is een fout opgetreden bij het ophalen van gebruikersinformatie", error);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <h2>Profiel van {userInfo.name}</h2>
            <div className="profile-details">
                <p><strong>Gebruikersnaam:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Telefoonnummer:</strong> {userInfo.phone}</p>
            </div>
        </div>
    );
}

export default Profile;
