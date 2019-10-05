import './style/app.scss';
import './img/default-image.png';
import io from 'socket.io-client';


let connected = false;

const socket = io.connect('http://localhost:3200/');

let userData = {};
let messageData = {};

let usersList = document.querySelector('.chat-users');
let sendMessageForm = document.querySelector('.send-message-form');
let messageInput = document.querySelector('.chat-message__text');
let chatMessageList = document.querySelector('.chat-list');
let chatNumUsers = document.querySelector('.chat-header__users');


/*
* Auth form
* */
const auth = document.querySelector('.auth');
const authBtn = document.querySelector('.btn--auth');
const authForm = document.querySelector('.auth-form');

authBtn.addEventListener('click', e => {
    e.preventDefault();
    let name;
    let nick;
    let errors = validateForm(authForm);

    if (!errors.length) {
        auth.style.display = 'none';

        name = document.querySelector('.auth-form__input[name="name"]').value;
        nick = document.querySelector('.auth-form__input[name="nickname"]').value;

        socket.emit('add user', {name, nick});
    }
});


if (localStorage.id) {
    //Send id. Get data
    //Hide auth
    //Show chat
} else {
    //Auth
    //Get data
    //Hide auth
    //Show chat
}


function addUserToList(data) {
    //if user exist
    if (usersList.querySelector('.chat-users__el[data-id="' + data.id + '"]')) {
        return;
    }

    let div = document.createElement('div');

    div.classList.add('chat-users__el');
    div.dataset.id = data.id;

    div.innerHTML = `<div class="chat-users__img"><img src="${data.image}" alt=""></div><div class="chat-users__info"><div class="chat-users__name">${data.name}</div><div class="chat-users__msg">${data.lastMessage}</div></div></div>`;

    usersList.appendChild(div);
}

function deleteUserFromList(id) {
    usersList.querySelector('[data-id="' + id + '"]').remove();
}

function sendMessage(user, message) {
    let container;
    let messageHtml;
    let lastMessage = chatMessageList.lastElementChild;

    if (user.id.toString() === lastMessage.dataset.id) {
        container = lastMessage.querySelector('.chat-list-message');
        messageHtml = createMessage(user, message);
    } else {
        container = chatMessageList;
        messageHtml = createMessageEl(user, message);
    }

    container.appendChild(messageHtml);

    // Scroll message container
    chatMessageList.scrollTop = chatMessageList.scrollHeight;
}

function createMessageEl(user, message) {
    let html = '';
    let div = document.createElement('div');
    let innerMessage = createMessage(user, message);

    div.classList.add('chat-list__el');
    div.dataset.id = user.id;

    div.innerHTML = '<div class="chat-list__user">' +
        '<img src="' + user.image + '" alt="">' +
        '</div>' +
        '<ul class="chat-list-message">' +
        innerMessage.outerHTML +
        '</ul>';

    return div;
}

function createMessage(user, message) {
    let li = document.createElement('li');

    li.classList.add('chat-list-message__el');
    li.dataset.id = user.id;
    li.innerHTML = '<div class="chat-list-message__text">' + message.text + '</div>' +
        '<div class="chat-list-message__date">' + message.date + '</div>';

    return li;
}

function getTime() {
    let d = new Date();
    let h = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
    let m = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();

    return `${h}:${m}`
}

function updateNumUser(num) {
    chatNumUsers.innerHTML = num2str(num);
}

function num2str(n) {
    n = Math.abs(n) % 100;
    let n1 = n % 10;
    let cases = ['участник', 'участника', 'участников'];

    if (n > 10 && n < 20) {
        return n + ' ' + cases[2];
    }

    if (n1 > 1 && n1 < 5) {
        return n + ' ' + cases[1];
    }

    if (n1 === 1) {
        return n + ' ' + cases[0];
    }

    return n + ' ' + cases[2];
}

function validateForm(form) {
    let elements = form.elements;
    let error = [];

    [...elements]
        .filter(el => el.tagName !== 'BUTTON')
        .forEach(el => {
            if (el.value.length < 1) {
                el.classList.add('error');
                error.push('не указано ' + el.name);
            } else {
                el.classList.remove('error');
            }
        });

    return error;
}

function updateLastUserMessage(id, message) {
    let user = document.querySelector('.chat-users__el[data-id="' + id + '"] .chat-users__msg');

    user.innerText = message;
}

function renderChat(data) {
    let html = '';
    let { users, messages } = data;

    console.log(users);
    console.log(messages);

    messages.forEach(el => {
        // html += createMessageEl(users[el.userId], el);
        chatMessageList.appendChild(createMessageEl(users[el.userId], el))
    });

    // console.log(html);
    // chatMessageList.innerHTML = html;
}


function checkLogedInUser() {

}


function updateUsersList() {

}


function checkLastUserMessage() {

}


function addMessageEl() {

}


/*
* Events
* */
sendMessageForm.addEventListener('submit', e => {
    e.preventDefault();

    if (messageInput.value) {
        messageData.text = messageInput.value;
        messageData.date = getTime();

        sendMessage(userData, messageData);
        socket.emit('message', messageData);
        messageInput.value = '';
    }
});


/*
* Socket Events
* */
socket.on('login', user => {
    userData = user;
});

socket.on('createUserList', users => {
    users.forEach(user => {
        addUserToList(user);
    });
});

socket.on('user joined', data => {
    addUserToList(data);
});

socket.on('user left', data => {
    deleteUserFromList(data.id);
    updateNumUser(data.numUsers);
});

socket.on('updateUsersNum', num => {
    updateNumUser(num);
});

socket.on('message', data => {
    sendMessage(data.user, data.message);
});

socket.on('updateLastUserMessage', data => {
    updateLastUserMessage(data.id, data.message);
});


socket.on('renderChat', data => {
    renderChat(data);
});


