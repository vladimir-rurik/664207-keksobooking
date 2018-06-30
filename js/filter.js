'use strict';

(function () {
  var filtersForm = window.map.getElement().querySelector('.map__filters');
  var filterElements = filtersForm.querySelectorAll('.map__filter, .map__checkbox');

  var typeFilter = filtersForm.querySelector('#housing-type');
  var priceFilter = filtersForm.querySelector('#housing-price');
  var roomsFilter = filtersForm.querySelector('#housing-rooms');
  var guestsFilter = filtersForm.querySelector('#housing-guests');
  var featuresFilters = filtersForm.querySelectorAll('.map__checkbox');

  var Price = {
    LOW: 10000,
    HIGH: 50000
  };

  /** Функция, определяющая диапазон, в который попадает цена.
   * @param {number} price - стоимость жилья
   * @return {string} - ценовой диапазон
   */
  var getPriceRange = function (price) {
    if (price < Price.LOW) {
      return 'low';
    }
    return price < Price.HIGH ? 'middle' : 'high';
  };

  /** Функция, определяющая, выбран ли определенный фильтр
   * @param {Object} selectElement - DOM-элемент фильтра
   * @return {boolean}
   */
  var isNotSelected = function (selectElement) {
    return selectElement.value === 'any';
  };

  /** Функция, проверяющая, удовлетворяет ли данное объявление всем критериям фильтров
   * @param {Object} offer - свойство offer объявления
   * @return {boolean}
   */
  var passesFilters = function (offer) {
    return (isNotSelected(typeFilter) || offer.type === typeFilter.value)
    && (isNotSelected(priceFilter) || getPriceRange(offer.price) === priceFilter.value)
    && (isNotSelected(roomsFilter) || offer.rooms === parseInt(roomsFilter.value, 10))
    && (isNotSelected(guestsFilter) || offer.guests === parseInt(guestsFilter.value, 10))
    && [].every.call(featuresFilters, function (feature) {
      return !(feature.checked) || offer.features.includes(feature.value);
    });
  };

  /** Обработчик события изменения фильтра
   */
  var filterChangeHandler = function () {
    var filteredData = window.data.getNotices().filter(function (notice) {
      return passesFilters(notice.offer);
    });
    window.util.debounce(function () {
      window.map.refreshPins(filteredData);
    });
  };

  [].forEach.call(filterElements, function (filterElement) {
    filterElement.addEventListener('change', filterChangeHandler);
  });
})();
