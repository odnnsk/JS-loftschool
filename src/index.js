/* ДЗ 6 - Асинхронность и работа с сетью */

/*
 Задание 1:

 Функция должна возвращать Promise, который должен быть разрешен через указанное количество секунду

 Пример:
   delayPromise(3) // вернет promise, который будет разрешен через 3 секунды
 */
function delayPromise(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/*
 Задание 2:

 2.1: Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов можно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json

 2.2: Элементы полученного массива должны быть отсортированы по имени города

 Пример:
   loadAndSortTowns().then(towns => console.log(towns)) // должна вывести в консоль отсортированный массив городов
 */
function loadAndSortTowns() {
    return new Promise((resolve, reject) => {
        let url = ' https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json';
        let cities = [];

        let xhr = new XMLHttpRequest();

        xhr.open('GET', url);
        xhr.responseType = 'json';

        xhr.addEventListener('load', () => {
            cities = xhr.response.sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                }

                if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });

            resolve(cities);
        });

        xhr.addEventListener('error', reject);
        xhr.addEventListener('abort', reject);

        xhr.send();
    })
}

export {
    delayPromise,
    loadAndSortTowns
};
