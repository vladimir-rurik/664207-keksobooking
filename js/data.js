'use strict';

(function () {
  /**
   * Количество комнат, при котором жилье предназначено не для гостей
   * @const
   * @type {number}
   */
  var NON_GUEST_ROOM_COUNT = 100;

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

  var adsData = [];

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
      return adsData.slice();
    },

    /**
     * Метод, сохраняющий список похожих объявлений.
     * @param {Array.<Object>} ads - массив объявлений
     */
    setAds: function (ads) {
      adsData = ads;
    }
  };
})();
