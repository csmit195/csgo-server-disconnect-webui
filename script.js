const base_url = 'https://api.counter-strike.me';

let blacklist = [];
let whitelist = [];

alertify.defaults.movable = false;
alertify.defaults.modal = false;

const submitButton = document.querySelector('#btn_break_server');
const AddWhitelist = document.querySelector('#btn_add_whitelist');
const AddBlacklist = document.querySelector('#btn_add_blacklist');

const apiTokenField = document.getElementById('api-token-field');
const savedApiToken = localStorage.getItem('apiToken');
if (savedApiToken) {
    apiTokenField.value = savedApiToken;
}
apiTokenField.addEventListener('input', () => {
    localStorage.setItem('apiToken', apiTokenField.value);
});

async function Initiate(){
    const IsOnline = await Status();

    const status = document.querySelector('#status span');
    status.classList.remove('pending', 'online', 'offline')

    status.innerText = IsOnline ? 'Online' : 'Offline';
    status.classList.add(IsOnline ? 'online' : 'offline');

    if (IsOnline){
        ToggleButtons(false);
    }

    // Grab blacklist
    const response = await fetch(`${base_url}/blacklist?key=${apiTokenField.value}`);
    const jsonResponse = await response.json();
    
    if ( jsonResponse.success ) {
        blacklist = jsonResponse.blacklist;
    }

    // grab whitelist
    const response2 = await fetch(`${base_url}/whitelist?key=${apiTokenField.value}`);
    const jsonResponse2 = await response2.json();

    if ( jsonResponse2.success ) {
        whitelist = jsonResponse2.whitelist;
    }

    const ClearWhitelist = document.querySelector('#btn_clear_whitelist');
    const ClearBlacklist = document.querySelector('#btn_clear_blacklist');
    
    ClearWhitelist.addEventListener('click', async (event) => {
        if (whitelist.length == 0) {
            alertify.error('Whitelist is empty.');
            return;
        }
        
        alertify.confirm('Are you sure you want to clear the whitelist?', async function () {
            // send DELETE method http request to base_url + /whitelist?key=apiToken
            const steamid = whitelist[0];

            const response = await fetch(`${base_url}/whitelist?key=${apiTokenField.value}&steamids=${steamid}`, {
                method: 'DELETE'
            });
            const jsonResponse = await response.json();

            console.log(jsonResponse);

            alertify.success('Whitelist cleared.');
        }, function () {
            
        });
    });

    ClearBlacklist.addEventListener('click', async (event) => {
        if (blacklist.length == 0) {
            alertify.error('Blacklist is empty.');
            return;
        }

        alertify.confirm('Are you sure you want to clear the blacklist?', async function () {
            // generate steamids=steamid1&steamids=steamid2&steamids=steamid3
            const steamid_str_array = blacklist.map(steamid => `steamids=${steamid}`);
            const steamid_str = steamid_str_array.join('&');

            const response = await fetch(`${base_url}/blacklist?key=${apiTokenField.value}&${steamid_str}`, {
                method: 'DELETE',
            });
            const jsonResponse = await response.json();

            console.log(jsonResponse);

            alertify.success('Blacklist cleared.');
        }, function () {
            
        });
    });

    AddWhitelist.addEventListener('click', async (event) => {
        const steamid = document.getElementById('steamid-field').value;

        const response = await fetch(`${base_url}/whitelist?key=${apiTokenField.value}&steamids=${steamid}`, {
            method: 'PUT'
        });
        const jsonResponse = await response.json();

        console.log(jsonResponse);

        if (jsonResponse.success) {
            alertify.success('Whitelist added.');
        } else {
            alertify.error(`Error: ${jsonResponse.error}`);
        }
    });

    AddBlacklist.addEventListener('click', async (event) => {
        const steamid = document.getElementById('steamid-field').value;

        const response = await fetch(`${base_url}/blacklist?key=${apiTokenField.value}&steamids=${steamid}`, {
            method: 'PUT'
        });
        const jsonResponse = await response.json();

        console.log(jsonResponse);

        if (jsonResponse.success) {
            alertify.success('Blacklist added.');
        } else {
            alertify.error(`Error: ${jsonResponse.error}`);
        }
    });
}

function validate(){
    var apiToken = document.getElementById('api-token-field').value;
    var steamId = document.getElementById('steamid-field').value;
    
    if (apiToken == "" || steamId == ""){
        alertify.error('Please fill in all fields.');
        return false;
    }

    if ( apiToken.length != 32 ) {
        alertify.error("API Token is invalid.");
        return false;
    }

    if ( steamId.length != 17 ) {
        alertify.error("SteamID is invalid.");
        return false;
    }

    return true;
}

async function Status() {
    const response = await fetch(base_url);
    const jsonResponse = await response.json();

    return jsonResponse.state.Idle > 0 || jsonResponse.state.Busy > 0;
}

function ToggleButtons(state) {
    submitButton.disabled = state;
    submitButton.classList.toggle('disabled', state);

    AddWhitelist.disabled = state;
    AddWhitelist.classList.toggle('disabled', state);

    AddBlacklist.disabled = state;
    AddBlacklist.classList.toggle('disabled', state);
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

    ToggleButtons(true);

    alertify.message('Attempting...');

    const url = `${base_url}/disconnect?steamid=${steamId}&key=${apiToken}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();

    // if response 429, then the user has been rate limited, tell them to wait 1 minute
    if (response.status === 429) {
        alertify.error('You have been rate limited. Please wait 1m before trying again.');
        return;
    }

    if (jsonResponse.success) {
        alertify.success(`Success! Disconnected from server with ID ${jsonResponse.server}`);
    } else {
        if ( jsonResponse.error == 'No SDR ticket. Try again after 10 seconds' ) {
            setTimeout(function() {
                ToggleButtons(false);
            }, 10000);
            
            alertify.warning('Failed to find SDR ticket. Please try again in 10 seconds.');
            return;
        }

        alertify.error(`Error: ${jsonResponse.error}`);
    }

    ToggleButtons(false);
});

Initiate();