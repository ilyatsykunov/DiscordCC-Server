// DiscordCC

const fs = require('fs');
const dotenv = require('dotenv');
const discord = require('discord.js');
const config = require('./config.json');
const { speechToText } = require("./speechToText");
const { toMp3 } = require("./toMp3");
const PubNub = require('pubnub');
const { sendMsg } = require('./sendMsg');

dotenv.config();
const client = new discord.Client();
exports.client = client;
const pubnub = new PubNub({
    publishKey: "ADD PUBLISH KEY",
    subscribeKey: "ADD SUBSCRIBE KEY",
    secretKey: "ADD SECRET KEY"
});
exports.pubnub = pubnub;

client.commands = new discord.Collection();

// Load the commands from the /commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Called as soon as the bot is ready to take commands
client.on('ready', () => {
    // Clear any logs/recordings from previous sessions
    client.commands.get('clearCache').execute();
    connect();
});

// Connect to the voice channel specified in the config file
async function connect() {
    try {
        const connection = await client.channels.cache.get(config.voiceChannelID).join();
        listen(connection);
    } catch (err) {
        console.log(err);
    }
}

// Records audio from a single user into an /temp folder file
function listen(connection){
    connection.on('speaking', async (user, speaking) => {

        const username = await client.guilds.fetch(config.serverID)
            .then((guild) => { return guild.members.cache.get(user.id).displayName; });

        // Notify the clients that the user started or stopped speaking
        if (speaking.bitfield == 1)
            sendMsg(username, `${config.prefix}voice ${speaking.bitfield}`);

        // Return if the user has stopped speaking or if it is a bot speaking
        if (speaking.bitfield == 0 || user.bot) return;
            
        let audioStream = connection.receiver.createStream(user, { mode: 'pcm' })

        // Pipe the voice input into an mp3 file
        const path = await toMp3(username, audioStream);

        // Transcribe the audio
        audioStream.on('end', async () => {
            if (fs.statSync(path).size < 10) {
                fs.unlinkSync(path);
                return;
            }
            speechToText(username, path);
        });

        audioStream.on('error', (err) => {
            console.log(err);
            fs.unlinkSync(path);
        });
    });
}

// Called every time someone sends a message to the chat
client.on('message', message => {
    if (message.author.bot) return

    // if it is a valid DCC command - execute it
    if (message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).split(' ');
        const commandName = args.shift().toLowerCase();

        if(!client.commands.has(commandName)) return;
        
        const command = client.commands.get(commandName);
        
        if (message.member.hasPermission("ADMINISTRATOR"))
        {
            try {
                command.execute(message, args);
            } catch (error) {
                console.error(error);
            }
        }
    }
});

client.login("ADD DISCORD BOT TOKEN");
