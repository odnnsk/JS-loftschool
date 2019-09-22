// import './style/app.scss';
import './img/marker.png';
import './img/marker-active.png';
import './img/geo.png';
import './img/close.png';

/*
* Ya map init
* */
ymaps.ready(init);

function init() {
    let myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    });

    let objectManager = new ymaps.ObjectManager({
        clusterize: true,
        gridSize: 32,
        clusterDisableClickZoom: true
    });



    /*
    * Create Balloon template
    * */
    let BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="popup">' +
        '<div class="popup__wrap">' +
        '<div class="popup-header">' +
        '<div class="popup-address">' +
        '<div class="popup-address__icon">' +
        '<img src="/assets/geo.png" alt="">' +
        '</div>' +
        // '<div class="popup-address__text">Поиск...</div>' +
        '<div class="popup-address__text">{% if properties.address %}{{ properties.address }}{% else %}{{ address }}{% endif %}</div>' +
        '</div>' +
        '<div class="popup-header__close">' +
        '<img src="/assets/close.png" alt="">' +
        '</div>' +
        '</div>' +
        '<div class="popup-comment-list">' +
        '<ul class="popup-comment-list__wrap">' +
        '{% if properties.name %}' +
        '<li class="popup-comment-list__el">' +
        '<div class="popup-comment-list__header">' +
        '<div class="popup-comment-list__name">{{ properties.name }}</div>' +
        '<div class="popup-comment-list__place">{{ properties.place }}</div>' +
        '<div class="popup-comment-list__date">{{ properties.date }}</div>' +
        '</div>' +
        '<div class="popup-comment-list__desc">{{ properties.comment }}</div>' +
        '</li>' +
        '{% else %}' +
        '<li class="popup-comment-list__el popup-comment-list__el--empty">Отзывов пока нет...</li>' +
        '{% endif %}' +
        '</ul>' +
        '<hr>' +
        '</div>' +
        '<div class="popup-comment-form">' +
        '<h2 class="popup-comment-form__title">Ваш отзыв</h2>' +
        '<form class="comment-form" action="">' +
        '<input type="text" class="comment-form__input" name="name" placeholder="Ваше имя">' +
        '<input type="text" class="comment-form__input" name="place" placeholder="Укажите место">' +
        '<textarea name="comment" class="comment-form_text" cols="20" rows="5" placeholder="Поделитесь впечатлениями"></textarea>' +
        '<div class="btn btn--comment-form">Добавить</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>',
        {
            build: function () {
                BalloonContentLayout.superclass.build.call(this);

                this.btn = document.querySelector('.btn--comment-form');
                this.closeBtn = document.querySelector('.popup-header__close');

                this.btn.addEventListener('click', this.onBtnClick);
                this.closeBtn.addEventListener('click', this.onCloseClick);
            },
            clear: function () {
                this.closeBtn.removeEventListener('click', this.onCloseClick);
                this.btn.removeEventListener('click', this.onBtnClick);
                BalloonContentLayout.superclass.clear.call(this);
            },
            onBtnClick: function () {
                let form = document.querySelector('.comment-form');
                let errors = validateForm(form);
                let commentList = document.querySelector('.popup-comment-list__wrap');
                let comment;
                let address = document.querySelector('.popup-address__text').innerText;
                let date = formatDate(new Date());

                if (!errors.length) {
                    if (commentList.children.length === 1 && commentList.firstElementChild.classList.contains('popup-comment-list__el--empty')){
                        commentList.firstElementChild.remove();
                    }

                    comment = buildCommentHtml(form.elements.name.value, form.elements.place.value, form.elements.comment.value, date);
                    commentList.prepend(comment);

                    //Add point to objectManager
                    objectManager.add({
                        type: 'Feature',
                        id: markerId++,
                        geometry: {
                            type: 'Point',
                            coordinates: commentFormCoords
                        },
                        properties: {
                            // balloonContent: 'Содержание балуна'
                            name: form.elements.name.value,
                            place: form.elements.place.value,
                            comment: form.elements.comment.value,
                            date,
                            address
                        }
                    });

                    // console.log(objectManager.objects.getAll());

                    myMap.geoObjects.add(objectManager);

                    //Clear inputs
                    form.elements.name.value = '';
                    form.elements.place.value = '';
                    form.elements.comment.value = '';
                }
            },
            onCloseClick: function () {
                myMap.balloon.close();
            }
        }
    );


    /*
    * Create cluster template
    * */
    let ClusterItemContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class="cluster-header">{{ properties.place }}</h2>' +
        '<a data-coords="{{ properties.coords }}" class="cluster-address" href="#">{{ properties.address }}</a>' +
        '<div class="cluster-comment">{{ properties.comment }}</div>' +
        '<div class="cluster-date">{{ properties.date }}</div>',
        {
            build: function () {
                ClusterItemContentLayout.superclass.build.call(this);
                
                this.addressLink = document.querySelector('.cluster-address');
                this.addressLink.addEventListener('click', this.onAddrLinkClick);
            },
            clear: function () {
                this.addressLink.removeEventListener('click', this.onAddrLinkClick);
                ClusterItemContentLayout.superclass.clear.call(this);
            },
            onAddrLinkClick: e => {
                e.preventDefault();

                let coords = e.target.dataset.coords.split(',');
                let circle = new ymaps.Circle([coords, 0.5]);
                let queryObjects;
                let result;

                //Find markers by coords
                myMap.geoObjects.add(circle);

                queryObjects = objectManager.objects.getAll().map(el => el.geometry);

                result = ymaps.geoQuery(queryObjects).searchInside(circle).each(el => {
                    // console.log(el.properties.get('name'));
                    // console.log(el.get('objectId'));
                    
                    console.log(el);
                });


                // result = objectManager.objects.getAll().filter(el => {
                //     console.log(el.geometry.coordinates);
                //     // console.log(el.geometry.getCoordinates());
                //     return circle.contains(el.geometry.coordinates);
                // });


                // console.log(objectManager.objects.getAll());
                // console.log(result.get(0).properties);
                myMap.geoObjects.remove(circle);

                console.log(objectManager.objects.getAll());

                
                // circle.contains(myObjects[i].geometry.getCoordinates());
                
                console.log(result);

                

                //Close balloon
                myMap.balloon.close();

                console.log(coords);
                console.log(e.target);
            }
        }
    );


    let data = [
        {
            id: 0,
            coords: [55.67, 37.65],
            name: 'Ivan',
            place: 'Шоколадница',
            comment: 'Все круто!!!!',
            date: '12.12.2019',
            address: 'Новосибирск, Ипподромская, 46'
        },
        {
            id: 1,
            coords: [55.67, 37.65],
            name: 'Pavel',
            place: 'Шоколадница2',
            comment: 'Все круто2!!!!',
            date: '12.12.2019',
            address: 'Новосибирск, Ипподромская, 462'
        },
        {
            id: 2,
            coords: [55.63, 38.79],
            name: 'Pavel2',
            place: 'Шоколадница3',
            comment: 'Все круто3!!!!',
            date: '12.12.2019',
            address: 'Новосибирск, Ипподромская, 4623'
        },
    ];
    let commentFormCoords;
    let markerId = data.length || 0;


    /*
    * Set marker options
    * */
    objectManager.objects.options.set({
        preset: 'islands#violetIcon',
        balloonLayout: BalloonContentLayout,
        clusterBalloonContentLayout: 'cluster#balloonCarousel'
    });


    /*
    * Set cluster options
    * */
    objectManager.clusters.options.set('preset', 'islands#invertedVioletClusterIcons');
    objectManager.options.set({
        clusterPreset: 'islands#violetCircleIcon',
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: ClusterItemContentLayout
    });


    /*
    * Add points
    * */
    let markersObjects = [];

    if(data.length !== 0){
        for(let i = 0; i < data.length; i++){
            markersObjects.push({
                type: 'Feature',
                id: data[i].id,
                geometry: {
                    type: 'Point',
                    coordinates: data[i].coords
                },
                properties: {
                    name: data[i].name,
                    place: data[i].place,
                    comment: data[i].comment,
                    date: data[i].date,
                    address: data[i].address,
                    coords: data[i].coords
                }
            })
        }
    }

    objectManager.add(markersObjects);
    myMap.geoObjects.add(objectManager);


    /*
    * Utils functions
    * */
    function formatDate(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yy = date.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        if (yy < 10) yy = '0' + yy;

        return `${ dd }.${ mm }.${ yy }`;
    }

    function buildCommentHtml(name, place, comment, date) {
        let html = '';
        let li = document.createElement('li');

        li.classList.add('popup-comment-list__el');

        html += '<div class="popup-comment-list__header">' +
        '<div class="popup-comment-list__name">' + name + '</div>' +
        '<div class="popup-comment-list__place">' + place + '</div>' +
        '<div class="popup-comment-list__date">' + date + '</div>' +
        '</div>' +
        '<div class="popup-comment-list__desc">' + comment + '</div>';

        li.innerHTML = html;

        return li;
    }
    
    function validateForm(form) {
        let elements = form.elements;
        let error = [];

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].value.length < 1) {
                elements[i].classList.add('error');
                error.push('не указано ' + elements[i].name);
            } else {
                elements[i].classList.remove('error');
            }
        }

        return error;
    }

    function openCommentForm(coords, address) {
        commentFormCoords = coords;

        myMap.balloon.open(coords, {
            address
        }, {
            layout: BalloonContentLayout
        });
    }

    function getAddress(coords) {
        return ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);

            return firstGeoObject.getAddressLine();
        });
    }


    // Создание метки.
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {}, {
            preset: 'islands#violetDotIconWithCaption',
            draggable: true
        });
    }


    /*
    * Map events
    * */
    myMap.events.add('click', async e => {
        let coords = e.get('coords');
        let address = await getAddress(coords);

        openCommentForm(coords, address);
    });





    objectManager.objects.events.add('balloonopen', function (e) {
        // Получим объект, на котором открылся балун.
        let id = e.get('objectId');
        let geoObject = objectManager.objects.getById(id);

        commentFormCoords = geoObject.geometry.coordinates;




        // console.log(commentFormCoords);

        console.log(id);
        console.log(geoObject);

        // Загрузим данные для объекта при необходимости.
        downloadContent([geoObject], id);
    });

    // objectManager.clusters.events.add('balloonopen', function (e) {
    //     // Получим id кластера, на котором открылся балун.
    //     var id = e.get('objectId'),
    //         // Получим геообъекты внутри кластера.
    //         cluster = objectManager.clusters.getById(id),
    //         geoObjects = cluster.properties.geoObjects;
    //
    //     // console.log(id);
    //     // console.log(cluster.properties);
    //     // console.log(geoObject);
    //
    //     // Загрузим данные для объектов при необходимости.
    //     downloadContent(geoObjects, id, true);
    // });




    function downloadContent(geoObjects, id, isCluster) {
        // Создадим массив меток, для которых данные ещё не загружены.
        let array = geoObjects.filter(function (geoObject) {
                return geoObject.properties.balloonContent === 'идет загрузка...' ||
                    geoObject.properties.balloonContent === 'Not found';
            });
            // Формируем массив идентификаторов, который будет передан серверу.
        let ids = array.map(function (geoObject) {
                return geoObject.id;
            });

        // console.log(ids);
        // console.log(ids);

        // if (ids.length) {
        //     // Запрос к серверу.
        //     // Сервер обработает массив идентификаторов и на его основе
        //     // вернет JSON-объект, содержащий текст балуна для
        //     // заданных меток.
        //     ymaps.vow.resolve($.ajax({
        //         // Обратите внимание, что серверную часть необходимо реализовать самостоятельно.
        //         //contentType: 'application/json',
        //         //type: 'POST',
        //         //data: JSON.stringify(ids),
        //         url: 'content.json',
        //         dataType: 'json',
        //         processData: false
        //     })).then(function (data) {
        //         // Имитируем задержку от сервера.
        //         return ymaps.vow.delay(data, 1000);
        //     }).then(
        //         function (data) {
        //             geoObjects.forEach(function (geoObject) {
        //                 // Содержимое балуна берем из данных, полученных от сервера.
        //                 // Сервер возвращает массив объектов вида:
        //                 // [ {"balloonContent": "Содержимое балуна"}, ...]
        //                 geoObject.properties.balloonContent = data[geoObject.id].balloonContent;
        //             });
        //             // Оповещаем балун, что нужно применить новые данные.
        //             setNewData();
        //         }
        //     );
        // }

        function setNewData(){
            if (isCluster && objectManager.clusters.balloon.isOpen(id)) {
                objectManager.clusters.balloon.setData(objectManager.clusters.balloon.getData());
            } else if (objectManager.objects.balloon.isOpen(id)) {
                objectManager.objects.balloon.setData(objectManager.objects.balloon.getData());
            }
        }
    }


    


//     function onClusterClick (e) {
//         var objectId = e.get('objectId');
//         if (e.get('type') === 'mouseenter') {
//             objectManager.clusters.setObjectOptions(objectId, {
//                 preset: 'islands#yellowIcon'
//             });
//         } else {
//             objectManager.clusters.setObjectOptions(objectId, {
//                 preset: 'islands#blueIcon'
//             });
//         }
//     }
//
// // Назначаем обработчик событий для коллекции объектов-кластеров менеджера.
//     objectManager.clusters.events.add(['click'], onClusterEvent);






    // Слушаем клик на карте.
    // myMap.events.add('click', function (e) {
    //     var coords = e.get('coords');
    //
    //     // Если метка уже создана – просто передвигаем ее.
    //     if (myPlacemark) {
    //         myPlacemark.geometry.setCoordinates(coords);
    //     }
    //     // Если нет – создаем.
    //     else {
    //         myPlacemark = createPlacemark(coords);
    //         myMap.geoObjects.add(myPlacemark);
    //         // Слушаем событие окончания перетаскивания на метке.
    //         myPlacemark.events.add('dragend', function () {
    //             getAddress(myPlacemark.geometry.getCoordinates());
    //         });
    //     }
    //     getAddress(coords);
    // });




    // Определяем адрес по координатам (обратное геокодирование).
    // function getAddress(coords) {
    //     myPlacemark.properties.set('iconCaption', 'поиск...');
    //     ymaps.geocode(coords).then(function (res) {
    //         var firstGeoObject = res.geoObjects.get(0);
    //
    //         myPlacemark.properties
    //             .set({
    //                 // Формируем строку с данными об объекте.
    //                 iconCaption: [
    //                     // Название населенного пункта или вышестоящее административно-территориальное образование.
    //                     firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
    //                     // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
    //                     firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
    //                 ].filter(Boolean).join(', '),
    //                 // В качестве контента балуна задаем строку с адресом объекта.
    //                 balloonContent: firstGeoObject.getAddressLine()
    //             });
    //     });
    // }



    // var placemark = new ymaps.Placemark([55.650625, 37.62708], {
    //     name: 'Считаем'
    // }, {
    //     balloonContentLayout: BalloonContentLayout,
    //     // Запретим замену обычного балуна на балун-панель.
    //     // Если не указывать эту опцию, на картах маленького размера откроется балун-панель.
    //     balloonPanelMaxMapArea: 0
    // });
    //
    // myMap.geoObjects.add(placemark);



    let myPlacemark;


    // let mapForm = new ymaps.Hint(myMap, {
    //     // projection: ymaps.projection.wgs84Mercator,
    //     layout: ymaps.templateLayoutFactory.createClass(
    //         '<h1 class="{{ options.colorClass }}">' +
    //         'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS' +
    //         '</h1>'
    //     )
    // });
    //
    // console.log(mapForm);
    // console.log(myMap.getCenter());
    //
    // mapForm.open(myMap.getCenter(), 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');
    //
    // myMap.hint.open(myMap.getCenter(), "Одинокий хинт без метки", {
    //     // Опция: задержка перед открытием.
    //     openTimeout: 1500
    // });








    /*
    * Baloon
    * form
    * */

    // Создание независимого экземпляра балуна и отображение его в центре карты.
//     var balloon = new ymaps.Balloon(myMap);
// // Здесь родительскими устанавливаются опции карты,
// // где содержатся значения по умолчанию для обязательных опций.
//     balloon.options.setParent(myMap.options);
//
//
//     // balloon.options.layout = BalloonContentLayout;
//
//     balloon.options.set({
//         layout: BalloonContentLayout
//     });
//
//
// // Открываем балун в центре карты.
//     balloon.open(myMap.getCenter());

}




