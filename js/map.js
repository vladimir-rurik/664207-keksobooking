'use strict';

/**
 * Наименьшая x-координата метки
 * @const
 * @type {number}
 */
var MIN_X_LOCATION = 300;

/**
 * Наибольшая x-координата метки
 * @const
 * @type {number}
 */
var MAX_X_LOCATION = 900;

/**
 * Наименьшая y-координата метки
 * @const
 * @type {number}
 */
var MIN_Y_LOCATION = 150;

/**
 * Наибольшая y-координата метки
 * @const
 * @type {number}
 */
var MAX_Y_LOCATION = 500;

/**
 * Наименьшая цена
 * @const
 * @type {number}
 */
var MIN_PRICE = 1000;

/**
 * Наибольшая цена
 * @const
 * @type {number}
 */
var MAX_PRICE = 1000000;

/**
 * Наибольшее количество комнат
 * @const
 * @type {number}
 */
var MAX_ROOMS_COUNT = 5;

/**
 * Ширина метки
 * @const
 * @type {number}
 */
var PIN_WIDTH = 50;

/**
 * Высота метки
 * @const
 * @type {number}
 */
var PIN_HEIGHT = 70;

/**
 * Количество похожих объявлений
 * @const
 * @type {number}
 */
var SIMILAR_NOTICES_COUNT = 8;

/**
 * Код клавиши Enter
 * @const
 * @type {number}
 */
var ENTER_KEYCODE = 13;

var HOURS = [
  '12:00',
  '13:00',
  '14:00'
];

var NOTICE_TITLES = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];

var PropertyType = {
  palace: 'Дворец',
  flat: 'Квартира',
  house: 'Дом',
  bungalo: 'Бунгало'
};

var PropertyMinPrice = {
  palace: 10000,
  flat: 1000,
  house: 5000,
  bungalo: 0
};

var NO_GUESTS_ROOMS_COUNT = 100;

var PROPERTY_FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

var PROPERTY_PHOTOS = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var mapElement = document.querySelector('.map');
var userPinElement = mapElement.querySelector('.map__pin--main');
var mapPinsElement = mapElement.querySelector('.map__pins');
var mapPinTemplate = document.querySelector('template').content.querySelector('.map__pin');
var mapFiltersElement = mapElement.querySelector('.map__filters-container');
var mapCardTemplate = document.querySelector('template').content.querySelector('.map__card');
var activeCard = null;
var adFormElement = document.querySelector('.ad-form');
var adFormFieldsets = adFormElement.querySelectorAll('fieldset');
var adFormFields = adFormElement.querySelectorAll('input, select, textarea');
var addressInput = adFormElement.querySelector('#address');
var typeSelect = adFormElement.querySelector('[name=type]');
var priceInput = adFormElement.querySelector('[name=price]');
var timeInSelect = adFormElement.querySelector('[name=timein]');
var timeOutSelect = adFormElement.querySelector('[name=timeout]');
var roomsCountSelect = adFormElement.querySelector('[name=rooms]');
var capacitySelect = adFormElement.querySelector('[name=capacity]');

var isPageActive = false;

/**
 * Начальные координаты указателя мыши при передвижении пина.
 * @type {Object}
 */
var startPoint = {
  x: null,
  y: null
};

/**
 * Пользовательский пин.
 * @type {Object}
 */
var userPin = {
  MIN_X: 0,
  MAX_X: mapElement.offsetWidth,
  MIN_Y: MIN_Y_LOCATION,
  MAX_Y: MAX_Y_LOCATION,
  INITIAL_LEFT: userPinElement.offsetLeft,
  INITIAL_TOP: userPinElement.offsetTop,
  POINT_SHIFT: 16,
  addressX: null,
  addressY: null,
  width: userPinElement.offsetWidth,
  height: userPinElement.offsetHeight,

  /**
   * Метод, возвращающий поправку при расчете x-координаты метки или ее адреса.
   * @return {number}
   */
  getShiftX: function () {
    return this.width / 2;
  },

  /**
   * Метод, возвращающий поправку при расчете y-координаты метки или ее адреса,
   * в зависимости от состояния метки. Если метка находится на неактивной странице,
   * то ее адресом являются координаты центра, в противном случае адресом являются
   * координаты острого конца.
   * @return {number}
   */
  getShiftY: function () {
    return isPageActive ? (this.height + this.POINT_SHIFT) : (this.height / 2);
  },

  /**
   * Метод, вычисляющий адрес острого конца или середины метки по ее положению на карте.
   */
  resetAddress: function () {
    this.addressX = this.INITIAL_LEFT + this.getShiftX();
    this.addressY = this.INITIAL_TOP + this.getShiftY();
  },

  /**
   * Метод, устанавливающий адрес метки по заданным координатам.
   * Если координаты метки выходят за границы допустимых значений, то
   * устанавливается минимально или максимально допустимое значение
   * @param {number} newAddressX - x-координата острого конца или середины пина
   * @param {number} newAddressY - y-координата острого конца или середины пина
   */
  setAddress: function (newAddressX, newAddressY) {
    this.addressX = Math.max(this.MIN_X, Math.min(this.MAX_X, newAddressX));
    this.addressY = Math.max(this.MIN_Y, Math.min(this.MAX_Y, newAddressY));
  }
};

/**
 * Функция, выполняющая перестановку элементов массива случайным образом.
 * @param {Array.<*>} items - массив элементов
 * @return {Array.<*>} - новый массив с переставленными элементами
 */
var shuffle = function (items) {
  var shuffledItems = items.slice();

  for (var i = shuffledItems.length; i > 1; i--) {
    var randomIndex = Math.floor(Math.random() * i);
    var itemCopy = shuffledItems[i - 1];
    shuffledItems[i - 1] = shuffledItems[randomIndex];
    shuffledItems[randomIndex] = itemCopy;
  }

  return shuffledItems;
};

/**
 * Функция, выбирающая случайное число из заданного промежутка.
 * @param {number} startNumber - начальное число промежутка
 * @param {number} endNumber - конечное число промежутка
 * @return {number} - случайное число из заданного промежутка,
 * включая startNumber и endNumber
 */
var getRandomNumber = function (startNumber, endNumber) {
  return Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
};

/**
 * Функция, выбирающая случайный элемент в массиве.
 * @param {Array.<*>} items - массив элементов
 * @return {*} - случайный элемент массива
 */
var getRandomItem = function (items) {
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Функция, генерирующая объявление случайным образом.
 * @callback generateNoticeCallback
 * @param {number} userNumber - номер пользователя (однозначное число)
 * @param {string} noticeTitle - заголовок объявления
 * @return {Object} - JS объект, описывающий объявление
 */
var generateRandomNotice = function (userNumber, noticeTitle) {
  var locationX = getRandomNumber(MIN_X_LOCATION, MAX_X_LOCATION);
  var locationY = getRandomNumber(MIN_Y_LOCATION, MAX_Y_LOCATION);
  var featuresList = [];

  for (var k = 0; k < PROPERTY_FEATURES.length; k++) {
    if (getRandomNumber(0, 1)) {
      featuresList.push(PROPERTY_FEATURES[k]);
    }
  }

  return {
    author: {
      avatar: 'img/avatars/user0' + userNumber + '.png'
    },
    offer: {
      title: noticeTitle,
      address: locationX + ', ' + locationY,
      price: getRandomNumber(MIN_PRICE, MAX_PRICE),
      type: getRandomItem(Object.keys(PropertyType)),
      rooms: getRandomNumber(1, MAX_ROOMS_COUNT),
      guests: getRandomNumber(1, MAX_ROOMS_COUNT),
      checkin: getRandomItem(HOURS),
      checkout: getRandomItem(HOURS),
      features: featuresList,
      description: '',
      photos: shuffle(PROPERTY_PHOTOS)
    },
    location: {
      x: locationX,
      y: locationY
    }
  };
};

/**
 * Функция, генерирующая массив объявлений.
 * @param {generateNoticeCallback} generateNotice - функция, генерирующая объявление
 * @param {number} length - длина массива
 * @return {Array.<Object>}
 */
var generateNotices = function (generateNotice, length) {
  var titles = shuffle(NOTICE_TITLES);
  var notices = [];

  for (var i = 0; i < length; i++) {
    notices[i] = generateNotice(i + 1, titles[i]);
  }

  return shuffle(notices);
};

/**
 * Функция, создающая DOM-элемент, соответствующий метке на карте.
 * @callback renderItemCallback
 * @param {Object} notice - объект, описывающий объявление
 * @param {Object} pinTemplate - шаблон метки
 * @return {Object} - DOM-элемент
 */
var renderPin = function (notice, pinTemplate) {
  var pinElement = pinTemplate.cloneNode(true);
  var pinAvatar = pinElement.querySelector('img');

  pinElement.style.left = notice.location.x - PIN_WIDTH / 2 + 'px';
  pinElement.style.top = notice.location.y - PIN_HEIGHT + 'px';

  pinAvatar.src = notice.author.avatar;
  pinAvatar.alt = notice.offer.title;

  pinElement.addEventListener('click', function () {
    openCard(notice);
  });

  pinElement.addEventListener('keydown', function (evt) {
    if (evt.keyCode === ENTER_KEYCODE) {
      openCard(notice);
    }
  });

  return pinElement;
};

/**
 * Функция, создающая DOM-элемент, соответствующий доступному удобству,
 * указанному в объявлении.
 * @callback renderItemCallback
 * @param {string} feature - удобство, один из элементов PROPERTY_FEATURES
 * @param {Object} featureTemplate - шаблон удобства
 * @return {Object} - DOM-элемент
 */
var renderFeature = function (feature, featureTemplate) {
  var featureElement = featureTemplate.cloneNode(true);
  featureElement.class = 'popup__feature';
  featureElement.classList.add('popup__feature--' + feature);

  return featureElement;
};

/**
 * Функция, создающая DOM-элемент, соответствующий фотографии жилья.
 * @callback renderItemCallback
 * @param {string} photoUrl - URL фотографии
 * @param {Object} photoTemplate - шаблон фотографии
 * @return {Object} - DOM-элемент
 */
var renderPhoto = function (photoUrl, photoTemplate) {
  var photoElement = photoTemplate.cloneNode(true);
  photoElement.src = photoUrl;

  return photoElement;
};

/**
 * Функция, отрисовывающая массив DOM-элементов.
 * @param {Array.<*>} dataList - массив, содержащий данные элементов
 * @param {Object} parentElement - родительский DOM-элемент, в котором будут отрисованы элементы
 * @param {Object} template - шаблон элемента
 * @param {renderItemCallback} renderItem - функция, создающая DOM-элемент
 */
var renderElements = function (dataList, parentElement, template, renderItem) {
  var fragment = document.createDocumentFragment();
  dataList.forEach(function (data) {
    fragment.appendChild(renderItem(data, template));
  });
  parentElement.appendChild(fragment);
};

/**
 * Функция, запоняющая DOM-элемент текстом.
 * @param {Object} element - родительский DOM-элемент
 * @param {string} selector - CSS-селектор элемента
 * @param {string} text - новый текст элемента
 */
var fillTemplateWithText = function (element, selector, text) {
  element.querySelector(selector).textContent = text;
};

/**
 * Функция, отрисовывающая карточку объявления.
 * @param {Object} notice - объект, описывающий объявление
 * @param {Object} parentElement - родительский DOM-элемент
 * @param {Object} nextElement - DOM-элемент, перед которым будет отрисовано объявление
 * @param {Object} cardTemplate - шаблон объявления
 */
var renderCard = function (notice, parentElement, nextElement, cardTemplate) {
  var cardElement = cardTemplate.cloneNode(true);
  var featuresElement = cardElement.querySelector('.popup__features');
  var featureTemplate = featuresElement.querySelector('.popup__feature');
  var photosElement = cardElement.querySelector('.popup__photos');
  var photoTemplate = photosElement.querySelector('.popup__photo');
  var closeButton = cardElement.querySelector('.popup__close');
  var offer = notice.offer;

  fillTemplateWithText(cardElement, '.popup__title', offer.title);
  fillTemplateWithText(cardElement, '.popup__text--address', offer.address);
  fillTemplateWithText(cardElement, '.popup__text--price', offer.price + '₽/ночь');
  fillTemplateWithText(cardElement, '.popup__type', PropertyType[offer.type]);
  fillTemplateWithText(cardElement, '.popup__text--capacity', offer.rooms + ' комнаты для ' + offer.guests + ' гостей');
  fillTemplateWithText(cardElement, '.popup__text--time', 'Заезд после ' + offer.checkin + ', выезд до ' + offer.checkout);
  fillTemplateWithText(cardElement, '.popup__description', offer.description);
  featuresElement.textContent = '';
  renderElements(offer.features, featuresElement, featureTemplate, renderFeature);
  photosElement.textContent = '';
  renderElements(offer.photos, photosElement, photoTemplate, renderPhoto);

  cardElement.querySelector('.popup__avatar').src = notice.author.avatar;

  parentElement.insertBefore(cardElement, nextElement);
  activeCard = cardElement;

  closeButton.addEventListener('click', function () {
    closeActiveCard();
  });

  closeButton.addEventListener('keydown', function (evt) {
    if (evt.keyCode === ENTER_KEYCODE) {
      closeActiveCard();
    }
  });
};

/**
 * Функция, ставящая/снимающая подсветку поля красной рамкой.
 * @param {Object} target - поле формы
 * @param {boolean} isLightOn - подсветить или нет
 */
var markLightning = function (target, isLightningOn) {
  if (isLightningOn) {
    target.classList.add('invalid');
  } else {
    target.classList.remove('invalid');
  }
};

/**
 * Функция, устанавливающая или снимающая подсветку поля красной рамкой,
 * в зависимости от правильности введенных данных.
 * @param {Object} target - поле формы
 */
var changeValidityIndicator = function (target) {
  // Сброс рамки
  markLightning(target,false);

  // Если поле не валидно, оно подсвечивается
  target.checkValidity();
};

/**
 * Функция, устанавливающая нижнюю границу цены и плейсхолдер в зависимости от типа помещения.
 * @param {string} propertyType - тип помещения
 */
var setMinPrice = function (propertyType) {
  var price = PropertyMinPrice[propertyType];
  priceInput.min = price;
  priceInput.placeholder = price;
  changeValidityIndicator(priceInput);
};

/**
 * Функция, синхронизирующая время заезда с временем выезда.
 * @param {Object} timeSelect - DOM-элемент выбора времени заезда или выезда
 * @param {string} timeValue - время заезда/выезда
 */
var setTime = function (timeSelect, timeValue) {
  timeSelect.value = timeValue;
};

/**
 * Функция, устанавливающая сообщение об ошибке для поля выбора количества гостей.
 * @param {number} minGuests - минимальное количество гостей
 * @param {(string|number)} maxGuests - максимальное количество гостей
 * @param {string} validationMessage - сообщение об ошибке
 */
var setCapacityValidity = function (minGuests, maxGuests, validationMessage) {
  var message = capacitySelect.value < minGuests || capacitySelect.value > maxGuests ? validationMessage : '';
  capacitySelect.setCustomValidity(message);
  changeValidityIndicator(capacitySelect);
};

/**
 * Функция, выполняющая проверку поля выбора количества гостей в зависимости от выбранного количества комнат.
 * @param {(string|number)} roomsCount - количество комнат
 */
var validateCapacity = function (roomsCount) {
  if (roomsCount < NO_GUESTS_ROOMS_COUNT) {
    setCapacityValidity(1, roomsCount, 'Количество гостей не должно превышать число комнат и должно быть больше 0.');
  } else {
    setCapacityValidity(0, 0, '100 комнат - не для гостей.');
  }
};

/**
 * Функция, открывающая карточку объявления.
 * @param {Object} notice - объект, описывающий объявление
 */
var openCard = function (notice) {
  if (activeCard) {
    closeActiveCard();
  }
  renderCard(notice, mapElement, mapFiltersElement, mapCardTemplate);
};

/**
 * Функция, закрывающая текущую карточку объявления.
 */
var closeActiveCard = function () {
  activeCard.remove();
};

/**
 * Функция, переводящая страницу в активный/неактивный режим.
 * @param {boolean} isActive - активный/неактивный режим
 */
var setPage = function (isActive) {
  if (isActive) {
    mapElement.classList.remove('map--faded');
    adFormElement.classList.remove('ad-form--disabled');
  } else {
    mapElement.classList.add('map--faded');
    adFormElement.classList.add('ad-form--disabled');
  }

  adFormFieldsets.forEach(function (adFormFieldset) {
    adFormFieldset.disabled = !isActive;
  });

  isPageActive = isActive;
};

/**
 * Функция, возвращающая страницу в исходное состояние.
 */
var resetPage = function () {
  if (activeCard) {
    activeCard.remove();
  }
  deletePins();
  setPage(false);
  userPin.resetAddress();
  setAddressField();
  setUserPinPosition();
  setMinPrice(typeSelect.value);
  validateCapacity(roomsCountSelect.value);
};

/**
 * Функция, отрисовывающая на карте метки похожих объявлений.
 */
var renderPins = function () {
  var noticesData = generateNotices(generateRandomNotice, SIMILAR_NOTICES_COUNT);
  renderElements(noticesData, mapPinsElement, mapPinTemplate, renderPin);
};

/**
 * Функция, удаляющая с карты метки похожих объявлений.
 */
var deletePins = function () {
  var pins = mapPinsElement.querySelectorAll('.map__pin:not(.map__pin--main)');
  for (var i = 0; i < pins.length; i++) {
    pins[i].remove();
  }
};

/**
 * Функция, сохраняющая начальные координаты указателя мыши при перемещении метки.
 * @param {number} startX - x-координата указателя мыши
 * @param {number} startY - y-координата указателя мыши
 */
var setStartPoint = function (startX, startY) {
  startPoint.x = startX;
  startPoint.y = startY;
};

/**
 * Функция, устанавливающая адрес острого конца (или середины) метки пользователя
 * в поле ввода.
 */
var setAddressField = function () {
  addressInput.value = userPin.addressX + ', ' + userPin.addressY;
};

/**
 * Функция, задающая позицию метки пользователя на карте в зависимости от
 * координат, указанных в поле ввода адреса.
 */
var setUserPinPosition = function () {
  userPinElement.style.left = (userPin.addressX - userPin.getShiftX()) + 'px';
  userPinElement.style.top = (userPin.addressY - userPin.getShiftY()) + 'px';
};

/**
 * Функция, подготавливающая метку пользователя к перемещению.
 * @param {number} startX - начальная x-координата указателя мыши
 * @param {number} startY - начальная y-координата указателя мыши
 */
var startMovingUserPin = function (startX, startY) {
  setStartPoint(startX, startY);

  document.addEventListener('mousemove', documentMouseMoveHandler);
  document.addEventListener('mouseup', documentMouseUpHandler);
};

/**
 * Функция, перемещающая метку пользователя вслед за указателем мыши.
 * @param {number} endX - конечная x-координата указателя мыши
 * @param {number} endY - конечная y-координата указателя мыши
 */
var moveUserPinTo = function (endX, endY) {
  var mouseShift = {
    x: endX - startPoint.x,
    y: endY - startPoint.y
  };

  userPin.setAddress(userPin.addressX + mouseShift.x, userPin.addressY + mouseShift.y);
  setAddressField();
  setUserPinPosition();
  setStartPoint(endX, endY);
};

/**
 * Функция, завершающая перемещение метки пользователя
 */
var finishMovingUserPin = function () {
  if (!isPageActive) {
    setPage(true);
    renderPins();
  }
  setUserPinPosition();
  document.removeEventListener('mousemove', documentMouseMoveHandler);
  document.removeEventListener('mouseup', documentMouseUpHandler);
};

/**
 * Обработчик перемещения мыши
 * @param {Object} evt - объект события
 */
var documentMouseMoveHandler = function (evt) {
  evt.preventDefault();
  moveUserPinTo(evt.clientX, evt.clientY);
};

/**
 * Обработчик отжатия мыши
 * @param {Object} evt - объект события
 */
var documentMouseUpHandler = function (evt) {
  evt.preventDefault();
  finishMovingUserPin();
};

resetPage();

typeSelect.addEventListener('change', function (evt) {
  setMinPrice(evt.target.value);
});

timeInSelect.addEventListener('change', function (evt) {
  setTime(timeOutSelect, evt.target.value);
});

timeOutSelect.addEventListener('change', function (evt) {
  setTime(timeInSelect, evt.target.value);
});

roomsCountSelect.addEventListener('change', function (evt) {
  validateCapacity(evt.target.value);
});

capacitySelect.addEventListener('change', function () {
  validateCapacity(roomsCountSelect.value);
});

adFormElement.addEventListener('reset', function () {
  resetPage();
});

userPinElement.addEventListener('mousedown', function (evt) {
  evt.preventDefault();
  startMovingUserPin(evt.clientX, evt.clientY);
});

adFormFields.forEach(function (formField) {

  formField.addEventListener('invalid', function (evt) {
    markLightning(evt.target,true);
  });
  formField.addEventListener('blur', function (evt) {
    changeValidityIndicator(evt.target);
  });
});
