// Store API token in local storage and fill in API token field if it exists
const apiTokenField = document.getElementById('api-token-field');
const savedApiToken = localStorage.getItem('apiToken');
if (savedApiToken) {
    apiTokenField.value = savedApiToken;
}
apiTokenField.addEventListener('input', () => {
    localStorage.setItem('apiToken', apiTokenField.value);
});

// Handle form submission
const form = document.getElementById('disconnect-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const steamIdField = document.getElementById('steamid-field');
    const apiToken = apiTokenField.value;
    const steamId = steamIdField.value;
    const url = `https://api.counter-strike.me/disconnect?steamid=${steamId}&key=${apiToken}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    if (jsonResponse.error) {
        alert(`Error: ${jsonResponse.error}`);
    } else {
        alert(`Disconnected from server with ID ${jsonResponse.server}`);
    }
});