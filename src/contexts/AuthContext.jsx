import { createContext, useContext, useState, useEffect } from 'react';
import {
    loginAPI,
    registerTravelerAPI,
    registerProviderAPI,
    logoutAPI,
    mapApiResponseToUser,
    getCurrentUserAPI, // Added named import
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
 * Extract user-friendly error message from API errors
 */
const getErrorMessage = (error, defaultMessage) => {
    // Backend returns structured error
    if (error?.response?.data) {
        const data = error.response.data;
        // ApiError structure from Spring
        if (data.message) return data.message;
        if (data.error) return data.error;
        // Validation errors
        if (data.errors && Array.isArray(data.errors)) {
            return data.errors.join(', ');
        }
    }
    // Axios network error
    if (error?.message) {
        if (error.message.includes('Network Error')) {
            return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        }
        return error.message;
    }
    return defaultMessage;
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
                    // Vérifier si la session est toujours valide côté serveur
                    try {
                        const userProfile = await getCurrentUserAPI();
                        // On garde l'utilisateur du localStorage
                        const parsedUser = JSON.parse(savedUser);
                        setUser(parsedUser);
                    } catch (apiError) {
                        console.warn('Session serveur expirée, déconnexion propre.', apiError);
                        localStorage.removeItem('osmausia-user');
                        setUser(null);
                    }
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
