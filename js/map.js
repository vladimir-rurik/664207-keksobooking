'use strict';
(function () {

  var avatars = [
    'img/avatars/user01.png',
    'img/avatars/user02.png',
    'img/avatars/user03.png',
    'img/avatars/user04.png',
    'img/avatars/user05.png',
    'img/avatars/user06.png',
    'img/avatars/user07.png',
    'img/avatars/user08.png'
  ];

  var titles = [
    'Большая уютная квартира',
    'Маленькая неуютная квартира',
    'Огромный прекрасный дворец',
    'Маленький ужасный дворец',
    'Красивый гостевой домик',
    'Некрасивый негостеприимный домик',
    'Уютное бунгало далеко от моря',
    'Неуютное бунгало по колено в воде'
  ];

  var features = [
    'wifi',
    'dishwasher',
    'parking',
    'washer',
    'elevator',
    'conditioner'
  ];

  var photos = [
    'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
  ];

  var types = {
    'flat': 'Квартира',
    'bungalo': 'Бунгало',
    'house': 'Дом'
  };

  /**
   * Получение случайного числа от min до max не включая max
   * @param {number}  min  минимальное значение (включая)
   * @param {number}  max  максиальное значение (не включая)
   * @return {number}
   */
  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  /**
   * Создание массива случайных данных
   * @param {array}    array  исходный массив данных
   * @param {number}   count  колличество элементов в результирующем массиве
   * @param {boolean}  sort   производить ли сортировку
   * @return {Array}
   */
  var createRandomArray = function (array, count, sort) {
    var result = [];
    var tempArray = array.slice(0);
    for (var i = 0; i < count; i++) {
      var randomIndex = getRandomInt(0, tempArray.length);
      result.push(tempArray[randomIndex]);
      tempArray.splice(randomIndex, 1);
    }
    if (sort) {
      return result.sort();
    }
    return result;
  };

  /**
   * Создание массива объектов
   * @return {Array}
   */
  var createObjects = function () {
    var objects = [];
    for (var i = 0; i < 8; i++) {
      var avatarsIndex = getRandomInt(0, avatars.length);
      var titlesIndex = getRandomInt(0, titles.length);
      var locationX = getRandomInt(300, 901);
      var locationY = getRandomInt(150, 500);
      objects.push({
        'author': {
          'avatar': avatars[avatarsIndex]
        },
        'location': {
          'x': locationX,
          'y': locationY
        },
        'offer': {
          'title': titles[titlesIndex],
          'address': locationX + ', ' + locationY,
          'price': getRandomInt(1000, 1000001),
          'type': ['flat', 'house', 'bungalo'][getRandomInt(0, 3)],
          'rooms': getRandomInt(2, 6),
          'guests': getRandomInt(1, 12),
          'checkin': ['12:00', '13:00', '14:00'][getRandomInt(0, 3)],
          'checkout': ['12:00', '13:00', '14:00'][getRandomInt(0, 3)],
          'features': createRandomArray(features, getRandomInt(1, features.length)),
          'description': '',
          'photos': createRandomArray(photos, 3)
        }
      });
      avatars.splice(avatarsIndex, 1);
      titles.splice(titlesIndex, 1);
    }

    return objects;
  };

  /**
   * Создание кнопок на основе данных из списка объектов
   * @param {object} objects
   * @return {DocumentFragment}
   */
  var createButtons = function (objects) {
    var documentFragment = document.createDocumentFragment();
    for (var i = 0; i < objects.length; i++) {
      var button = document.createElement('button');
      var img = document.createElement('img');
      button.style.left = objects[i].location.x + 'px';
      button.style.top = objects[i].location.y + 'px';
      button.classList.add('map__pin');
      img.src = objects[i].author.avatar;
      img.width = '40';
      img.height = '40';
      img.draggable = 'false';
      button.appendChild(img);
      documentFragment.appendChild(button);
    }
    return documentFragment;
  };

  /**
   * Создание DOM элемента объявления на основе данных объекта
   * @param {object} object
   * @return {Node}
   */
  var createPopup = function (object) {
    var templatePopup = document.querySelector('template'); // получение template
    var mapCard = templatePopup.content.querySelector('.map__card'); // получение контейнера попапа
    var popup = mapCard.cloneNode(true); // создание DOM эелемента попапа

    popup.querySelector('.popup__avatar').src = object.author.avatar; // установка аватара
    popup.getElementsByTagName('.popup__title').textContent = object.offer.title; // установка заголовка
    popup.getElementsByTagName('.popup__text--address').textContent = object.offer.address; // установка адреса
    popup.querySelector('.popup__text--price').innerHTML = object.offer.price + '&#x20bd;/ночь'; // установка цены

    var offerType = popup.getElementsByTagName('h4')[0]; // получение заголовка для типа
    offerType.textContent = types[object.offer.type]; // установка типа

    var capacity = offerType.nextElementSibling; // получение контейнера вместимости
    capacity.textContent = object.offer.rooms + ' комнаты для ' + object.offer.guests + ' гостей'; // установка вместимости
    capacity.nextElementSibling.textContent = 'Заезд после ' + object.offer.checkin + ', выезд до ' + object.offer.checkout; // установка расписания

    var popupFeatures = popup.querySelector('.popup__features'); // получение контейнера опций
    popupFeatures.innerHTML = ''; // очистка контейнерна опций
    // установка опций
    for (var j = 0; j < object.offer.features.length; j++) {
      var li = document.createElement('LI');
      li.classList.add('feature', 'feature--' + object.offer.features[j]);
      popupFeatures.appendChild(li);
    }
    popupFeatures.nextElementSibling.textContent = object.offer.description; // установка описания

    var popupPictures = popup.querySelector('.popup__photos'); // получение контейнера фотографий
    // установка фотографий
    for (var l = 0; l < object.offer.photos.length; l++) {
      var photo = popupPictures.children[0].cloneNode(true);
      photo.style.verticalAlign = 'bottom';
      photo.src = object.offer.photos[l];
      photo.width = 63;
      photo.style.marginRight = 5 + 'px';
      popupPictures.appendChild(photo);
    }
    popupPictures.removeChild(popupPictures.children[0]);
    return popup;
  };

  var map = document.querySelector('.map');
  var mapPins = map.querySelector('.map__pins');
  var objects = createObjects();
  var buttons = createButtons(objects);
  mapPins.appendChild(buttons);
  var popup = createPopup(objects[0]);
  map.appendChild(popup);
  map.classList.remove('map--faded');
})();
