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
import PartnerDashboard from './pages/PartnerDashboard';
import Preferences from './pages/Preferences';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchResults from './pages/SearchResults';
import OfferDetails from './pages/OfferDetails';
import MyReservations from './pages/MyReservations';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import Explore from './pages/Explore';



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
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/offer/:type/:id" element={<OfferDetails />} />
                            <Route path="/my-reservations" element={<MyReservations />} />
                            <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                            <Route path="/preferences" element={<Preferences />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        {/* Auth routes (no layout) */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register/traveler" element={<RegisterTraveler />} />
                        <Route path="/register/partner" element={<RegisterPartner />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;

