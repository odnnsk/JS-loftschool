import './style/app.scss';
import './img/default-image.png';
import './img/chat-list-user-1.jpg';
import './img/chat-user-2.jpg';
import io from 'socket.io-client';


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

//For auth
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


/*
* Photo
* */
let addPhotoModal = document.querySelector('.photo');
let photoModalBtn = document.querySelector('.chat-menu');
let dropArea = document.getElementById("drop-area");
let closePhotoBtn = document.querySelector('.btn--close-photo');
let addPhotoBtn = document.querySelector('.btn--add-photo');
const theImage = document.querySelector('#gallery');
const photoInput = document.querySelector('#fileElem');
const fileReader = new FileReader();

photoModalBtn.addEventListener('click', () => {
    addPhotoModal.style.display = 'block';
});

closePhotoBtn.addEventListener('click', () => {
    addPhotoModal.style.display = 'none';
});

addPhotoBtn.addEventListener('click', () => {
    uploadFile(fileReader.result);
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
    document.body.addEventListener(eventName, preventDefaults, false)
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const [file] = e.dataTransfer.files;

    if (file) {
        if (file.size > 300 * 1024){
            alert('Файл не должен превышать 300кб!');
        }else if(file.type !== 'image/jpeg'){
            alert('Только jpeg!');
        } else{
            fileReader.fileName = file.name;
            fileReader.readAsDataURL(file);
        }
    }
}

fileReader.addEventListener('load', () => {
    let img = document.createElement('img');
    img.src = fileReader.result;
    document.getElementById('gallery').appendChild(img);
});

async function uploadFile(file) {
    let url = 'http://localhost:3200/';
    let formData = new FormData();
    formData.append('userId', userData.id);
    formData.append('photoName', fileReader.fileName);
    formData.append('photo', file);

    let response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        let data = await response.json();

        //Update userData
        userData.image = data.image;

        addPhotoModal.style.display = 'none';

        socket.emit('updateUserImage', {id: userData.id, image: data.image});
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
}

function addUserToList(data) {
    //if user exist
    if (usersList.querySelector('.chat-users__el[data-id="' + data.id + '"]')) {
        return;
    }

    let div = document.createElement('div');

    div.classList.add('chat-users__el');
    div.dataset.id = data.id;

    div.innerHTML = `<div class="chat-users__img" style="background-image: url(${data.image});">
<!--    <img src="${data.image}" alt="">-->
    </div>
    <div class="chat-users__info">
    <div class="chat-users__name">${data.name}</div>
    <div class="chat-users__msg">${data.lastMessage}</div></div></div>`;

    usersList.appendChild(div);
}

function deleteUserFromList(id) {
    usersList.querySelector('[data-id="' + id + '"]').remove();
}

function sendMessage(user, message) {
    let container;
    let messageHtml;
    let lastMessage = chatMessageList.lastElementChild;

    if (lastMessage && user.id.toString() === lastMessage.dataset.id) {
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

    div.innerHTML = `<div class="chat-list__user" style="background-image: url(${user.image});">
<!--    <img src="${user.image}" alt="">-->
    </div>
    <ul class="chat-list-message">
        ${innerMessage.outerHTML}
    </ul>`;

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
    let html = [];
    let fragment = document.createDocumentFragment();
    let tempFragment = document.createDocumentFragment();
    let {users, messages} = data;

    messages.forEach((el, index) => {
        tempFragment.appendChild(createMessage(users[el.userId], el));

        if (!messages[index + 1] || el.userId !== messages[index + 1].userId) {
            let div = document.createElement('div');
            let divUser = document.createElement('div');
            let ul = document.createElement('ul');

            div.classList.add('chat-list__el');
            div.dataset.id = el.userId;
            divUser.classList.add('chat-list__user');
            ul.classList.add('chat-list-message');

            // divUser.innerHTML = '<img src="' + users[el.userId].image + '" alt="">';
            divUser.style.backgroundImage = `url(${users[el.userId].image})`;

            ul.appendChild(tempFragment);
            div.appendChild(divUser);
            div.appendChild(ul);

            fragment.appendChild(div);
            tempFragment = document.createDocumentFragment();
        }
    });

    chatMessageList.appendChild(fragment);

    // Scroll message container
    chatMessageList.scrollTop = chatMessageList.scrollHeight;
}

function updateUserImage(data){
    let chatListImg = document.querySelector('.chat-users__el[data-id="' + data.id + '"] .chat-users__img');
    let chatImg = document.querySelectorAll('.chat-list__el[data-id="' + data.id + '"] .chat-list__user');

    chatListImg.style.backgroundImage = `url(${data.image})`;

    chatImg.forEach(el => {
       el.style.backgroundImage = `url(${data.image})`;
    });
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

socket.on('updateUserImage', data => {
    updateUserImage(data);
});





