
const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('https://it4409-20251.onrender.com/api/Auth/login', {
            email: "e@example.com",
            password: "PasswordE123!"
        });
        console.log('Login Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        // If successful, try to call get-all user to see if it works with the token
        if (response.data && response.data.data) {
            const token = response.data.data; // Assuming "data" field holds the session string
            console.log('\nTrying Get-All User with token...');
            try {
                const userResponse = await axios.get('https://it4409-20251.onrender.com/api/User/get-all', {
                    headers: { 'Session': token } // Assuming "Session" header based on apiClient.ts
                });
                console.log('Get-All Success!');
                console.log('Users found:', userResponse.data.data.length);
                const me = userResponse.data.data.find(u => u.email === "e@example.com");
                console.log('My User Info:', me);
            } catch (err) {
                console.error('Get-All Failed:', err.response ? err.response.data : err.message);
            }
        }

    } catch (error) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
