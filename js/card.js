'use strict';

(function () {
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
   * Функция, запоняющая DOM-элемент текстом.
   * @param {Object} element - DOM-элемент
   * @param {string} text - новый текст элемента
   */
  var fillTemplateWithText = function (element, text) {
    if (text) {
      element.textContent = text;
    } else {
      hideElement(element);
    }
  };

  /**
   * Функция, скрывающая DOM-элемент.
   * @param {Object} element - DOM-элемент
   */
  var hideElement = function (element) {
    element.classList.add('hidden');
  };

  window.card = {
    /**
     * Метод, отрисовывающий карточку объявления.
     * @param {Object} ad - объект, описывающий объявление
     * @param {Object} parentElement - родительский DOM-элемент
     * @param {Object} nextElement - DOM-элемент, перед которым будет отрисовано объявление
     * @param {Object} cardTemplate - шаблон объявления
     * @return {Object} - DOM-элемент
     */
    render: function (ad, parentElement, nextElement, cardTemplate) {
      var cardElement = cardTemplate.cloneNode(true);
      var featuresElement = cardElement.querySelector('.popup__features');
      var featureTemplate = featuresElement.querySelector('.popup__feature');
      var photosElement = cardElement.querySelector('.popup__photos');
      var photoTemplate = photosElement.querySelector('.popup__photo');
      var offer = ad.offer;

      fillTemplateWithText(cardElement.querySelector('.popup__title'), offer.title);
      fillTemplateWithText(cardElement.querySelector('.popup__text--address'), offer.address);
      fillTemplateWithText(cardElement.querySelector('.popup__text--price'), offer.price + '₽/ночь');
      fillTemplateWithText(cardElement.querySelector('.popup__type'), window.data.getPropertyType(offer.type));
      fillTemplateWithText(cardElement.querySelector('.popup__text--capacity'), offer.rooms + ' комнаты для ' + offer.guests + ' гостей');
      fillTemplateWithText(cardElement.querySelector('.popup__text--time'), 'Заезд после ' + offer.checkin + ', выезд до ' + offer.checkout);
      fillTemplateWithText(cardElement.querySelector('.popup__description'), offer.description);
      featuresElement.textContent = '';
      if (offer.features.length > 0) {
        window.util.renderElements(offer.features, featuresElement, featureTemplate, renderFeature);
      } else {
        hideElement(featuresElement);
      }
      photosElement.textContent = '';
      if (offer.photos.length > 0) {
        window.util.renderElements(offer.photos, photosElement, photoTemplate, renderPhoto);
      } else {
        hideElement(photosElement);
      }
      cardElement.querySelector('.popup__avatar').src = ad.author.avatar;
      parentElement.insertBefore(cardElement, nextElement);

      return cardElement;
    }
  };
})();
