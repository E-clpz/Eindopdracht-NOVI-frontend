import './Home.css';
import logoBig from '../../assets/Logo MaatjesMatch Big.png';

function Home() {
    return (<>
        <header className="header outer-container">
            <div className="header inner-container">
                <img src={logoBig} alt="Company logo"/>
            </div>
        </header>
        <section className="section outer-container">
            <div className="section inner-container">
                <h1>Welkom bij MatchMaatje</h1>

                <p>ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa debitis et explicabo ipsum libero nemo odit officia quas quibusdam suscipit. Nam omnis quia quo repudiandae veniam. Consectetur deserunt hic similique!</p>
                <p>ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi aperiam assumenda autem blanditiis debitis dolor dolorum eum eveniet excepturi incidunt laboriosam modi nam odio perferendis quia reiciendis totam unde, vel.</p>

            </div>
        </section>
    </>);
}

export default Home;