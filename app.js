const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// const webpack = require('webpack');
// const webpackDevMiddleware = require('webpack-dev-middleware');
// const webpackHotMiddleware = require('webpack-hot-middleware');
// const webpackConfig = require('./webpack.config');
//
//
//
// const devServerEnabled = true;
//
// if (devServerEnabled) {
//     //reload=true:Enable auto reloading when changing JS files or content
//     //timeout=1000:Time from disconnecting from server to reconnecting
//     webpackConfig.entry.main.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');
//
//     //Add HMR plugin
//     webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
//
//     const compiler = webpack(webpackConfig);
//
//     //Enable "webpack-dev-middleware"
//     app.use(webpackDevMiddleware(compiler, {
//         publicPath: webpackConfig.output.publicPath
//     }));
//
//     //Enable "webpack-hot-middleware"
//     app.use(webpackHotMiddleware(compiler));
// }


// You probably have other paths here
// app.use(express.static(path.join(__dirname, 'dist')));


const PORT = process.env.PORT || 3200;

server.listen(PORT);


let numUsers = 0;
let id = 0;//from db
let defaultImage = 'assets/default-image.png';
// const users = {};
let currentUser;

//For dev
const users = {
    0: {
        id: 0,
        name: 'Name',
        nick: 'Nick',
        image: 'assets/chat-list-user-1.jpg',
        status: true,
        lastMessageId: 0
    },
    1: {
        id: 1,
        name: 'Name2',
        nick: 'Nick2',
        image: 'assets/chat-user-2.jpg',
        status: true,
        lastMessageId: 1
    }
};


//dev
id = Object.keys(users).length;


const messages = [
    {
        id: 0,
        userId: 0,
        text: 'Hello!!!',
        date: '17:56'
    },
    {
        id: 1,
        userId: 1,
        text: 'Hello2!!!',
        date: '17:30'
    }
];


const getLastUserMessage = id => {
    let result = '...';

    for (let el of messages) {
        if (el.id === id) {
            result = el.text;
            break;
        }
    }

    return result;
};

const onlineUsers = () => {
    let onlineUsers = [];

    for (let i in users) {
        if (users[i].status) {
            users[i].lastMessage = getLastUserMessage(users[i].lastMessageId);
            onlineUsers.push(users[i]);
        }
    }

    return onlineUsers;
};

const getUserByNick = nick => {
    for (let key in users) {
        if (users[key].nick === nick) {
            return users[key];
        }
    }

    return false;
};


io.on('connection', (socket) => {
    console.log('connect--------------');

    let addedUser = false;

    //Login user
    socket.on('add user', ({name, nick}) => {
        //check in db by userNick before add
        if (addedUser) return;

        currentUser = getUserByNick(nick);

        // Store the id in the socket session for this client
        socket.userId = id;

        //User data
        if (!currentUser) {
            currentUser = {
                id,
                name,
                nick,
                image: defaultImage,
                status: true,
                lastMessage: '...',
            };

            users[id] = currentUser;
            ++id;
        } else {
            currentUser.status = true;
            currentUser.lastMessage = getLastUserMessage(currentUser.lastMessageId);
            socket.userId = currentUser.id;

            socket.emit('renderChat', {users, messages});
        }

        socket.emit('login', currentUser);
        socket.emit('createUserList', onlineUsers());
        socket.broadcast.emit('user joined', currentUser);

        ++numUsers;
        addedUser = true;

        //Update numUsers
        socket.emit('updateUsersNum', numUsers);
        socket.broadcast.emit('updateUsersNum', numUsers);
    });

    //New message
    socket.on('message', data => {
        //Save message to obj
        let message = {
            id: Date.now(),
            userId: socket.userId,
            text: data.text,
            date: data.date
        };

        messages.push(message);

        //Update last user message
        users[socket.userId].lastMessageId = message.id;
        socket.emit('updateLastUserMessage', {id: socket.userId, message: message.text});
        socket.broadcast.emit('updateLastUserMessage', {id: socket.userId, message: message.text});

        //Send message to users
        socket.broadcast.emit('message', {
            user: users[socket.userId],
            message: data
        });
    });

    //Disconnect
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            users[socket.userId].status = false;

            socket.broadcast.emit('user left', {
                id: socket.userId,
                numUsers: numUsers
            });
        }
    });

});





