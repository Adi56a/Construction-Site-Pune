const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const siteRoutes = require('./routes/siteRoutes')
const rentRoutes = require('./routes/rentRoutes')


dotenv.config();


connectDB();

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/sites', siteRoutes);
app.use('/api/rent',rentRoutes)

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
