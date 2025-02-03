import {Route, Routes } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.jsx';
import Home from './pages/homePage/Home.jsx';
import './App.css'
import Contact from "./pages/contactPage/Contact.jsx";
import Login from "./pages/loginPage/Login.jsx";
import NotFound from "./pages/notFoundPage/NotFound.jsx";
import Signin from "./pages/signInPage/SignIn.jsx";

function App() {

  return (
    <>
        <Navigation />
        <main>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/signin" element={<Signin />} />
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
