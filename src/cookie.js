/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

function cookieParser() {
    if (!document.cookie) {

        return {};
    }

    return document.cookie.split('; ').reduce((prev, current) => {
        let [name, value] = current.split('=');

        prev[name] = value;

        return prev;
    }, {})
}

function setCookie(name, value, options = {}) {
    //Expires in days
    if (typeof options.expires == 'number' && options.expires) {
        let d = new Date();
        d.setTime(d.getTime() + options.expires * 24 * 60 * 60 * 1000);
        options.expires = d.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + "=" + value;

    for (let prop in options) {
        updatedCookie += "; " + prop;

        let propValue = options[prop];

        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, '', {expires: -1});
}

function updateTable(cookies) {
    let html = '';
    cookies = cookies || cookieParser();

    Object.keys(cookies).forEach(k => {
        html += '<tr>';
        html += '<td class="cookie-name">' + k + '</td>';
        html += '<td>' + cookies[k] + '</td>';
        html += '<td><button data-cookie="' + k + '" class="del-button">УДАЛИТЬ</button></td>';
        html += '</tr>';
    });

    listTable.innerHTML = html;
}

function filter(full, chunk) {
    return (full.toLowerCase().indexOf(chunk.toLocaleLowerCase()) + 1) ? true : false;
}

function findCookieByName(name){
    let cookies = cookieParser();

    for (let key in cookies) {
        if(key === name){
            return true;
        }
    }

    return false;
}

function filterCookie(value, flag = true) {
    let cookies = cookieParser();
    let result = {};

    for (let key in cookies) {
        if (flag ? filter(key, value) || filter(cookies[key], value) : filter(cookies[key], value)) {
            result[key] = cookies[key];
        }
    }

    updateTable(result);
}

filterNameInput.addEventListener('keyup', function () {
    if (this.value) {
        filterCookie(this.value);
    } else {
        updateTable();
    }
});

addButton.addEventListener('click', () => {
    if (addNameInput.value && addValueInput.value) {

        setCookie(addNameInput.value, addValueInput.value, {expires: 1});

        if (filterNameInput.value) {
            if(findCookieByName(addNameInput.value)){
                filterCookie(filterNameInput.value, false);
            }else{
                filterCookie(filterNameInput.value);
            }
        } else {
            updateTable();
        }

        addNameInput.value = '';
        addValueInput.value = '';
    }
});

listTable.addEventListener('click', e => {
    if (e.target.classList.contains('del-button')) {
        let cookieName = e.target.dataset.cookie;

        deleteCookie(cookieName);
        updateTable();
    }
});

updateTable();