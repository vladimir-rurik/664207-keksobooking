'use strict';

(function () {
  var YCoordinate = {
    MIN: 150,
    MAX: 500
  };

  /**
   * Количество похожих объявлений
   * @const
   * @type {number}
   */
  var MAX_ADS_ON_PAGE_COUNT = 5;

  var mapElement = document.querySelector('.map');
  var mapPinsElement = mapElement.querySelector('.map__pins');
  var mapPinTemplate = document.querySelector('template').content.querySelector('.map__pin');
  var mapCardTemplate = document.querySelector('template').content.querySelector('.map__card');
  var mapFiltersElement = mapElement.querySelector('.map__filters-container');
  var mapFilters = document.querySelectorAll('.map__filter');
  var mapFeatures = document.querySelectorAll('.map__checkbox');

  var _activeCard = null;
  var _pins = [];

  /**
   * Функция, открывающая карточку объявления.
   * @param {Object} ad - объект, описывающий объявление
   */
  var openCard = function (ad) {
    closeActiveCard();
    _activeCard = window.card.render(ad, mapElement, mapFiltersElement, mapCardTemplate);

    var closeButton = _activeCard.querySelector('.popup__close');

    closeButton.addEventListener('click', function () {
      closeActiveCard();
    });
    closeButton.addEventListener('keydown', function (evt) {
      if (window.util.isEnterEvent(evt)) {
        closeActiveCard();
      }
    });
  };

  /**
   * Функция, закрывающая текущую карточку объявления.
   */
  var closeActiveCard = function () {
    if (_activeCard) {
      _activeCard.remove();
    }
  };

  /**
   * Функция, отрисовывающая на карте метки похожих объявлений.
   * @param {Array.<Object>} ads - массив объявлений
   */
  var renderPins = function (ads) {
    _pins = window.util.renderElements(ads, mapPinsElement, mapPinTemplate, window.pin.render);

    ads.forEach(function (ad, index) {
      _pins[index].addEventListener('click', function () {
        openCard(ad);
      });

      _pins[index].addEventListener('keydown', function (evt) {
        if (window.util.isEnterEvent(evt)) {
          openCard(ad);
        }
      });
    });
  };

  /**
   * Функция, удаляющая с карты метки похожих объявлений.
   */
  var deletePins = function () {
    _pins.forEach(function (pin) {
      pin.remove();
    });
  };

  /**
   * Функция, сбрасывающая (очищающая) фильтры-селекторы
   */
  var clearFilters = function () {
    mapFilters.forEach(function (mapFilter) {
      mapFilter.selectedIndex = 0;
    });
  };

  /**
   * Функция, сбрасывающая (очищающая) фильтры-кнопки
   */
  var clearFeatures = function () {
    mapFeatures.forEach(function (mapFeature) {
      mapFeature.checked = false;
    });
  };

  /** функция показа объявлений
   * @param {Array.<Object>} ads - массив объявлений
   */
  var showAds = function (ads) {
    window.data.setAds(ads);
    var adsSelection = ads.slice(0, MAX_ADS_ON_PAGE_COUNT);
    renderPins(adsSelection);
    mapElement.classList.remove('map--faded');
  };

  /**
   * Обработчик ESC клавиши на странице
   * @param {Object} evt - объект события
   */
  var documentKeyDownEscHandler = function (evt) {
    if (window.util.isEscEvent(evt) && evt.target.tagName.toLowerCase() !== 'select') {
      closeActiveCard();
    }
  };

  document.addEventListener('keydown', documentKeyDownEscHandler);

  window.map = {
    isActive: false,

    /**
     * Метод, возвращающий DOM-элемент карты.
     * @return {Object}
     */
    getElement: function () {
      return mapElement;
    },

    /**
     * Метод, возвращающий минимально возможную y-координату метки на карте.
     * @return {number}
     */
    getMinY: function () {
      return YCoordinate.MIN;
    },

    /**
     * Метод, возвращающий максимально возможную y-координату метки на карте.
     * @return {number}
     */
    getMaxY: function () {
      return YCoordinate.MAX;
    },

    /**
     * Метод, обновляющий метки на карте.
     * @param {Array.<Object>} ads - массив объявлений
     */
    refreshPins: function (ads) {
      closeActiveCard();
      deletePins();
      var adsSelection = ads.slice(0, MAX_ADS_ON_PAGE_COUNT);
      renderPins(adsSelection);
    },

    /**
     * Метод, возвращающий карту в исходное состояние.
     */
    reset: function () {
      closeActiveCard();
      deletePins();
      clearFilters();
      clearFeatures();
      mapElement.classList.add('map--faded');
      this.isActive = false;
    },

    /**
     * Метод, переводящий карту в активный режим.
     */
    enable: function () {
      var ads = window.data.getAds();
      // используем кэш, чтобы сократить затратные серверные запросы
      if (ads.length) {
        showAds(ads);
      } else {
        window.backend.getData(showAds, window.util.showError);
      }
      this.isActive = true;
    },

    /**
     * Функция, ставящая/снимающая блокировку с фильтра-селектора
     * @param {boolean} isDisabled - блокировать или нет
     */
    disableFilters: function (isDisabled) {
      mapFilters.forEach(function (mapFilter) {
        mapFilter.disabled = isDisabled;
      });
    },

    /**
     * Функция, ставящая/снимающая блокировку с фильтра-кнопки
     * @param {boolean} isDisabled - блокировать или нет
     */
    disableFeatures: function (isDisabled) {
      mapFeatures.forEach(function (mapFeature) {
        mapFeature.disabled = isDisabled;
      });
    }
  };

})();
