'use strict';

(function () {
  var RESET_TIMEOUT = 2;

  var formElement = window.form.getElement();

  /**
   * Функция, возвращающая страницу в исходное состояние.
   */
  var resetPage = function () {
    window.map.reset();
    window.map.disableFilters(true);
    window.map.disableFeatures(true);
    window.userPin.resetPosition();
    window.form.reset();
  };

  formElement.addEventListener('reset', function () {
    setTimeout(resetPage, RESET_TIMEOUT);
  });

  resetPage();
})();
