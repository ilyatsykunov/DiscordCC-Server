const fs = require('fs');
const lame = require('lame');

// Pipe the live voice input into an mp3 file
async function toMp3(nickname, audioStream) {

    const dir = './tmp';
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    nickname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const mp3path = `${dir}/${nickname}_${Date.now()}.mp3`;

    var encoder = new lame.Encoder({
        // input
        channels: 2,
        bitDepth: 16,
        sampleRate: 48000,

        // output
        bitRate: 128,
        outSampleRate: 16000,
        mode: lame.MONO
    });

    audioStream.pipe(encoder);
    encoder.pipe(fs.createWriteStream(mp3path));

    return mp3path;
}

exports.toMp3 = toMp3;
