export const branches = [
    {
        id: 'cs',
        name: 'Comp. Science',
        color: 'var(--color-cs)',
        githubTopic: 'computer-science',
        arxivCategory: 'cs.AI',
        keywords: ['AI', 'Software', 'Algorithms']
    },
    {
        id: 'mech',
        name: 'Mechanical',
        color: 'var(--color-mech)',
        githubTopic: 'mechanical-engineering',
        arxivCategory: 'cs.RO', // Robotics/Mechanics overlap
        keywords: ['CAD', 'Robotics', 'Thermodynamics']
    },
    {
        id: 'civil',
        name: 'Civil',
        color: 'var(--color-civil)',
        githubTopic: 'civil-engineering',
        arxivCategory: 'physics.app-ph', // Applied physics often covers civil
        keywords: ['Structural', 'BIM', 'Construction']
    },
    {
        id: 'elec',
        name: 'Electrical',
        color: 'var(--color-elec)',
        githubTopic: 'electrical-engineering',
        arxivCategory: 'cs.ET', // Emerging Tech/Electrical
        keywords: ['Circuits', 'Power', 'VLSI']
    }
];

export const timeFilters = [
    { label: 'Daily', value: '1', githubRange: 'past_day' },
    { label: 'Weekly', value: '7', githubRange: 'past_week' },
    { label: 'Monthly', value: '30', githubRange: 'past_month' }
];
