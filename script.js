// Store API token in local storage and fill in API token field if it exists
const apiTokenField = document.getElementById('api-token-field');
const savedApiToken = localStorage.getItem('apiToken');
if (savedApiToken) {
    apiTokenField.value = savedApiToken;
}
apiTokenField.addEventListener('input', () => {
    localStorage.setItem('apiToken', apiTokenField.value);
});

function validate(){
    var apiToken = document.getElementById('api-token-field').value;
    var steamId = document.getElementById('steamid-field').value;
    
    if (apiToken == "" || steamId == ""){
        alert("Please fill in all fields.");
        return false;
    }

    if ( apiToken.length != 29 ) {
        alert("API Token is invalid.");
        return false;
    }

    if ( steamId.length != 17 ) {
        alert("SteamID is invalid.");
        return false;
    }

    return true;
}

// Handle form submission
const form = document.getElementById('disconnect-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validate()) {
        return;
    }

    const steamIdField = document.getElementById('steamid-field');
    const apiToken = apiTokenField.value;
    const steamId = steamIdField.value;

    const submitButton = document.querySelector('#disconnect-form > button');
    submitButton.disabled = true;
    submitButton.classList.add('disabled');

    const url = `https://api.counter-strike.me/disconnect?steamid=${steamId}&key=${apiToken}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();

    submitButton.disabled = false;
    submitButton.classList.remove('disabled');

    // if response 429, then the user has been rate limited, tell them to wait 1 minute
    if (response.status === 429) {
        alert('You have been rate limited. Please wait 10s-1m before trying again.');
        return;
    }

    if (jsonResponse.success) {
        alert(`Success! Disconnected from server with ID ${jsonResponse.server}`);
    } else {
        alert(`Error: ${jsonResponse.error}`);
    }
});
