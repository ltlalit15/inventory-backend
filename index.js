const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fileUpload = require('express-fileupload');
const socketIo = require('socket.io'); // soc
 const http = require('http'); // required for socket.ioket.io
const userRoutes = require('./routes/userRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardOverviewRoutes = require('./routes/dashboardOverviewRoutes');
const productQuantityRoutes = require('./routes/productQuantityRoutes');
const stripeRoutes = require('./routes/stripeRoutes');



const db = require('./config');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure correct path to views
// Middleware
const server = http.createServer(app); // wrap express app with http server
// const io = socketIo(server, {
//   cors: {
//     origin: ['http://localhost:5173'], // Allow all origins for development
//     methods: ['GET', 'POST', 'PUT', 'DELETE']
//   }
// });

// Make io available globally in your app
//app.set('io', io);

// Socket.io connection event
// io.on('connection', (socket) => {
//   console.log('New client connected: ' + socket.id);

//   socket.on('disconnect', () => {
//     console.log('Client disconnected: ' + socket.id);
//   });
// });



app.use(cors({
    origin: ['http://localhost:5173', 'https://inventory-ecommerce.netlify.app', 'https://bonbonteamapp.com'],  // ✅ Only allow localhost:5173
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // ✅ Allow selected HTTP methods
   // allowedHeaders: ['Content-Type', 'Authorization']  // ✅ Allow these headers
}));
// Increase Payload Limit for Base64 Images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **File Upload Middleware**
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use(
    session({
        secret: 'your_secret_key', // Change this to a secure key
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 86400000 }, // 1 day expiration
    })
);


//app.use(express.static(path.join(__dirname, 'public')));

app.get('/upload/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'upload', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error(`Error serving image: ${err}`);
            res.status(500).send(err);
        }
    });
});

 
// Middleware
app.use(cors());
app.use(bodyParser.json());


app.use('/api/user', userRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product', productRoutes);
app.use('/api/dashboardOverview', dashboardOverviewRoutes);
app.use('/api/productQuantity', productQuantityRoutes);
app.use('/api/stripe', stripeRoutes);


// app.use('/api/user', authRoutes);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.listen(6500, () => {
    console.log('Server connected on port 6500');
});
