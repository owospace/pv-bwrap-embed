const axios = require('axios');
const drpc = require('discord-rpc');

// Put your steam web API key here
const STEAM_API_KEY=""
const STEAM_API="http://api.steampowered.com/"
// Put your steam account ID here
const STEAM_ID=""

// Put your Discord Application ID here, or use the default.
const DISCORD_APP_ID="1213573207047540746"

const rpc = new drpc.Client({ transport: 'ipc' });

async function setActivity() {
    if (!rpc) {
        return;
    }

    try {
        // Get Game/User Data Information
        let game = await axios.get(`${STEAM_API}ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`)
        .then(response => {
            return response.data.response.players[0];
        });

        if(!game.gameextrainfo) {
            console.log('No game detected!');
            return rpc.clearActivity();
        }

        if(!game.personaname) {
            return console.log('no user detected?');
        }

        let gameTitle = game.gameextrainfo;
        console.log(gameTitle);

        let User = game.personaname;
        console.log(User);

        let gameID = game.gameid;
        console.log(gameID);

        let profileIcon = game.avatarfull;
        console.log(profileIcon);

        // Get Game Logo and detail
        let icon = await axios.get(`${STEAM_API}IPlayerService/GetOwnedGames/v0001?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json&include_appinfo=true&include_played_free_games=true`)
        .then(response => {
            // Get response data
            let data = response.data.response.games
            // Filter response data to find appid
            let data2 = data.filter(x => x.appid == gameID);
            if(data2[0]) {
                console.log('image')
                imgID = data2[0].img_icon_url;
            } else {
                console.log('no-image')
                imgID = '';
            }
            // Assign imgID
            
        })

        let imageUrl;
        if(imgID === '') {
            console.log('no-image')
            imageUrl = 'https://www.pngplay.com/wp-content/uploads/5/Question-Mark-Symbol-PNG-Background.png'
        } else {
            console.log('image')
            imageUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${gameID}/${imgID}.jpg`
        }


        rpc.setActivity({
            details: `${gameTitle}`,
            state: `Playing via Steam`,
            largeImageKey: imageUrl,
            smallImageKey: profileIcon,
            instance: false,
        })
        
    } catch(err) {
        console.log(err);
    }


}

rpc.on('ready', () => {
    console.log('DiscordRPC: Ready')

    setInterval(() => {
        setActivity();
    }, 15e3);
});

rpc.login({ clientId:DISCORD_APP_ID }).catch(console.error);