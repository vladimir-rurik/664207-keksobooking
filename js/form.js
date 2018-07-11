'use strict';

(function () {
  var HIDE_MESSAGE_TIMEOUT = 2000;
  var DEFAULT_AVATAR_FILE = 'img/muffin-grey.svg';
  var IMAGE_FILE_TYPES = [
    'gif',
    'jpg',
    'jpeg',
    'png',
    'svg'
  ];

  var MinGuestCountMessages = Object.freeze({
    ZERO: {guestCount: 0, message: '100 комнат - не для гостей.'},
    ONE: {guestCount: 1, message: 'Количество гостей не должно превышать число комнат и должно быть больше 0.'}
  });

  var adFormElement = document.querySelector('.ad-form');
  var adFormFieldsets = adFormElement.querySelectorAll('fieldset');
  var adFormFields = adFormElement.querySelectorAll('input, select, textarea');
  var avatarPreview = adFormElement.querySelector('.ad-form-header__preview img');
  var avatarChooser = adFormElement.querySelector('.ad-form__field input[type=file]');
  var photoContainer = adFormElement.querySelector('.ad-form__photo-container');
  var photoPreview = adFormElement.querySelector('.ad-form__photo');
  var photoChooser = adFormElement.querySelector('.ad-form__upload input[type=file]');
  var typeSelect = adFormElement.querySelector('[name=type]');
  var priceInput = adFormElement.querySelector('[name=price]');
  var timeInSelect = adFormElement.querySelector('[name=timein]');
  var timeOutSelect = adFormElement.querySelector('[name=timeout]');
  var roomsCountSelect = adFormElement.querySelector('[name=rooms]');
  var capacitySelect = adFormElement.querySelector('[name=capacity]');
  var successMessage = document.querySelector('.success');

  var _photos = [];
  var _draggedPhoto = null;

  /**
   * Функция, определяющая, является ли файл изображением
   * @param {string} fileName - имя файла
   * @return {boolean}
   */
  var isValidImageFile = function (fileName) {
    return IMAGE_FILE_TYPES.some(function (fileType) {
      return fileName.endsWith(fileType);
    });
  };

  /**
   * Функция, отрисовывающая превью аватарки
   * @param {File} avatarFile - объект файл для аватарки
   */
  var previewAvatar = function (avatarFile) {

    if (avatarFile && isValidImageFile(avatarFile.name.toLowerCase())) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        avatarPreview.src = reader.result;
      });

      reader.readAsDataURL(avatarFile);
    }
  };

  /**
   * Функция, отрисовывающая превью фотографий помещения
   */
  var previewPhotos = function () {
    deletePhotos();

    Array.from(photoChooser.files, function (photoFile) {
      if (photoFile && isValidImageFile(photoFile.name.toLowerCase())) {
        var preview = document.createElement('div');
        preview.classList.add('ad-form__photo');
        var photo = document.createElement('img');
        preview.appendChild(photo);
        var reader = new FileReader();

        reader.addEventListener('load', function () {
          photo.src = reader.result;
          photoContainer.appendChild(preview);
          _photos.push(preview);
        });

        reader.readAsDataURL(photoFile);
      }
    });

    photoPreview.style = _photos ? 'display: none;' : '';
  };

  /**
   * Функция, удаляющая превью фотографий помещения
   */
  var deletePhotos = function () {
    _photos.innerHTML = '';
  };

  /**
   * Функция, определяющая, является ли элемент изображением.
   * @param {Object} target - DOM-элемент
   * @return {boolean}
   */
  var isImageElement = function (target) {
    return target.tagName.toLowerCase() === 'img';
  };

  /**
   * Функция, подготавливающая перемещение фото.
   * @param {Object} target - DOM-элемент - перетаскиваемый элемент
   * @param {Object} dataTransfer - объект передачи данных
   */
  var startDraggingPhoto = function (target, dataTransfer) {
    if (isImageElement(target)) {
      _draggedPhoto = target.parentElement;
      dataTransfer.setData('text/plain', target.src);
    }
  };

  /**
   * Функция, завершающая перемещение фото.
   */
  var finishDraggingPhoto = function () {
    _draggedPhoto = null;
  };

  /**
   * Функция, возвращающая индекс дочернего DOM-элемента.
   * @param {Object} parent - родительский DOM-элемент
   * @param {Object} child - дочерний DOM-элемент
   * @return {number}
   */
  var getIndex = function (parent, child) {
    return Array.from(parent.children).indexOf(child);
  };

  /**
   * Функция, определяющая порядок дочерних элементов
   * @param {Object} parent - родительский DOM-элемент
   * @param {Object} child1 - первый дочерний DOM-элемент
   * @param {Object} child2 - второй дочерний DOM-элемент
   * @return {boolean} - стоит ли первый элемент раньше второго
   */
  var isBefore = function (parent, child1, child2) {
    return getIndex(parent, child1) < getIndex(parent, child2);
  };

  /**
   * Функция, перемещающая фото в указанное место.
   * @param {Object} target - DOM-элемент, в который перетаскивается фото
   */
  var dropPhoto = function (target) {
    if (target.classList.contains('ad-form__photo')) {
      target.style.boxShadow = '';
      var placement = isBefore(photoContainer, _draggedPhoto, target) ? 'afterend' : 'beforebegin';
      target.insertAdjacentElement(placement, _draggedPhoto);
    }
  };

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
    var price = window.data.getPropertyMinPrice(propertyType.toUpperCase());
    priceInput.min = priceInput.placeholder = price;
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
      setCapacityValidity(MinGuestCountMessages.ONE.guestCount, roomsCount, MinGuestCountMessages.ONE.message);
    } else {
      setCapacityValidity(MinGuestCountMessages.ZERO.guestCount, 0, MinGuestCountMessages.ZERO.message);
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
   * функция вызывающаяся после успешной отправки данных формы на сервер
   */
  var showSuccessMessageAndResetForm = function () {
    successMessage.classList.remove('hidden');
    setTimeout(function () {
      successMessage.classList.add('hidden');
    }, HIDE_MESSAGE_TIMEOUT);

    adFormElement.reset();
  };

  var avatarChooserChangeHandler = function () {
    previewAvatar(avatarChooser.files[0]);
  };

  var photoChooserChangeHandler = function () {
    previewPhotos();
  };

  var photoContainerDragStartHandler = function (evt) {
    startDraggingPhoto(evt.target, evt.dataTransfer);
  };

  var photoContainerDragEndHandler = function (evt) {
    finishDraggingPhoto();
    evt.preventDefault();
  };

  var photoContainerDragEnterHandler = function (evt) {
    if (_draggedPhoto && isImageElement(evt.target)) {
      evt.target.parentElement.style.boxShadow = '0 0 2px 2px #ff5635';
    }
  };

  var photoContainerDragLeaveHandler = function (evt) {
    if (_draggedPhoto && isImageElement(evt.target)) {
      evt.target.parentElement.style.boxShadow = '';
    }
  };

  var photoContainerDragOverHandler = function (evt) {
    if (_draggedPhoto) {
      evt.preventDefault();
    }
    return false;
  };

  var photoContainerDropHandler = function (evt) {
    dropPhoto(evt.target.parentElement);
    evt.preventDefault();
  };

  var typeSelectChangeHanlder = function (evt) {
    setMinPrice(evt.target.value);
  };

  var timeInSelectChangeHandler = function (evt) {
    setTime(timeOutSelect, evt.target.value);
  };

  var timeOutSelectChangeHandler = function (evt) {
    setTime(timeInSelect, evt.target.value);
  };

  var roomsCountSelectChangeHandler = function (evt) {
    validateCapacity(evt.target.value);
  };

  var capacitySelectChangeHandler = function () {
    validateCapacity(roomsCountSelect.value);
  };

  var adFormFieldInvalidHandler = function (evt) {
    markLightning(evt.target, true);
  };

  var adFormFieldBlurHandler = function (evt) {
    changeValidityIndicator(evt.target);
  };

  var adFormElementSubmitHandler = function (evt) {
    var errorElement = document.querySelector('.error');
    if (errorElement) {
      errorElement.remove();
    }
    window.backend.sendData(new FormData(adFormElement), showSuccessMessageAndResetForm, window.util.showError);
    evt.preventDefault();
  };

  var addEventHandlers = function () {
    avatarChooser.addEventListener('change', avatarChooserChangeHandler);
    photoChooser.addEventListener('change', photoChooserChangeHandler);
    photoContainer.addEventListener('dragstart', photoContainerDragStartHandler);
    photoContainer.addEventListener('dragend', photoContainerDragEndHandler);
    photoContainer.addEventListener('dragenter', photoContainerDragEnterHandler);
    photoContainer.addEventListener('dragleave', photoContainerDragLeaveHandler);
    photoContainer.addEventListener('dragover', photoContainerDragOverHandler);
    photoContainer.addEventListener('drop', photoContainerDropHandler);
    typeSelect.addEventListener('change', typeSelectChangeHanlder);
    timeInSelect.addEventListener('change', timeInSelectChangeHandler);
    timeOutSelect.addEventListener('change', timeOutSelectChangeHandler);
    roomsCountSelect.addEventListener('change', roomsCountSelectChangeHandler);
    capacitySelect.addEventListener('change', capacitySelectChangeHandler);
    adFormElement.addEventListener('submit', adFormElementSubmitHandler);

    adFormFields.forEach(function (formField) {
      formField.addEventListener('invalid', adFormFieldInvalidHandler);
      formField.addEventListener('blur', adFormFieldBlurHandler);
    });
  };

  addEventHandlers();

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
      avatarPreview.src = DEFAULT_AVATAR_FILE;
      deletePhotos();
      photoPreview.style = '';
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
