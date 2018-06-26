'use strict';

(function () {
  var RESET_TIMEOUT = 1;

  var formElement = window.form.getElement();

  /**
   * Функция, возвращающая страницу в исходное состояние.
   */
  var resetPage = function () {
    window.map.reset();
    window.resetUserPinPosition();
    window.form.reset();
  };

  formElement.addEventListener('reset', function () {
    setTimeout(resetPage, RESET_TIMEOUT);
  });

  resetPage();
})();
