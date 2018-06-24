'use strict';

(function () {

  /**
   * Функция, возвращающая страницу в исходное состояние.
   */
  var resetPage = function () {
    window.map.reset();
    window.resetUserPinPosition();
    window.form.reset();
  };

  window.form.getElement().addEventListener('reset', function () {
    resetPage();
  });

  resetPage();
})();
