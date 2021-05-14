# Discord Closed Captions - Server

A simple bot that transcribes speech in a Discord voice chat using [DeepSpeech](https://github.com/mozilla/DeepSpeech) and shares it with [DCC-Client](https://github.com/ilyatsykunov/DiscordCC-Client) users using the [PubNub API](https://www.pubnub.com/).

![DiscordCC-Screenshot](https://user-images.githubusercontent.com/37341595/118252568-d0749380-b4a0-11eb-8efa-e37de031c247.jpg)

## Setup

First of all, a [Discord bot](https://discord.com/developers/applications) will need to be registered. To get the bot to work, a free account with PubNub is needed as well as an acoustic model for Deep Speech ([download pre-made model](https://github.com/mozilla/DeepSpeech/releases/tag/v0.9.3)).

In *index.js*, add your PubNub publish, subscribe and secret keys in the following fields:
```javascript
const pubnub = new PubNub({
    publishKey: "ADD PUBLISH KEY",
    subscribeKey: "ADD SUBSCRIBE KEY",
    secretKey: "ADD SECRET KEY"
});
```

Add your Discord bot token in the following field at the end of *index.js*: 
```javascript
client.login("ADD DISCORD BOT TOKEN");
```

Add your Discord server ID and the voice channel ID token in the following fields in *config.json*: 
```javascript
"serverID": "ADD DISCORD SERVER ID",
"voiceChannelID": "ADD YOUR VOIE CHANNEL ID"
```

Finally, add the path to your model and scorer in the following fields in *speechToText.js*:  
```javascript
const modelPath = 'ADD YOUR DEEPSPEECH MODEL PATH';
const scorerPath = 'ADD YOUR DEEPSPEECH SCORER PATH';
```

If you wish to use the [DCC-Client](https://github.com/ilyatsykunov/DiscordCC-Client) to see the transcriptions on the screen, it will also need to be setup to use your PubNub keys.
