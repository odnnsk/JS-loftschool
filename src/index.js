import './style/app.scss';
import './img/default-image.png';
import io from 'socket.io-client';



let userName;
let lastMessage;
let lastMessageTime;
let connected = false;

let lastMessageUserId;
let numUsers = 2;//from backend


// let currentUserId = '';

const socket = io();

let usersList = document.querySelector('.chat-users');
let sendMessageForm = document.querySelector('.send-message-form');
let messageInput = document.querySelector('.chat-message__text');
let chatMessageList = document.querySelector('.chat-list');
let chatNumUsers = document.querySelector('.chat-header__users');







//Dev Data
//login
// id,
// name,
// nick,
// image (path),
// numUsers,

    //user joined (for all users)
    // id,
    // name,
    // nick,
    // image (path),
    // numUsers,

const userData = {
    id: 0,
    name: 'Игорь Яицкий',
    nick: 'Nick',
    image: 'assets/default-image.png',
    lastMessage: 'Рад был пообщаться!',
    numUsers: 2
};




if(localStorage.id){
    //Send id. Get data
    //Hide auth
    //Show chat
}else {
    //Auth
    //Get data
    //Hide auth
    //Show chat
}


//Fires on
function login(data){
    //Update user list
    addUserToList(data);

    // currentUserId = data.id;
    ++userData.numUsers;

    updateNumUser(userData.numUsers);
}

login(userData);
// deleteUserFromList(0);

function addUserToList(data){
    let div = document.createElement('div');

    div.classList.add('chat-users__el');
    div.dataset.id = data.id;

    div.innerHTML = `<div class="chat-users__img"><img src="${ data.image }" alt=""></div><div class="chat-users__info"><div class="chat-users__name">${ data.name }</div><div class="chat-users__msg">${ data.lastMessage }</div></div></div>`;

    usersList.appendChild(div);
}

function deleteUserFromList(id){
    usersList.querySelector('[data-id="'+ id +'"]').remove();
}

function sendMessage(message){
    let container;
    let messageHtml;
    let lastMessage = chatMessageList.lastElementChild;

    if (userData.id.toString() === lastMessage.dataset.id){
        container = lastMessage.querySelector('.chat-list-message');
        messageHtml = createMessage(message);
    } else{
        container = chatMessageList;
        messageHtml = createMessageEl(message);
    }

    container.appendChild(messageHtml);

    // Scroll message container
    chatMessageList.scrollTop = chatMessageList.scrollHeight;
}

function createMessageEl(message){
    let html = '';
    let div = document.createElement('div');
    let innerMessage = createMessage(message);

    div.classList.add('chat-list__el');
    div.dataset.id = userData.id;

    div.innerHTML = '<div class="chat-list__user">' +
        '<img src="' + userData.image + '" alt="">' +
        '</div>' +
        '<ul class="chat-list-message">' +
        innerMessage.outerHTML +
        '</ul>';

    return div;
}

function createMessage(message) {
    let li = document.createElement('li');

    li.classList.add('chat-list-message__el');
    li.dataset.id = userData.id;
    li.innerHTML = '<div class="chat-list-message__text">' + message + '</div>' +
        '<div class="chat-list-message__date">' + getTime() + '</div>';

    return li;
}

function getTime() {
    let d = new Date();
    let h = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
    let m = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
    
    return `${ h }:${ m }`
}

function updateNumUser(num){
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









function checkLogedInUser(){

}


function updateUsersList(){

}


function checkLastUserMessage(){

}


function addMessageEl(){

}


/*
* Events
* */
sendMessageForm.addEventListener('submit', e => {
   e.preventDefault();

   if(messageInput.value){
       sendMessage(messageInput.value);
       messageInput.value = '';
   }
});

console.log(23);



alert(111);


/*
* Socket Events
* */
socket.on('login', (data) => {
    console.log(data);
    
    console.log('123!!');

});