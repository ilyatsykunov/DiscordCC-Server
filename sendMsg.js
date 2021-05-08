function sendMsg(name, transcription, metadata = '') {
    if (name.length < 1 || transcription.length < 1) 
        return;

    const { pubnub } = require("./index");
    const newMsg = `${name}|${new Date().toLocaleDateString()}|${new Date().toLocaleTimeString()}|${transcription}|${metadata}`;

    pubnub.publish({
        message: newMsg,
        channel: 'main'
    },
    function (status, response) {
        if (status.error) {
            console.log(status);
        }
    });
}
exports.sendMsg = sendMsg;