/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn, thisArg) {
    if (array.constructor !== Array) {
        throw new TypeError(array + ' is not an Array');
    }

    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function');
    }

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] === 'undefined') {
            continue;
        }
        fn.call(thisArg, array[i], i, array);
    }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn, thisArg) {
    let result = [];

    if (array.constructor !== Array) {
        throw new TypeError(array + ' is not an Array');
    }

    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function');
    }

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] === 'undefined') {
            continue;
        }
        result[result.length] = fn.call(thisArg, array[i], i, array);
    }

    return result;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
    let result = initial || array[0];
    let index = 0;

    if (!initial) {
        index = 1;
    }

    if (array.constructor !== Array) {
        throw new TypeError(array + ' is not an Array');
    }

    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function');
    }

    for (let i = index; i < array.length; i++) {
        if (typeof array[i] === 'undefined') {
            continue;
        }
        result = fn(result, array[i], i, array);
    }

    return result;
}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
    return Object.keys(obj).map(prop => prop.toUpperCase());
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
function slice(array, from, to) {
    let result = [];
    let begin, end;

    if (array.constructor !== Array) {
        throw new TypeError(array + ' is not an Array');
    }

    begin = from || 0;
    end = to || array.length;

    if (from < 0) {
        begin = array.length + from;
    }

    if (to < 0) {
        end = array.length + to;
    }

    if (to === 0) {
        end = 0;
    }

    if (begin < 0) {
        begin = 0;
    }

    if (end > array.length) {
        end = array.length;
    }

    for (let i = begin; i < end; i++) {
        result[result.length] = array[i];
    }

    return result;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    return new Proxy(obj, {
        set(target, prop, val) {
            if (typeof val !== 'number') {
                return false;
            }
            target[prop] = val ** 2;

            return true;
        }
    });
}

export {
    forEach,
    map,
    reduce,
    upperProps,
    slice,
    createProxy
};
