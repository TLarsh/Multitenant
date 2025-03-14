const express = require('express');
const dbConnect = require('./config/dbConnect');
const authRouter = require('./routes/authRoute');
const adminRouter = require('./routes/adminRouter');
const companyRouter = require('./routes/companyRoute');
const interpreterRouter = require('./routes/interpreterRoute');
const clientRouter = require('./routes/clientRoute');
const messageRouter = require('./routes/messageRoute');
const summaryRouter = require('./routes/summaryRouter');
const appointmentRouter = require('./routes/appointmentRoute');
const cors = require("cors");
// const logRouter = require('./routes/logRoute');
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dotenv = require('dotenv').config();
PORT = process.env.PORT || 4000
const morgan = require('morgan');

dbConnect();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", (messageData) => {
        io.emit("receiveMessage", messageData); // Broadcast message to all users
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});


// app.use (express.json());
// app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cors());
app.use (bodyParser.json());
app.use(cookieParser());
app.use (bodyParser.urlencoded({extended:false}));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")))


app.use('/api/user', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/company', companyRouter);
app.use('/api/interpreter', interpreterRouter);
app.use('/api/client', clientRouter); 
app.use('/api/message', messageRouter); 
app.use('/api/appointment-summary', summaryRouter);
app.use('/api/user-appointment', appointmentRouter);
// app.use('/api/log', logRouter);
// app.use("/", (req, res)=>{
//     res.send('hello at server')
// });

// error handlers
app.use(notFound);
app.use(errorHandler)




app.listen(PORT, ()=> {
    console.log(`Server running on http://localhost:${PORT}`);
});

