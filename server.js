const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/emotion_learning')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const emotionSchema = new mongoose.Schema({
    emotion: String,
    recommendation: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Emotion = mongoose.model('Emotion', emotionSchema);

app.post('/save-emotion', async (req, res) => {
    try {
        const data = new Emotion(req.body);
        await data.save();
        res.json({ message: 'Emotion Saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/emotions', async (req, res) => {
    const emotions = await Emotion.find();
    res.json(emotions);
    });

app.listen(5000, () => {
    console.log('Server running on localhost:5000');
});