'use strict';

(function () {
  var ENTER_KEYCODE = 13;

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
     * Метод, выполняющий перестановку элементов массива случайным образом.
     * @param {Array.<*>} items - массив элементов
     * @return {Array.<*>} - новый массив с переставленными элементами
     */
    shuffle: function (items) {
      var shuffledItems = items.slice();

      for (var i = shuffledItems.length; i > 1; i--) {
        var randomIndex = Math.floor(Math.random() * i);
        var itemCopy = shuffledItems[i - 1];
        shuffledItems[i - 1] = shuffledItems[randomIndex];
        shuffledItems[randomIndex] = itemCopy;
      }

      return shuffledItems;
    },

    /**
     * Метод, выбирающий случайное число из заданного промежутка.
     * @param {number} startNumber - начальное число промежутка
     * @param {number} endNumber - конечное число промежутка
     * @return {number} - случайное число из заданного промежутка,
     * включая startNumber и endNumber
     */
    getRandomNumber: function (startNumber, endNumber) {
      return Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
    },

    /**
     * Метод, выбирающий случайный элемент в массиве.
     * @param {Array.<*>} items - массив элементов
     * @return {*} - случайный элемент массива
     */
    getRandomItem: function (items) {
      return items[Math.floor(Math.random() * items.length)];
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
    }
  };
})();
