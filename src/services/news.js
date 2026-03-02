/**
 * Industry News Service
 * Curated news for engineering branches
 */

const newsData = {
    cs: [
        {
            id: 1,
            title: "DeepMind's Gemini 1.5 Pro pushes context window to 1M tokens",
            source: "Google DeepMind",
            date: "1 day ago",
            url: "https://deepmind.google/technologies/gemini/",
            abstract: "Gemini 1.5 Pro is a mid-size multimodal model, optimized for scaling across a wide range of tasks. It delivers performance similar to 1.0 Ultra, while being much more efficient. It also introduces a breakthrough feature: a context window of 1 million tokens."
        },
        {
            id: 2,
            title: "Next.js 15 RC introduces compiler-driven optimizations",
            source: "Vercel",
            date: "3 days ago",
            url: "https://nextjs.org/blog",
            abstract: "Next.js 15 Release Candidate is now available. This version focuses on stability, performance, and developer experience. It includes the new Next.js Compiler, which is written in Rust and provides faster builds and better optimization."
        },
        {
            id: 3,
            title: "Rust foundation announces new security initiative for 2024",
            source: "Rust Blog",
            date: "5 days ago",
            url: "https://foundation.rust-lang.org/",
            abstract: "The Rust Foundation has announced a new initiative to improve the security of the Rust ecosystem. This includes funding for security research, new tools for vulnerability detection, and better coordination between the community and industry partners."
        }
    ],
    mech: [
        {
            id: 4,
            title: "Boston Dynamics retires Atlas HD, unveils fully electric successor",
            source: "Boston Dynamics",
            date: "2 days ago",
            url: "https://bostondynamics.com/atlas/",
            abstract: "Boston Dynamics has officially retired the hydraulic version of Atlas and introduced a new, fully electric Atlas humanoid. The new robot is designed to be more capable, agile, and easier to manufacture for real-world applications."
        },
        {
            id: 5,
            title: "3D Printing breakthroughs in aerospace alloys at NASA",
            source: "NASA Tech",
            date: "1 week ago",
            url: "https://www.nasa.gov/technology/",
            abstract: "NASA engineers have successfully tested new 3D-printed aerospace alloys that can withstand extreme temperatures and pressures. These materials could lead to lighter and more efficient rocket engines and aircraft components."
        },
        {
            id: 11,
            title: "Advancements in computational fluid dynamics for wind turbine design",
            source: "Engineering.com",
            date: "2 weeks ago",
            url: "https://www.engineering.com/",
            abstract: "New CFD modules are allowing engineers to simulate turbulence more accurately, leading to a 5% increase in energy capture for offshore wind farms."
        },
        {
            id: 12,
            title: "Formula 1 shifts to fully sustainable fuels for 2026 engine regulations",
            source: "Motorsport Tech",
            date: "3 weeks ago",
            url: "https://www.motorsport.com/",
            abstract: "The FIA has finalized the technical regulations for the 2026 power units, mandating 100% sustainable fuels and increased electrical output."
        }
    ],
    civil: [
        {
            id: 7,
            title: "World's tallest timber skyscraper completed in Switzerland",
            source: "Architectural Digest",
            date: "6 days ago",
            url: "https://www.architecturaldigest.com/",
            abstract: "A new record has been set for the world's tallest timber skyscraper. The building, located in Switzerland, demonstrates the potential of wood as a sustainable and durable construction material for high-rise buildings."
        },
        {
            id: 13,
            title: "Smart sensors embedded in concrete monitored the performance of the new Gotthard bridge",
            source: "Civil Eng. Weekly",
            date: "2 weeks ago",
            url: "https://www.ice.org.uk/",
            abstract: "The integration of IoT sensors within structural members allows for real-time health monitoring, potentially extending the lifespan of critical infrastructure by decades."
        },
        {
            id: 14,
            title: "Tokyo's new underground discharge tunnel sets standard for flood prevention",
            source: "Infrastructure News",
            date: "4 weeks ago",
            url: "https://www.asce.org/",
            abstract: "As urban areas face increasing climate risk, Tokyo's G-Cans project serves as a model for massive civil engineering interventions to protect metropolitan areas from storm surges."
        }
    ],
    elec: [
        {
            id: 10,
            title: "NVIDIA H200 chips start shipping to cloud providers",
            source: "NVIDIA News",
            date: "12 hours ago",
            url: "https://nvidianews.nvidia.com/",
            abstract: "NVIDIA has started shipping its new H200 GPUs to cloud service providers. The H200 is based on the Hopper architecture and offers significantly better performance and memory capacity for AI and high-performance computing tasks."
        },
        {
            id: 15,
            title: "Solid-state battery breakthrough: Researchers achieve 10,000 cycles",
            source: "Nature Electronics",
            date: "1 week ago",
            url: "https://www.nature.com/natelectron/",
            abstract: "A team of researchers has developed a new solid electrolyte that prevents dendrite formation, paving the way for safe, long-lasting electric vehicle batteries."
        },
        {
            id: 16,
            title: "TSMC begins 2nm trial production ahead of schedule",
            source: "Semiconductor Today",
            date: "3 weeks ago",
            url: "https://www.tsmc.com/",
            abstract: "In the race for chip supremacy, TSMC has moved into the risk production phase for its N2 process node, promising significant efficiency gains for next-gen mobile processors."
        }
    ]
};

export const fetchIndustryNews = async (branchId) => {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(newsData[branchId] || []);
        }, 500);
    });
};
