'use strict';

(function () {
  var HIDE_MESSAGE_TIMEOUT = 2000;
  var adFormElement = document.querySelector('.ad-form');
  var adFormFieldsets = adFormElement.querySelectorAll('fieldset');
  var adFormFields = adFormElement.querySelectorAll('input, select, textarea');
  var typeSelect = adFormElement.querySelector('[name=type]');
  var priceInput = adFormElement.querySelector('[name=price]');
  var timeInSelect = adFormElement.querySelector('[name=timein]');
  var timeOutSelect = adFormElement.querySelector('[name=timeout]');
  var roomsCountSelect = adFormElement.querySelector('[name=rooms]');
  var capacitySelect = adFormElement.querySelector('[name=capacity]');
  var successMessage = document.querySelector('.success');

  /**
   * Функция, ставящая/снимающая подсветку поля красной рамкой.
   * @param {Object} target - поле формы
   * @param {boolean} isLightningOn - подсветить или нет
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
    markLightning(target, false);

    // Если поле не валидно, оно подсвечивается
    target.checkValidity();
  };

  /**
   * Функция, устанавливающая нижнюю границу цены и плейсхолдер в зависимости от типа помещения.
   * @param {string} propertyType - тип помещения
   */
  var setMinPrice = function (propertyType) {
    var price = window.data.getPropertyMinPrice(propertyType);
    priceInput.min = price;
    priceInput.placeholder = price;
    if (priceInput.value) {
      changeValidityIndicator(priceInput);
    }
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
    if (roomsCount < window.data.getNonGuestRoomCount()) {
      setCapacityValidity(1, roomsCount, 'Количество гостей не должно превышать число комнат и должно быть больше 0.');
    } else {
      setCapacityValidity(0, 0, '100 комнат - не для гостей.');
    }
  };

  /**
   * Функция, делающая поля формы активными или неактивными
   * @param {boolean} isDisabled - значение атрибута disabled, которое требуется присвоить полям формы
   */
  var disableInputs = function (isDisabled) {
    adFormFieldsets.forEach(function (adFormFieldset) {
      adFormFieldset.disabled = isDisabled;
    });
  };

  /**
   * Обработчик успешной отправки данных формы на сервер
   * @callback onLoadCallback
   */
  var loadHandler = function () {
    successMessage.classList.remove('hidden');
    setTimeout(function () {
      successMessage.classList.add('hidden');
    }, HIDE_MESSAGE_TIMEOUT);

    adFormElement.reset();
  };

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

  adFormFields.forEach(function (formField) {
    formField.addEventListener('invalid', function (evt) {
      markLightning(evt.target, true);
    });
    formField.addEventListener('blur', function (evt) {
      changeValidityIndicator(evt.target);
    });
  });

  adFormElement.addEventListener('submit', function (evt) {
    var errorElement = document.querySelector('.error');
    if (errorElement) {
      errorElement.remove();
    }
    window.backend.sendData(new FormData(adFormElement), loadHandler, window.util.showError);
    evt.preventDefault();
  });

  window.form = {
    /**
     * Метод, возвращающий DOM-элемент формы.
     * @return {Object}
     */
    getElement: function () {
      return adFormElement;
    },

    /**
     * Метод, возвращающий форму в исходное состояние.
     */
    reset: function () {
      setMinPrice(typeSelect.value);
      validateCapacity(roomsCountSelect.value);
      disableInputs(true);
      adFormElement.classList.add('ad-form--disabled');
    },

    /**
     * Метод, включающий форму.
     */
    enable: function () {
      adFormElement.classList.remove('ad-form--disabled');
      disableInputs(false);
    }
  };
})();
