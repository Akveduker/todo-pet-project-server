const express = require("express");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const taskGroupRoutes = require('./routes/taskGroup');
const taskRoutes = require('./routes/task');
const mongoose = require("mongoose");
const cors = require('cors')
require('dotenv').config();

const app = express();
const dbKey = process.env.DB_KEY;
const port = process.env.PORT || 8000;

(async () => {
    try {
        mongoose.connect(dbKey)
        app.use(cors())
        app.use('/api', authRoutes)
        app.use('/api', userRoutes)
        app.use('/api/group', groupRoutes)
        app.use('/api/taskGroup', taskGroupRoutes)
        app.use('/api/task', taskRoutes)
        app.listen(port);
        console.log("Сервер запущен");
    } catch (err) {
        return console.log(err);
    }
})();


process.on("SIGINT", async () => {
    console.log("Приложение завершило работу");
    process.exit();
});
