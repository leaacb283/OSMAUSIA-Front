// Mock Bookings Data for OSMAUSIA
// Statuses: pending, confirmed, cancelled, completed

export const mockBookings = [
    {
        id: 'bkg_001',
        oderId: 'off_001',
        offerTitle: {
            fr: 'Éco-lodge Vue Océan',
            en: 'Ocean View Eco-Lodge'
        },
        userId: 'usr_001',
        partnerId: 'prt_001',
        status: 'confirmed',
        dates: {
            checkIn: '2026-02-15',
            checkOut: '2026-02-20',
            nights: 5
        },
        guests: 2,
        pricing: {
            unitPrice: 185,
            total: 925,
            currency: 'EUR'
        },
        createdAt: '2026-01-10T14:30:00Z',
        confirmedAt: '2026-01-10T16:45:00Z',
        impact: {
            localRevenue: 740,
            co2Saved: 45,
            treesPlanted: 2
        }
    },
    {
        id: 'bkg_002',
        offerId: 'off_002',
        offerTitle: {
            fr: 'Randonnée Biodiversité',
            en: 'Biodiversity Hiking Tour'
        },
        userId: 'usr_001',
        partnerId: 'prt_002',
        status: 'completed',
        dates: {
            date: '2025-11-20',
            duration: '6 hours'
        },
        guests: 2,
        pricing: {
            unitPrice: 75,
            total: 150,
            currency: 'EUR'
        },
        createdAt: '2025-11-05T09:00:00Z',
        confirmedAt: '2025-11-05T10:30:00Z',
        completedAt: '2025-11-20T18:00:00Z',
        impact: {
            localRevenue: 135,
            co2Saved: 12,
            speciesObserved: 8
        },
        review: {
            rating: 5,
            comment: {
                fr: 'Une expérience inoubliable ! Notre guide Priya était passionnée et très pédagogue.',
                en: 'An unforgettable experience! Our guide Priya was passionate and very educational.'
            },
            createdAt: '2025-11-23T10:00:00Z'
        }
    },
    {
        id: 'bkg_003',
        offerId: 'off_003',
        offerTitle: {
            fr: 'Atelier Vannerie Traditionnelle',
            en: 'Traditional Basket Weaving Workshop'
        },
        userId: 'usr_001',
        partnerId: 'prt_003',
        status: 'pending',
        dates: {
            date: '2026-03-10',
            duration: '3 hours'
        },
        guests: 1,
        pricing: {
            unitPrice: 45,
            total: 45,
            currency: 'EUR'
        },
        createdAt: '2026-01-12T11:15:00Z',
        impact: {
            localRevenue: 40,
            artisansSupported: 1
        }
    },
    {
        id: 'bkg_004',
        offerId: 'off_006',
        offerTitle: {
            fr: 'Reforestation Participative',
            en: 'Community Reforestation'
        },
        userId: 'usr_002',
        partnerId: 'prt_002',
        status: 'confirmed',
        dates: {
            date: '2026-01-25',
            duration: '5 hours'
        },
        guests: 1,
        pricing: {
            unitPrice: 55,
            total: 55,
            currency: 'EUR'
        },
        createdAt: '2026-01-08T08:30:00Z',
        confirmedAt: '2026-01-08T09:00:00Z',
        impact: {
            localRevenue: 50,
            treesPlanted: 5,
            co2Offset: 25
        }
    },
    {
        id: 'bkg_005',
        offerId: 'off_004',
        offerTitle: {
            fr: 'Séjour Solidaire en Village',
            en: 'Solidarity Village Stay'
        },
        userId: 'usr_003',
        partnerId: 'prt_003',
        status: 'cancelled',
        dates: {
            checkIn: '2025-12-20',
            checkOut: '2025-12-23',
            nights: 3
        },
        guests: 2,
        pricing: {
            unitPrice: 95,
            total: 285,
            currency: 'EUR',
            refunded: true
        },
        createdAt: '2025-12-01T16:00:00Z',
        confirmedAt: '2025-12-01T17:30:00Z',
        cancelledAt: '2025-12-15T10:00:00Z',
        cancellationReason: {
            fr: 'Conditions météorologiques défavorables',
            en: 'Unfavorable weather conditions'
        }
    },
    {
        id: 'bkg_006',
        offerId: 'off_005',
        offerTitle: {
            fr: 'Cours de Cuisine Créole',
            en: 'Creole Cooking Class'
        },
        userId: 'usr_003',
        partnerId: 'prt_001',
        status: 'completed',
        dates: {
            date: '2025-10-15',
            duration: '4 hours'
        },
        guests: 4,
        pricing: {
            unitPrice: 65,
            total: 260,
            currency: 'EUR'
        },
        createdAt: '2025-10-01T12:00:00Z',
        confirmedAt: '2025-10-01T14:00:00Z',
        completedAt: '2025-10-15T16:00:00Z',
        impact: {
            localRevenue: 234,
            localProductsBought: 12
        },
        review: {
            rating: 4,
            comment: {
                fr: 'Superbe expérience, le chef était adorable. Un peu court pour tout apprendre.',
                en: 'Great experience, the chef was lovely. A bit short to learn everything.'
            },
            createdAt: '2025-10-18T09:00:00Z'
        }
    }
];

// Get bookings by user ID
export const getBookingsByUserId = (userId) => {
    return mockBookings.filter(booking => booking.userId === userId);
};

// Get bookings by status
export const getBookingsByStatus = (status) => {
    return mockBookings.filter(booking => booking.status === status);
};

// Get booking by ID
export const getBookingById = (id) => {
    return mockBookings.find(booking => booking.id === id);
};

// Calculate total impact for a user
export const calculateUserImpact = (userId) => {
    const userBookings = getBookingsByUserId(userId).filter(b =>
        b.status === 'completed' || b.status === 'confirmed'
    );

    return userBookings.reduce((acc, booking) => {
        if (booking.impact) {
            acc.localRevenue += booking.impact.localRevenue || 0;
            acc.co2Saved += booking.impact.co2Saved || booking.impact.co2Offset || 0;
            acc.treesPlanted += booking.impact.treesPlanted || 0;
        }
        return acc;
    }, { localRevenue: 0, co2Saved: 0, treesPlanted: 0 });
};

export default mockBookings;
