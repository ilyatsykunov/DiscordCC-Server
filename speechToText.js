const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')
const wav = require('wav');
const deepSpeech = require('deepspeech');
const { sendMsg } = require("./sendMsg");
const config = require('./config.json');

const modelPath = 'ADD YOUR DEEPSPEECH MODEL PATH';
const scorerPath = 'ADD YOUR DEEPSPEECH SCORER PATH';
const model = new deepSpeech.Model(modelPath);
exports.model = model;
model.enableExternalScorer(scorerPath);

const bufferSize = 512;

// Gathers any speech from a WAV audio file and sends it to the logs channel
async function speechToText(nickname, mp3path) {
    // Convert the mp3 audio file into wav
    const path = mp3path.replace('.mp3', '.wav');
    ffmpeg(mp3path).format('wav').save(path)
        .on('error', (err) => {
            fs.unlinkSync(mp3path);
            console.log(err);
        })
        .on ('end',  () => {
            fs.unlinkSync(mp3path);
            transcribe(path, nickname);
        });
}
exports.speechToText = speechToText;

// Stream the audio file into the speech recognition algorithm and then send output
async function transcribe(path, nickname) {
    let modelStream = model.createStream();
    const fileStream = fs.createReadStream(path, { highWaterMark: bufferSize });
    const reader = new wav.Reader();
    let transcription = null;
    reader.on('error', (err) => {
        console.log(err);
    });
    reader.on('format', (format) => {
        if (format.sampleRate !== model.sampleRate()) {
            console.log(`invalid sample rate: ${format.sampleRate} needs to be: ${model.sampleRate()}`);
        }
        reader.on('data', (data) => {
            modelStream.feedAudioContent(data);
        });
        reader.on('end', () => {
            sendMsg(nickname, `${config.prefix}voice 0`);
            transcription = modelStream.finishStream();
            fs.unlinkSync(path);
            sendMsg(nickname, transcription);
        });
    });
    fileStream.pipe(reader);
}