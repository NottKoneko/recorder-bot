const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const BOT_TOKEN = process.env.BOT_TOKEN;
const TARGET_USER_ID = '885360220694511656';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const userId = newState.id;

    // Check if the target user joined a voice channel
    if (
        userId === TARGET_USER_ID &&
        newState.channelId &&
        newState.channelId !== oldState.channelId
    ) {
        const channel = newState.channel;

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        console.log(`Joined channel: ${channel.name}`);

        // Mute all other users in the channel
        await muteOthers(channel, userId);
    }
});

// Function to mute all users except the target user
async function muteOthers(channel, targetUserId) {
    for (const [memberId, member] of channel.members) {
        if (memberId !== targetUserId) {
            try {
                await member.voice.setMute(true);
                console.log(`Muted ${member.user.tag}`);
            } catch (error) {
                console.error(`Failed to mute ${member.user.tag}: ${error}`);
            }
        }
    }
}

client.login(BOT_TOKEN);
