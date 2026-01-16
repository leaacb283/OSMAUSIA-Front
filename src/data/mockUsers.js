// Mock Users Data for OSMAUSIA
// Roles: traveler, partner, admin

export const mockUsers = [
    // Voyageurs
    {
        id: 'usr_001',
        email: 'marie.dupont@email.com',
        password: 'SecurePass123!@#',
        role: 'traveler',
        profile: {
            firstName: 'Marie',
            lastName: 'Dupont',
            phone: '+33 6 12 34 56 78',
            language: 'fr',
            avatar: null,
            createdAt: '2025-06-15T10:30:00Z'
        },
        preferences: {
            newsletter: true,
            notifications: true,
            dataSharing: false
        },
        impact: {
            totalTrips: 3,
            co2Saved: 245,
            localSpend: 1850,
            communitiesSupported: 5
        }
    },
    {
        id: 'usr_002',
        email: 'john.smith@email.com',
        password: 'TravelGreen2024!',
        role: 'traveler',
        profile: {
            firstName: 'John',
            lastName: 'Smith',
            phone: '+44 7700 900123',
            language: 'en',
            avatar: null,
            createdAt: '2025-08-22T14:15:00Z'
        },
        preferences: {
            newsletter: true,
            notifications: false,
            dataSharing: true
        },
        impact: {
            totalTrips: 1,
            co2Saved: 89,
            localSpend: 620,
            communitiesSupported: 2
        }
    },
    {
        id: 'usr_003',
        email: 'sophie.martin@email.com',
        password: 'EcoVoyage2025!@',
        role: 'traveler',
        profile: {
            firstName: 'Sophie',
            lastName: 'Martin',
            phone: '+33 6 98 76 54 32',
            language: 'fr',
            avatar: null,
            createdAt: '2025-03-10T09:00:00Z'
        },
        preferences: {
            newsletter: false,
            notifications: true,
            dataSharing: false
        },
        impact: {
            totalTrips: 7,
            co2Saved: 512,
            localSpend: 4200,
            communitiesSupported: 12
        }
    },

    // Partenaires
    {
        id: 'prt_001',
        email: 'contact@ecosuites-maurice.com',
        password: 'Partner@Secure1!',
        role: 'partner',
        profile: {
            companyName: 'Eco Suites Maurice',
            type: 'hebergeur',
            firstName: 'Raj',
            lastName: 'Patel',
            phone: '+230 5 123 4567',
            language: 'fr',
            verified: true,
            createdAt: '2025-01-20T08:00:00Z'
        },
        business: {
            description: 'Hébergement écologique avec vue sur l\'océan Indien',
            location: 'Grand Baie, Île Maurice',
            certifications: ['Green Key', 'Travelife Gold'],
            regenScore: {
                environmental: 92,
                social: 85,
                experience: 88
            }
        }
    },
    {
        id: 'prt_002',
        email: 'hello@naturetours.mu',
        password: 'GuideSafe2024!@',
        role: 'partner',
        profile: {
            companyName: 'Nature Tours Mauritius',
            type: 'guide',
            firstName: 'Priya',
            lastName: 'Ramgoolam',
            phone: '+230 5 987 6543',
            language: 'en',
            verified: true,
            createdAt: '2025-02-14T11:30:00Z'
        },
        business: {
            description: 'Randonnées guidées et découverte de la biodiversité locale',
            location: 'Black River, Île Maurice',
            certifications: ['Eco Guide Certified'],
            regenScore: {
                environmental: 95,
                social: 90,
                experience: 92
            }
        }
    },
    {
        id: 'prt_003',
        email: 'info@artisans-reunion.fr',
        password: 'Artisan@Mix2025!',
        role: 'partner',
        profile: {
            companyName: 'Artisans de La Réunion',
            type: 'mixte',
            firstName: 'Jean-Claude',
            lastName: 'Hoarau',
            phone: '+262 692 12 34 56',
            language: 'fr',
            verified: false,
            createdAt: '2025-11-05T16:45:00Z'
        },
        business: {
            description: 'Ateliers artisanaux et hébergement chez l\'habitant',
            location: 'Cilaos, La Réunion',
            certifications: [],
            regenScore: {
                environmental: 78,
                social: 95,
                experience: 85
            }
        }
    },

    // Admin
    {
        id: 'adm_001',
        email: 'admin@osmausia.com',
        password: 'AdminSecure2024!@#',
        role: 'admin',
        profile: {
            firstName: 'Admin',
            lastName: 'OSMAUSIA',
            phone: '+33 1 23 45 67 89',
            language: 'fr',
            permissions: ['all']
        }
    }
];

// Helper function to find user by email
export const findUserByEmail = (email) => {
    return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to validate login
export const validateLogin = (email, password) => {
    const user = findUserByEmail(email);
    if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
};

export default mockUsers;
