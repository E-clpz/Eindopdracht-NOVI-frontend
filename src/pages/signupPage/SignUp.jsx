import Input from "../../components/input/Input.jsx"
import "./SignUp.css";
import Button from "../../components/button/Button.jsx"

const SignUp = () => {
    return (
        <main>
            <section className="upper-section">
                <h1>Inschrijven</h1>
            </section>
            <section className="signup-content">
                <article className="signup-form">
                    <form>
                        <Input label="Gebruikersnaam:" type="text" name="username" required/>
                        <Input label="Wachtwoord:" type="password" name="password" required/>
                        <Input label="E-mail adres:" type="email" name="email" required/>
                        <Input label="Tel.nr:" type="tel" name="phone" required/>
                        <Input label="Woonplaats:" type="text" name="city" required/>
                        <fieldset>
                            <legend>Rol:</legend>
                            <label>
                                <input type="radio" name="role" value="aanvrager" required/> Ik ben een aanvrager
                            </label>
                            <label>
                                <input type="radio" name="role" value="maatje" required/> Ik ben een maatje
                            </label>
                        </fieldset>
                    </form>
                    <div className="rules">
                        <h2>Huisregels</h2>
                        <ol>
                            <li>Wees lief voor elkaar en behandel elkaar met respect.</li>
                            <li>Gebruik geen grove taal of racistische opmerkingen.Dit geld tevens voor de
                                gebruikersnaam.
                                Indien deze regels worden overschreven kan uw gebruiksersaccount worden bevroren of
                                verwijderd.
                            </li>
                            <li>Het is niet de bedoeling deze app voor illegale doeleinden te gebruiken.
                                Bij schending van deze regel kunnen de autoriteiten worden ingeschakeld.
                            </li>
                        </ol>
                        <Button type="submit" variant="secondary">Inschrijven</Button>
                    </div>
                </article>
            </section>
            <section className="lower-section">
            </section>
        </main>
    );
};

export default SignUp;