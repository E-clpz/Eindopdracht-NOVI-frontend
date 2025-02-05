import {Route, Routes } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.jsx';
import Home from './pages/homePage/Home.jsx';
import Contact from "./pages/contactPage/Contact.jsx";
import SignIn from "./pages/signInPage/SignIn.jsx";
import SignUp from "./pages/signupPage/SignUp.jsx";
import NotFound from "./pages/notFoundPage/NotFound.jsx";
import './App.css';

function App() {

  return (
    <>
        <Navigation />
        <main>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signIn" element={<SignIn/>} />
                <Route path="/signUp" element={<SignUp />} />
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </main>
        <footer className="footer">
            MatchMaatje &copy; 2025 - ontwikkeld door Rob Arentz
        </footer>
    </>
  )
}

export default App
