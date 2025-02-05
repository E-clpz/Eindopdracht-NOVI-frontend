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
                        Schrijf je in en kies of je een maatje wil worden of een hulpvraag wil plaatsen.</p>
                </div>
            </section>
            <section className="lower-section">
                <h2 className="lower-section-h2">Zo werkt het:</h2>
                <div className="steps">
                    <div className="step">
                        <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 1</span>
                        <p>Klik op de knop inschrijven en maak een account aan als maatje of aanbieder.</p>
                    </div>
                    <div className="step">
                        <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 2</span>
                        <p>Log in als Maatje of als Aanbieder en blader door de verschillende hulpvragen.</p>
                    </div>
                    <div className="step">
                        <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 3</span>
                        <p>Accepteer een hulpvraag of wacht tot een maatje jouw hulpvraag accepteert.</p>
                    </div>
                    <div className="step">
                        <span className="step-box" style={{backgroundImage: `url(${BigArrow})`}}>Stap 4</span>
                        <p>Na wederzijdse acceptatie worden de contactgegevens van elkaar gedeeld zodat contact kan
                            worden gezocht.</p>
                    </div>
                </div>
            </section>
            </>
}

export default Home;