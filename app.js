const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);


webpackConfig.entry.main.unshift('webpack-hot-middleware/client?reload=true&timeout=20000');

// Create the app, setup the webpack middleware
// app.use(require('webpack-dev-middleware')(compiler, {
//     noInfo: true,
//     publicPath: webpackConfig.output.publicPath,
// }));

app.use(require('webpack-dev-middleware')(compiler));

app.use(require('webpack-hot-middleware')(compiler));

// You probably have other paths here
app.use(express.static(path.join(__dirname, 'dist')));

// const server = new http.Server(app);
// const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT);






io.on('connection', (socket) => {
    console.log('connect--------------');

    // <insert relevant code here>
    // socket.emit('login', playerbatch);

    socket.emit('login', {
        numUsers: 1
    });

});





