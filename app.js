const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// Static
app.use(express.static(path.join(__dirname, 'dist')));


// Routes
app.use('/', require('./routes/index'));


// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err)
});

// error handler
app.use((err, req, res, next) => {
    // render the error page
    res.status(err.status || 500);
    // res.render('error', { message: err.message, error: err })
    res.send(`${err.status} ${err.message}`)
});


server.listen(process.env.PORT || 3200, function () {
    console.log('Сервер запущен на порте: ' + server.address().port);
});



let numUsers = 0;
let id = 0;//from db
let defaultImage = 'assets/default-image.png';
// const users = {};
// const messages = {};
let currentUser;

//For dev
const users = {
    0: {
        id: 0,
        name: 'Name',
        nick: 'Nick',
        image: 'assets/chat-list-user-1.jpg',
        status: false,
        lastMessageId: 0
    },
    1: {
        id: 1,
        name: 'Name2',
        nick: 'Nick2',
        image: 'assets/chat-user-2.jpg',
        status: false,
        lastMessageId: 1
    }
};

const messages = [
    {
        id: 0,
        userId: 0,
        text: 'Hello!!!',
        date: '17:56'
    },
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

//dev
id = Object.keys(users).length;


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

//Update user data in db
const updateUserData = (id, data) => {
    console.log(id);
    console.log(data);
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

    //Update user image
    socket.on('updateUserImage', data => {
        //Save data
        users[socket.userId].image = data.image;

        socket.emit('updateUserImage', data);
        socket.broadcast.emit('updateUserImage', data);
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





