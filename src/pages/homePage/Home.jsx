import "./Home.css";
import logoBig from "../../assets/Logo MaatjesMatch Big.png";
import BigArrow from "../../assets/BigArrow.png";

function Home() {
    return <>
        <section className="upper-section">
            <img src={logoBig} alt="MatchMaatje Logo" className="logo"/>
            <div className="intro-text">
                <h1>Welkom bij MatchMaatje!</h1>
                <p><em>De plek</em> om met mensen in contact te komen die jou kunnen helpen met een hulpvraag.
                    Schrijf je in en kies of je een Maatje wil worden of een hulpvraag wil plaatsen.</p>
            </div>
        </section>
        <section className="lower-section">
            <div className="steps">
                <h2 className="lower-section-h2">Zo werkt het:</h2>
                <div className="step">
                    <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 1</span>
                    <p>Klik op de knop inschrijven en maak een account aan als Maatje of Aanvrager. Wanneer je je
                        succesvol hebt ingeschreven wordt je automatisch doorgelinkt naar de inlogpagina. <strong>TIP:
                            Schrijf je inloggegevens op!</strong></p>
                </div>
                <div className="step">
                    <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 2</span>
                    <p>Log in als Maatje en blader door de verschillende hulpvragen, of login als Aanvrager en schrijf
                        je hulpvraag.</p>
                </div>
                <div className="step">
                    <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 3</span>
                    <p>Accepteer een hulpvraag of wacht tot een maatje jouw hulpvraag heeft accepteert.</p>
                </div>
                <div className="step">
                    <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 4</span>
                    <p>Nadat een Maatje een hulpvraag heeft geaccepteerd wordt het e-mailadres en het telefoonnummer van
                        dat Maatje zichtbaar voor de Aanvrager, zodat contact kan
                        worden gezocht.</p>
                </div>
            </div>
        </section>
    </>
}

export default Home;