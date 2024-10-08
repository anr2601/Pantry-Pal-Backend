const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const allergyRoutes = require('./routes/allergyRoutes');


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


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
