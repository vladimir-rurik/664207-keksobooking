'use strict';

(function () {
  /**
   * Количество комнат, при котором жилье предназначено не для гостей
   * @const
   * @type {number}
   */
  var NON_GUEST_ROOM_COUNT = 100;

  var PropertyType = {
    PALACE: 'Дворец',
    FLAT: 'Квартира',
    HOUSE: 'Дом',
    BUNGALO: 'Бунгало'
  };

  var PropertyMinPrice = {
    PALACE: 10000,
    FLAT: 1000,
    HOUSE: 5000,
    BUNGALO: 0
  };

  var _adsData = [];

  window.data = {
    /**
     * Метод, возвращающий русское название типа жилья.
     * @param {string} propertyType - тип жилья по-английски
     * @return {string}
     */
    getPropertyType: function (propertyType) {
      return PropertyType[propertyType];
    },

    /**
     * Метод, возвращающий минимальную стоимость данного типа жилья.
     * @param {string} propertyType - тип жилья по-английски
     * @return {string}
     */
    getPropertyMinPrice: function (propertyType) {
      return PropertyMinPrice[propertyType];
    },

    /**
     * Метод, возвращающий количество комнат, при котором жилье предназначено не для гостей
     * @return {number}
     */
    getNonGuestRoomCount: function () {
      return NON_GUEST_ROOM_COUNT;
    },

    /**
     * Метод, возвращающий копию списка похожих объявлений.
     * @return {Array.<Object>}
     */
    getAds: function () {
      return _adsData.slice();
    },

    /**
     * Метод, сохраняющий список похожих объявлений.
     * @param {Array.<Object>} ads - массив объявлений
     */
    setAds: function (ads) {
      _adsData = ads;
    }
  };
})();
