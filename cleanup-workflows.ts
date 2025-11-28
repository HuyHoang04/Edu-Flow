import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const TEST_USER = {
    email: "lahuyhoang04@gmail.com",
    name: "huyhoang la",
    avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIhXK5X6vfMSaQ7iMyNdcaHf__9OAxvPbyCjQN1JXDNDecuqYUi=s96-c",
    googleId: "c3d3cd28-cdfc-462c-91bc-9242aeb6ebca",
    accessToken: "ya29.a0ATi6K2vUG0pDfJ0-iitkXYF4tIgaldu54N_LJ67xcBxi3Cd-RDjI2N0SNTX1u4GNvLNhoLVnhKKP5KP8JmCVw4059gQIiRNhXAA0YIz1OaeXrymYsUgbybQcXE5si0mPvHnWVQTGxYR0gMX7zx90oX3qs6jJH2WRVz9qZI_Fy0eJNSFP1ev5ePqXCSOSkXQl2MwPIoEaCgYKAXkSARYSFQHGX2MiZysabGSwGb0J-uEe26pKdw0206"
};

async function cleanup() {
    console.log('🧹 Cleaning up old workflows...');

    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    const accessToken = loginResponse.data.access_token;
    console.log('✅ Logged in');

    // Get all workflows
    const workflowsRes = await axios.get(`${API_URL}/workflows`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(`Found ${workflowsRes.data.length} workflows`);

    // Delete all workflows
    for (const workflow of workflowsRes.data) {
        await axios.delete(`${API_URL}/workflows/${workflow.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log(`   Deleted: ${workflow.name} (${workflow.id})`);
    }

    console.log('✅ Cleanup complete!');
}

cleanup().catch(console.error);
