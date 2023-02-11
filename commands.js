export default [
    {
        "command": "!hello",
        "response": (channel, tags, message, axios) => {
            return `@${tags.username} Hello!`;
        }
    },
    {"command": "!range", "response": (channel, tags, message, axios) => `${tags.username} The Range SMP, is a community server(invite only), created by mrmattranger`},
    {"command": "!davecraft", "response": (channel, tags, message, axios) => `${tags.username} DaveCraft is a community server, created by daveguy_`},
]