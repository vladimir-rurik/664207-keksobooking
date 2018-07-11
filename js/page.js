'use strict';

(function () {

  /**
   * Функция, возвращающая страницу в исходное состояние.
   */
  var resetPage = function () {
    window.map.reset();
    window.userPin.resetPosition();
    window.form.reset();
  };

  resetPage();
})();
