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
import ComingSoon from './pages/ComingSoon';





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
                            <Route path="/about" element={<ComingSoon title="À propos d'OSMAUSIA" />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/offer/:type/:id" element={<OfferDetails />} />
                            <Route path="/my-reservations" element={<MyReservations />} />
                            <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                            <Route path="/preferences" element={<Preferences />} />

                            {/* Pages en construction */}
                            <Route path="/cgu" element={<ComingSoon title="Conditions Générales" />} />
                            <Route path="/privacy" element={<ComingSoon title="Politique de Confidentialité" />} />
                            <Route path="/legal" element={<ComingSoon title="Mentions Légales" />} />
                            <Route path="/contact" element={<ComingSoon title="Contactez-nous" message="Notre formulaire de contact arrive très bientôt." />} />

                            {/* 404 Fallback - Joli */}
                            <Route path="*" element={<ComingSoon title="Page introuvable" message="Oups ! Cette page n'existe pas ou est en cours de création." />} />
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

