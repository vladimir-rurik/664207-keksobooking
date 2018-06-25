'use strict';

(function () {
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
   * Функция, создающая DOM-элемент, соответствующий метке на карте.
   * @callback renderItemCallback
   * @param {Object} ad - объект, описывающий объявление
   * @param {Object} pinTemplate - шаблон метки
   * @return {Object} - DOM-элемент
   */
  window.renderPin = function (ad, pinTemplate) {
    var pinElement = pinTemplate.cloneNode(true);
    var pinAvatar = pinElement.querySelector('img');

    pinElement.style.left = ad.location.x - PIN_WIDTH / 2 + 'px';
    pinElement.style.top = ad.location.y - PIN_HEIGHT + 'px';

    pinAvatar.src = ad.author.avatar;
    pinAvatar.alt = ad.offer.title;

    return pinElement;
  };
})();
