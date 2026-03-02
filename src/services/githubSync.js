const GIST_FILENAME = 'blueprint-vault.json';
const GIST_DESCRIPTION = 'The Blueprint - Personal Vault Sync (Automated)';

/**
 * Finds the Blueprint Gist in the user's account or creates a new one.
 */
export const findOrCreateGist = async (token) => {
    try {
        // 1. List gists to find existing one
        const listResponse = await fetch('https://api.github.com/gists', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const gists = await listResponse.json();

        const existingGist = gists.find(g => g.files[GIST_FILENAME]);

        if (existingGist) {
            return existingGist.id;
        }

        // 2. Create new gist if not found
        const createResponse = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: GIST_DESCRIPTION,
                public: false,
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify({ vault: [], lastSynced: new Date().toISOString() })
                    }
                }
            })
        });
        const newGist = await createResponse.json();
        return newGist.id;
    } catch (error) {
        console.error("Gist Sync Error:", error);
        throw error;
    }
};

/**
 * Fetches the vault data from the specific Gist.
 */
export const pullFromCloud = async (gistId, token) => {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const gist = await response.json();
    const content = gist.files[GIST_FILENAME].content;
    return JSON.parse(content);
};

/**
 * Updates the Gist with new vault data.
 */
export const pushToCloud = async (gistId, token, data) => {
    await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: {
                [GIST_FILENAME]: {
                    content: JSON.stringify({
                        vault: data,
                        lastSynced: new Date().toISOString()
                    })
                }
            }
        })
    });
};
