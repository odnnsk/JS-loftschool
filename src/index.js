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
    let data = JSON.parse(localStorage.data || '[]');
    let clusterData = JSON.parse(localStorage.clusterData || '{}');
    let commentFormCoords;
    let markerId = data.length - 1 || 0;

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
        '{% if comments %}' +
            '{% for comment in comments %}' +
            '<li class="popup-comment-list__el">' +
            '<div class="popup-comment-list__header">' +
            '<div class="popup-comment-list__name">{{ comment.name }}</div>' +
            '<div class="popup-comment-list__place">{{ comment.place }}</div>' +
            '<div class="popup-comment-list__date">{{ comment.date }}</div>' +
            '</div>' +
            '<div class="popup-comment-list__desc">{{ comment.comment }}</div>' +
            '</li>' +
            '{% endfor %}' +
        '{% else %}' +
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
                    if (commentList.children.length === 1 && commentList.firstElementChild.classList.contains('popup-comment-list__el--empty')) {
                        commentList.firstElementChild.remove();
                    }

                    comment = buildCommentHtml(form.elements.name.value, form.elements.place.value, form.elements.comment.value, date);
                    commentList.prepend(comment);

                    //Add point to objectManager
                    objectManager.add({
                        type: 'Feature',
                        id: ++markerId,
                        geometry: {
                            type: 'Point',
                            coordinates: commentFormCoords
                        },
                        properties: {
                            name: form.elements.name.value,
                            place: form.elements.place.value,
                            comment: form.elements.comment.value,
                            date,
                            address,
                            coords: commentFormCoords
                        }
                    });

                    myMap.geoObjects.add(objectManager);

                    //Save data to localStorage
                    saveData('data', objectManager.objects.getAll());

                    //Put id in clusterData obj
                    createClusterData(markerId, commentFormCoords);
                    //Save data to localStorage
                    saveClusterData('clusterData', clusterData);

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
        // '<a data-coords="{{ properties.coords }}" class="cluster-address" href="#">{{ properties.address }}</a>' +
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
                // myMap.geoObjects.add(circle);
                //
                // queryObjects = objectManager.objects.getAll().map(el => el.geometry);
                // // queryObjects = objectManager.objects.getAll();
                //
                // console.log(queryObjects);
                //
                // // result = ymaps.geoQuery(queryObjects).searchInside(circle);
                // result = ymaps.geoQuery(queryObjects).search('geometry.coordinates.0 = "' + coords[0] + '"').search('geometry.coordinates.1 = "' + coords[1] + '"');
                // console.log(result);//GeoQueryResult
                // console.log(result.get(0));//GeoQueryResult
                // console.log(result.get(0).properties.getAll());//GeoQueryResult
                //
                //
                // result.each(el => {
                //     // console.log(el);
                //
                //     // console.log(el.properties.get('name'));
                //     console.log(el.options.get('preset'));
                // });
                
                // console.log(typeof coords[0]);
                // console.log(typeof +coords[0]);
                // console.log(+coords[0]);
                // console.log(56.21265153900809.toPrecision(4));
                // console.log(+coords[0].toPrecision(4));



                let key = createClusterDataKey(coords);
                let arr = clusterData[key];
                let comments = arr.reduce((prev, current, index, arr) => {
                    let { properties: { name, place, comment, date } } = objectManager.objects.getById(arr[index]);
                    
                    prev.push({ name, place, comment, date });
                    
                    return prev;
                }, []);

                getAddress(coords).then(address => {
                    openCommentForm(coords, address, comments);
                });

                //Close balloon
                myMap.balloon.close();
            }
        }
    );


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

    if (data.length !== 0) {
        for (let i = 0; i < data.length; i++) {
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

    //Save data to localStorage
    function saveClusterData(key, value) {
        localStorage[key] = JSON.stringify(value);
    }

    function saveData(key, value) {
        localStorage[key] = JSON.stringify(value.map(el => {
            return {
                id: el.id,
                coords: el.geometry.coordinates,
                name: el.properties.name,
                place: el.properties.place,
                comment: el.properties.comment,
                date: el.properties.date,
                address: el.properties.address
            }
        }));
    }

    function formatDate(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yy = date.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        if (yy < 10) yy = '0' + yy;

        return `${dd}.${mm}.${yy}`;
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

    function openCommentForm(coords, address, comments = []) {
        commentFormCoords = coords;

        myMap.balloon.open(coords, {
            address,
            comments
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

    function createClusterDataKey(coords) {
        return `${Number(coords[0]).toPrecision(4)},${Number(coords[1]).toPrecision(4)}`;
    }

    function createClusterData(id, coords) {
        let clusterDataKey = createClusterDataKey(coords);

        if (clusterDataKey in clusterData) {
            clusterData[clusterDataKey].push(id);
        } else {
            clusterData[clusterDataKey] = [id];
        }
    }

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
        let id = e.get('objectId');
        let geoObject = objectManager.objects.getById(id);

        commentFormCoords = geoObject.geometry.coordinates;
    });
}
