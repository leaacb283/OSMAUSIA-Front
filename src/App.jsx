import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
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
import ProviderReservations from './pages/ProviderReservations';
import Preferences from './pages/Preferences';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OfferDetails from './pages/OfferDetails';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import Explore from './pages/Explore';
import ComingSoon from './pages/ComingSoon';
import Messages from './pages/Messages';
import CGU from './pages/CGU';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import About from './pages/About';





function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        {/* Routes with Layout */}
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/offer/:type/:id" element={<OfferDetails />} />
                            <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                            <Route path="/partner/reservations" element={<ProviderReservations />} />
                            <Route path="/preferences" element={<Preferences />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/messages/:partnerId" element={<Messages />} />

                            {/* Pages légales */}
                            <Route path="/terms" element={<CGU />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/legal" element={<Legal />} />
                            <Route path="/contact" element={<Contact />} />

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

