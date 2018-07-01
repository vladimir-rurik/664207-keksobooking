'use strict';

(function () {
  var ENTER_KEYCODE = 13;
  var ESC_KEYCODE = 27;
  var ERROR_TIMEOUT = 2000;
  var DEBOUNCE_INTERVAL = 500;
  var lastTimeout = null;

  window.util = {
    /**
     * Метод, проверяющий нажатие клавиши Enter
     * @param {Object} evt - объект события
     * @return {boolean}
     */
    isEnterEvent: function (evt) {
      return evt.keyCode === ENTER_KEYCODE;
    },

    /**
     * Метод, проверяющий нажатие клавиши Escape
     * @param {Object} evt - объект события
     * @return {boolean}
     */
    isEscEvent: function (evt) {
      return evt.keyCode === ESC_KEYCODE;
    },

    /**
     * Метод, отрисовывающий массив DOM-элементов.
     * @param {Array.<*>} dataList - массив, содержащий данные элементов
     * @param {Object} parentElement - родительский DOM-элемент, в котором будут отрисованы элементы
     * @param {Object} template - шаблон элемента
     * @param {renderItemCallback} renderItem - функция, создающая DOM-элемент
     * @return {Array.<Object>} - массив отрисованных DOM-элементов
     */
    renderElements: function (dataList, parentElement, template, renderItem) {
      var fragment = document.createDocumentFragment();
      var items = [];
      var i = 0;
      dataList.forEach(function (data) {
        items[i] = renderItem(data, template);
        fragment.appendChild(items[i]);
        i++;
      });
      parentElement.appendChild(fragment);

      return items;
    },

    /**
     * Метод, отрисовывающий сообщение об ошибке.
     * @callback onErrorCallback
     * @param {string} errorMessage - сообщение об ошибке
     */
    showError: function (errorMessage) {
      var node = document.createElement('div');
      node.classList.add('error');
      node.textContent = errorMessage;
      document.body.insertAdjacentElement('afterbegin', node);
      setTimeout(function () {
        node.remove();
      }, ERROR_TIMEOUT);
    },

    /**
     * Метод, устраняющий дребезг.
     * @param {debounceCallback} callback - функция обратного вызова
     */
    debounce: function (callback) {
      if (lastTimeout) {
        clearTimeout(lastTimeout);
      }
      lastTimeout = setTimeout(callback, DEBOUNCE_INTERVAL);
    }
  };
})();
