import{ChatGPTAPI} from 'chatgpt';
import axios from 'axios';
import dotenv from 'dotenv';
import tmi from "tmi.js"
import commands from "./commands.js"
import {msToTime} from "./functions.js"
let chatGPTCooldownEnabled = true;
dotenv.config();
const ChatGPTapi = new ChatGPTAPI({
    apiKey: process.env.CHATGPT_API_KEY,
    debug: true
});
const chatGPTCoolDownMinutes = 120000; // 2 minutes
let lastChatGPTMessageTime = null;
const client = new tmi.client({
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_PASSWORD,
    },
    channels: ["elfini7y"]
})

const modCommands = ["!cooldown"];

client.connect();
client.on("connected", () => {
    if(chatGPTCooldownEnabled){
        client.say("elfini7y", `ChatGPT cooldown enabled. Please wait ${msToTime(chatGPTCoolDownMinutes)} minutes before using ChatGPT again.`)
    }
});
client.on("message", async (channel, tags, message, self) => {
    if(self) return;
    const isAdmin = tags.username === "elfini7y" || tags.mod == true;
    if(modCommands.includes(message.toLocaleLowerCase) && !isAdmin) return;

    if(message.toLowerCase() === "!cooldown" && isAdmin) {
        chatGPTCooldownEnabled = !chatGPTCooldownEnabled;
        client.say(channel, `ChatGPT cooldown ${chatGPTCooldownEnabled ? 'enabled' : 'disabled'}.`)
        return;
    }
    //everything else is CHATGPT
    if(message.includes(`@${process.env.TWITCH_USERNAME.toLocaleLowerCase()}`)){
        //make cooldown if enabled
        if(chatGPTCooldownEnabled && (lastChatGPTMessageTime != null && (new Date().getTime() - lastChatGPTMessageTime < chatGPTCoolDownMinutes))) {
            client.say(channel, `@${tags.username} Please wait ${msToTime(chatGPTCoolDownMinutes)} before using ChatGPT again.`)
            return
        }
        let res = await ChatGPTapi.sendMessage(message)
        client.say(channel, `@${tags.username}. ${res.text}`)
        if(chatGPTCooldownEnabled) lastChatGPTMessageTime = new Date().getTime();
        return;
    }

    //default commands from the json file

    const command = commands.find((command) => command.command === message.toLowerCase());
    if(command){
        client.say(channel, command.response.call(this, channel, tags, message, axios)) 
    }

});

client.on("error", (channel, err) => {
    console.log(err)
})


