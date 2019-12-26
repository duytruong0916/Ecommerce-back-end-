const express = require('express');
const mongoose = require('mongoose');
const morgan = require("morgan");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require('cors');

require('dotenv').config();
//userRouter and authrouter
const authRouters = require('./routes/auth');
const userRouters = require('./routes/user');
//categoryRouter
const categoryRouters = require('./routes/category');
const productRouters = require('./routes/product');
//braintreeRouter
const braintreeRouters = require('./routes/braintree');
//orderRouters
const orderRouters = require('./routes/order');
//app
const app = express();
//db
mongoose.connect('mongodb+srv://duytruong:tatcadahet169@cluster0-kzgfb.mongodb.net/ecommerce?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(()=> console.log("Database connected"));
//middlewares
app.use(morgan('dev')); 
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
//userRoute middleware
app.use('/api',authRouters);
app.use('/api',userRouters);
app.use('/api',categoryRouters);
app.use('/api',productRouters);
app.use('/api',braintreeRouters);
app.use('/api',orderRouters);

const port = process.env.PORT||8000;

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})