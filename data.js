// Personal data for the SQL terminal portfolio

const PORTFOLIO_DATA = {
    users: [
        {
            id: 1,
            name: 'Andrew Winter',
            created_at: 1993,
            title: 'Product & GTM Leader',
            location: 'San Francisco, CA',
            email: 'andrew@acwints.com',
            bio: 'Building cool things with AI',
        }
    ],

    experience: [
        {
            id: 1,
            user_id: 1,
            company: 'True Classic',
            role: 'Director, CX & AI/Automations',
            start_date: '2025-01',
            end_date: 'Present',
            description: 'Ecommerce'
        },
        {
            id: 2,
            user_id: 1,
            company: 'Bantee',
            role: 'Cofounder & CTO',
            start_date: '2023-10',
            end_date: '2025-01',
            description: 'Golf performance platform'
        },
        {
            id: 3,
            user_id: 1,
            company: 'Kahani',
            role: 'GTM Strategic Growth Lead',
            start_date: '2022-10',
            end_date: '2023-10',
            description: 'Travel tech'
        },
        {
            id: 4,
            user_id: 1,
            company: 'Immeasurable',
            role: 'Investor & Chief of Staff',
            start_date: '2021-05',
            end_date: '2022-10',
            description: 'Analytics platform'
        },
        {
            id: 6,
            user_id: 1,
            company: 'ClassPass',
            role: 'Program Manager, Pricing & Inventory',
            start_date: '2018-04',
            end_date: '2020-07',
            description: 'Fitness marketplace'
        },
        {
            id: 7,
            user_id: 1,
            company: 'ClassPass',
            role: 'Customer Experience',
            start_date: '2016-07',
            end_date: '2018-04',
            description: 'Fitness marketplace'
        },
        {
            id: 8,
            user_id: 1,
            company: 'S&P Global',
            role: 'Product Analyst, FIG',
            start_date: '2015-07',
            end_date: '2016-07',
            description: 'Financial data'
        }
    ],

    projects: [
        {
            id: 1,
            user_id: 1,
            name: 'Bantee',
            description: 'Strava for Golf',
            url: 'https://banteegolf.com'
        },
        {
            id: 2,
            user_id: 1,
            name: 'Winter Advisory',
            description: 'AI Consulting',
            url: 'https://winteradvisory.llc'
        },
        {
            id: 3,
            user_id: 1,
            name: 'Stravawesome',
            description: 'Web App',
            url: 'https://stravawesome.com'
        },
        {
            id: 4,
            user_id: 1,
            name: 'Klavyflow',
            description: 'Ecommerce Marketing Tool',
            url: 'https://klavyflow.com'
        },
        {
            id: 5,
            user_id: 1,
            name: 'Suppstack',
            description: 'Supplement Tracking',
            url: 'https://suppstack.app'
        },
        {
            id: 6,
            user_id: 1,
            name: 'FairwayToGreen',
            description: 'Client Website',
            url: 'https://fairwaytogreen.vercel.app/'
        },
        {
            id: 7,
            user_id: 1,
            name: 'College Sports Co',
            description: 'Client Website',
            url: 'https://collegesportsco.com'
        }
    ],

    education: [
        {
            id: 1,
            user_id: 1,
            school: 'UC Berkeley, Haas School of Business',
            degree: 'MBA',
            year: 2026,
            logo: 'haas_logo.png'
        },
        {
            id: 2,
            user_id: 1,
            school: 'Washington & Lee University',
            degree: 'BA, Economics',
            year: 2015,
            logo: 'wl_logo.jpg'
        }
    ],

    skills: [
        // Technical
        { id: 1, user_id: 1, category: 'Technical', name: 'SQL' },
        { id: 2, user_id: 1, category: 'Technical', name: 'Python' },
        { id: 3, user_id: 1, category: 'Technical', name: 'HTML & CSS' },
        { id: 4, user_id: 1, category: 'Technical', name: 'Flutter' },
        { id: 5, user_id: 1, category: 'Technical', name: 'Excel & GSheets' },
        { id: 7, user_id: 1, category: 'Technical', name: 'React' },
        { id: 8, user_id: 1, category: 'Technical', name: 'TypeScript' },
        // AI
        { id: 9, user_id: 1, category: 'AI', name: 'Claude Code' },
        { id: 10, user_id: 1, category: 'AI', name: 'Cursor' },
        { id: 11, user_id: 1, category: 'AI', name: 'Nano Banana' },
        { id: 6, user_id: 1, category: 'AI', name: 'APIs & Automations' },
        { id: 6, user_id: 1, category: 'AI', name: 'Custom Scripts' },
        // Business
        { id: 13, user_id: 1, category: 'Business', name: 'Modeling' },
        { id: 14, user_id: 1, category: 'Business', name: 'Sales' },
        { id: 15, user_id: 1, category: 'Business', name: 'Strategy' },
        { id: 16, user_id: 1, category: 'Business', name: 'Pricing' },
        { id: 17, user_id: 1, category: 'Business', name: 'Business Model' },
        // Leadership
        { id: 18, user_id: 1, category: 'Leadership', name: 'Management' },
        { id: 19, user_id: 1, category: 'Leadership', name: 'Coaching' },
        { id: 20, user_id: 1, category: 'Leadership', name: 'Growth' },
        { id: 21, user_id: 1, category: 'Leadership', name: 'Resourcing' },
        { id: 12, user_id: 1, category: 'Leadership', name: 'Training' },
        // Investing
        { id: 22, user_id: 1, category: 'Investing', name: 'Sourcing' },
        { id: 23, user_id: 1, category: 'Investing', name: 'Diligence' },
        { id: 24, user_id: 1, category: 'Investing', name: 'Fundraising' },
        { id: 25, user_id: 1, category: 'Investing', name: 'Writing' }
    ],

    social_links: [
        {
            id: 1,
            user_id: 1,
            platform: 'LinkedIn',
            url: 'https://linkedin.com/in/andrew-clark-winter',
            username: 'andrew-clark-winter'
        },
        {
            id: 2,
            user_id: 1,
            platform: 'Twitter',
            url: 'https://x.com/acwints',
            username: '@acwints'
        },
        {
            id: 3,
            user_id: 1,
            platform: 'GitHub',
            url: 'https://github.com/acwints',
            username: 'acwints'
        }
    ]
};
