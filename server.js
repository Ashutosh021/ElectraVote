const express = require('express')
const app = express();
const db = require('./Config/db');
require('dotenv').config();
const ejs = require('ejs')
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

// Import the router files
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

// Use the routers
app.get('/',(req,res)=>{
    res.render("index")
})

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);


app.listen(PORT, ()=>{
    console.log('http://localhost:3000');
})