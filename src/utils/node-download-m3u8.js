const { exec } = require('child_process');

const m3u8Url = '';
const outputFile = 'output.mp4';

const ffmpeg = exec(`ffmpeg -i ${m3u8Url} -c copy ${outputFile}`);

ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    const timeMatch = output.match(/time=(\d+:\d+:\d+\.\d+)/);
    if (timeMatch) {
        const currentTime = timeMatch[1];
        console.log(`Current time: ${currentTime}`);
    }
});

ffmpeg.on('close', (code) => {
    if (code === 0) {
        console.log('Conversion complete');
    } else {
        console.error('Conversion failed');
    }
});
