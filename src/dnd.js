/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 Функция НЕ должна добавлять элемент на страницу. На страницу элемент добавляется отдельно

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
 */
function createDiv() {
    let div = document.createElement('div');
    let options = {
        position: 'absolute',
        width: randomInt(10, 300) + 'px',
        height: randomInt(10, 300) + 'px',
        top: '',
        left: '',
        backgroundColor: getRandomColor(),
        cursor: 'move'
    };

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function getRandomColor() {
        let color = '#';

        for (let i = 0; i < 3; i++) {
            color += Math.floor(Math.random() * 256).toString(16);
        }

        return color;
    }

    options.top = randomInt(50, (document.documentElement.clientHeight - parseInt(options.height, 10))) + 'px';
    options.left = randomInt(10, (document.documentElement.clientWidth - parseInt(options.width, 10))) + 'px';

    div.classList.add('draggable-div');

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            div.style[key] = options[key];
        }
    }

    return div;
}

/*
 Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
   addListeners(newDiv);
 */
let initDrag = false;
let isActive = false;
let targetBox, offsetX, offsetY;

function addListeners(target) {
    // target.addEventListener('mousedown', e => {
    //     isActive = true;
    //     offsetX = e.offsetX;
    //     offsetY = e.offsetY;
    // });
    //
    // target.addEventListener('mouseup', e => {
    //     isActive = false;
    // });
    //
    // target.addEventListener('mousemove', e => {
    //     if (isActive){
    //         target.style.top = (e.clientY - offsetY) + 'px';
    //         target.style.left = (e.clientX - offsetX) + 'px';
    //     }
    //
    // });

    homeworkContainer.addEventListener('mousedown', e => {
        if (e.target.classList.contains('draggable-div')) {
            targetBox = e.target;
            targetBox.remove();
            homeworkContainer.appendChild(targetBox);
            isActive = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
        }
    });

    homeworkContainer.addEventListener('mouseup', () => {
        isActive = false;
        targetBox = null;
    });

    homeworkContainer.addEventListener('mousemove', e => {
        if (isActive && targetBox) {
            targetBox.style.top = (e.clientY - offsetY) + 'px';
            targetBox.style.left = (e.clientX - offsetX) + 'px';
        }
    });
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
    // создать новый div
    const div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации D&D

    if (!initDrag) {
        initDrag = true;
        addListeners(div);
    }
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};
