/**
 * GitHub Trending Service
 * Uses the Search API to find popular repos by topic and date
 */

export const fetchTrendingRepos = async (topic, days = 7) => {
    try {
        const date = new Date();
        // For "daily", use a 2-day window to ensure we always get results
        // (the GitHub trending page looks at ~24-48h anyway)
        const lookback = days === 1 ? 2 : days;
        date.setDate(date.getDate() - lookback);
        const dateString = date.toISOString().split('T')[0];

        // GitHub API Query: topic + active (pushed) within window + sort by stars
        const query = `topic:${topic} pushed:>${dateString}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('GitHub API failed');

        const data = await response.json();
        return data.items.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            stars: repo.stargazers_count >= 1000
                ? (repo.stargazers_count / 1000).toFixed(1) + 'k'
                : repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url,
            branch: topic
        }));
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
    }
};
export const searchRepos = async (query) => {
    try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('GitHub Search API failed');
        const data = await response.json();
        return data.items.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            stars: (repo.stargazers_count / 1000).toFixed(1) + 'k',
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url,
            type: 'repo'
        }));
    } catch (error) {
        console.error('Error searching GitHub repos:', error);
        return [];
    }
};
