const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const allergyRoutes = require('./routes/allergyRoutes');
const { spawn } = require('child_process');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://arx3198:anshuman123@ingredients.vuzz7q6.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
})

app.use('/api', authRoutes);
app.use('/api', allergyRoutes);

app.post('/chatapi', (req, res) => {
  const message = req.body.message;

  // Get the Hugging Face API key from the environment variables
  const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;

  // Spawn a Python process and pass the Hugging Face API key as well
  const pythonProcess = spawn('python3', ['./pythonfile/chatCompletion.py', JSON.stringify({ message })]);

  // Collect the output from the Python script
  let output = '';
  pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
  });

  // Send the response when the process is done
  pythonProcess.stdout.on('end', () => {
      res.send({ response: output });
  });

  // Handle any errors from the Python process
  pythonProcess.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
      res.status(500).send('Internal Server Error');
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
