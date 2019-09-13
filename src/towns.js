/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns-content.hbs

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
let citiesArray = [];
let loadBtn = document.createElement('button');

loadBtn.innerHTML = 'Повторить';
loadBtn.style.display = 'none';
homeworkContainer.appendChild(loadBtn);

loadBtn.addEventListener('click', function () {
    this.style.display = 'none';
    loadingBlock.innerText = 'Загрузка...';
    initTowns();
});

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns() {
    let url = 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json';

    return fetch(url)
        .then(response => response.json())
        .then(cities => {
            // return cities.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

            return cities.sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                }

                if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });
        })
}

function initTowns() {
    loadTowns().then(cities => {
        citiesArray = cities;

        loadingBlock.style.display = 'none';
        filterBlock.style.display = 'block';
    }).catch(() => {
        loadingBlock.innerText = 'Не удалось загрузить города';
        loadBtn.style.display = 'block';
    });
}

initTowns();

function resultHtml(cities) {
    let html = '';

    cities.forEach(el => {
        html += el.name + '<br>';
    });

    return html;
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
    return (full.toLowerCase().indexOf(chunk.toLocaleLowerCase()) + 1) ? true : false;
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

filterInput.addEventListener('keyup', function () {
    let result = [];

    if (this.value) {
        result = citiesArray.filter(city => {
            return isMatching(city.name, this.value);
        });
    }

    filterResult.innerHTML = resultHtml(result);
});

export {
    loadTowns,
    isMatching
};
