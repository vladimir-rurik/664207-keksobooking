'use strict';

(function () {

  /**
   * Функция, возвращающая страницу в исходное состояние.
   */
  var resetPage = function () {
    window.map.reset();
    window.user_pin.resetPosition();
    window.form.reset();
  };

  resetPage();
})();
