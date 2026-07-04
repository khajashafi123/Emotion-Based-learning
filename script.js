const video = document.getElementById('video');
const emotionText = document.getElementById('emotion');
const recommendationText = document.getElementById('recommendation');

let lastEmotion = '';

async function startVideo() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;

        await video.play();

    } catch (error) {

        console.log('Camera Error:', error);
    }
}

async function loadModels() {

    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');

    await faceapi.nets.faceExpressionNet.loadFromUri('./models');

    startVideo();
}

video.addEventListener('play', () => {

    setInterval(async () => {

        try {

            const detections = await faceapi
                .detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceExpressions();

            if (detections.length > 0) {

                const expressions = detections[0].expressions;

                const emotion = Object.keys(expressions).reduce((a, b) =>
                    expressions[a] > expressions[b] ? a : b
                );

                emotionText.innerText = emotion.toUpperCase();

                let recommendation = '';

                switch (emotion) {

                    case 'happy':
                        recommendation = 'Continue current lesson';
                        break;

                    case 'sad':
                        recommendation = 'Watch easy explanation video';
                        break;

                    case 'angry':
                        recommendation = 'Take a short break';
                        break;

                    case 'surprised':
                        recommendation = 'Try interactive quiz';
                        break;

                    case 'neutral':
                        recommendation = 'Proceed with learning';
                        break;

                    default:
                        recommendation = 'Analyzing learning state';
                }

                recommendationText.innerText = recommendation;

                if (emotion !== lastEmotion) {

                    saveEmotion(emotion, recommendation);

                    lastEmotion = emotion;
                }
            }

        } catch (error) {

            console.log('Detection Error:', error);
        }

    }, 3000);
});

async function saveEmotion(emotion, recommendation) {

    try {

        await fetch('http://localhost:5000/save-emotion', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                emotion,
                recommendation
            })
        });

    } catch (error) {

        console.log('Fetch Error:', error);
    }
}

loadModels();