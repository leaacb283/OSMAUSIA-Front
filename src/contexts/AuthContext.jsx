import { createContext, useContext, useState, useEffect } from 'react';
import { validateLogin, findUserByEmail } from '../data/mockUsers';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for saved session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('osmausia-user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('osmausia-user');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const validatedUser = validateLogin(email, password);
        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem('osmausia-user', JSON.stringify(validatedUser));
            return { success: true, user: validatedUser };
        }
        return { success: false, error: 'auth.loginError' };
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('osmausia-user');
    };

    // Register traveler
    const registerTraveler = async (data) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if email already exists
        if (findUserByEmail(data.email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Create new user (in real app, this would be an API call)
        const newUser = {
            id: `usr_${Date.now()}`,
            email: data.email,
            role: 'traveler',
            profile: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                language: data.language,
                avatar: null,
                createdAt: new Date().toISOString()
            },
            preferences: {
                newsletter: true,
                notifications: true,
                dataSharing: false
            },
            impact: {
                totalTrips: 0,
                co2Saved: 0,
                localSpend: 0,
                communitiesSupported: 0
            }
        };

        setUser(newUser);
        localStorage.setItem('osmausia-user', JSON.stringify(newUser));
        return { success: true, user: newUser };
    };

    // Register partner
    const registerPartner = async (data) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if email already exists
        if (findUserByEmail(data.email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Create new partner (in real app, this would be an API call)
        const newPartner = {
            id: `prt_${Date.now()}`,
            email: data.email,
            role: 'partner',
            profile: {
                companyName: data.companyName,
                type: data.partnerType,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                language: data.language,
                verified: false,
                createdAt: new Date().toISOString()
            },
            business: {
                description: '',
                location: '',
                certifications: [],
                regenScore: {
                    environmental: 0,
                    social: 0,
                    experience: 0
                }
            }
        };

        setUser(newPartner);
        localStorage.setItem('osmausia-user', JSON.stringify(newPartner));
        return { success: true, user: newPartner };
    };

    // Update user preferences
    const updatePreferences = async (preferences) => {
        if (!user) return { success: false };

        const updatedUser = {
            ...user,
            preferences: { ...user.preferences, ...preferences }
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
        updatePreferences
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
