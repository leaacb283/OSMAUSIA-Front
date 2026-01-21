import { createContext, useContext, useState, useEffect } from 'react';
import {
    loginAPI,
    registerTravelerAPI,
    registerProviderAPI,
    logoutAPI,
    mapApiResponseToUser,
} from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Extrait un message d'erreur lisible depuis la réponse API
 */
const getErrorMessage = (error, defaultMessage) => {
    // Si l'API retourne un message d'erreur structuré
    if (error.data) {
        // Format ApiError du backend: { message: "...", fieldErrors: [...] }
        if (error.data.message) {
            return error.data.message;
        }
        // Erreurs de validation avec liste de champs
        if (error.data.fieldErrors && error.data.fieldErrors.length > 0) {
            return error.data.fieldErrors.map(e => e.message).join('. ');
        }
    }

    // Message d'erreur simple
    if (error.message && error.message !== 'Une erreur est survenue') {
        return error.message;
    }

    // Messages par défaut selon le code HTTP
    switch (error.status) {
        case 400:
            return 'Données invalides. Vérifiez les informations saisies.';
        case 401:
            return 'Email ou mot de passe incorrect.';
        case 403:
            return 'Compte non activé. Vérifiez votre email pour confirmer votre inscription.';
        case 409:
            return 'Cet email est déjà utilisé. Essayez de vous connecter.';
        case 500:
            return 'Erreur serveur. Veuillez réessayer plus tard.';
        case 0:
            return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        default:
            return defaultMessage;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for saved session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = localStorage.getItem('osmausia-user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                } catch (e) {
                    localStorage.removeItem('osmausia-user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    /**
     * Connexion utilisateur via API
     */
    const login = async (email, password) => {
        try {
            const apiResponse = await loginAPI(email, password);
            const mappedUser = mapApiResponseToUser(apiResponse);

            setUser(mappedUser);
            localStorage.setItem('osmausia-user', JSON.stringify(mappedUser));

            return { success: true, user: mappedUser };
        } catch (error) {
            console.error('Login error:', error);

            const errorMessage = getErrorMessage(error, 'Erreur de connexion');
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Déconnexion via API
     */
    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error('Logout API error:', error);
        }

        setUser(null);
        localStorage.removeItem('osmausia-user');
    };

    /**
     * Inscription voyageur via API
     */
    const registerTraveler = async (data) => {
        try {
            const apiResponse = await registerTravelerAPI(data);
            const mappedUser = mapApiResponseToUser(apiResponse);

            mappedUser.profile = {
                ...mappedUser.profile,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                language: data.language,
            };

            setUser(mappedUser);
            localStorage.setItem('osmausia-user', JSON.stringify(mappedUser));

            return {
                success: true,
                user: mappedUser,
                message: apiResponse.message || 'Inscription réussie ! Vérifiez votre email.'
            };
        } catch (error) {
            console.error('Register traveler error:', error);

            const errorMessage = getErrorMessage(error, 'Erreur lors de l\'inscription');
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Inscription partenaire via API
     */
    const registerPartner = async (data) => {
        try {
            const apiResponse = await registerProviderAPI(data);
            const mappedUser = mapApiResponseToUser(apiResponse);

            mappedUser.profile = {
                ...mappedUser.profile,
                companyName: data.companyName,
                type: data.partnerType,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                language: data.language,
                verified: false,
            };

            setUser(mappedUser);
            localStorage.setItem('osmausia-user', JSON.stringify(mappedUser));

            return {
                success: true,
                user: mappedUser,
                message: apiResponse.message || 'Inscription réussie ! Vérifiez votre email.'
            };
        } catch (error) {
            console.error('Register partner error:', error);

            const errorMessage = getErrorMessage(error, 'Erreur lors de l\'inscription');
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Mise à jour des préférences
     */
    const updatePreferences = async (preferences) => {
        if (!user) return { success: false };

        const updatedUser = {
            ...user,
            preferences: { ...user.preferences, ...preferences },
        };

        setUser(updatedUser);
        localStorage.setItem('osmausia-user', JSON.stringify(updatedUser));

        return { success: true };
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        registerTraveler,
        registerPartner,
        updatePreferences,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
