import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './i18n';

// Layout
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterTraveler from './pages/RegisterTraveler';
import RegisterPartner from './pages/RegisterPartner';
import Dashboard from './pages/Dashboard';
import Preferences from './pages/Preferences';

// Placeholder pages
const ExplorePage = () => (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1>🔍 Explorer</h1>
        <p>Page en construction - Découvrez toutes nos offres régénératives</p>
    </div>
);

const AboutPage = () => (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1>🌱 À propos d'OSMAUSIA</h1>
        <p>Notre mission : régénérer le monde par le tourisme responsable</p>
    </div>
);

const NotFoundPage = () => (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1>404</h1>
        <p>Page non trouvée</p>
        <a href="/" className="btn btn-primary">Retour à l'accueil</a>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        {/* Routes with Layout */}
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/explore" element={<ExplorePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/preferences" element={<Preferences />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        {/* Auth routes (no layout) */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register/traveler" element={<RegisterTraveler />} />
                        <Route path="/register/partner" element={<RegisterPartner />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
