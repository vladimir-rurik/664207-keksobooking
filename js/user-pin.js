'use strict';

(function () {
  var userPinElement = window.map.getElement().querySelector('.map__pin--main');
  var addressInput = window.form.getElement().querySelector('#address');

  /**
   * Пользовательский пин.
   * @type {Object}
   */
  var userPin = {
    MIN_X: 0,
    MAX_X: window.map.getElement().offsetWidth,
    MIN_Y: window.map.getMinY(),
    MAX_Y: window.map.getMaxY(),
    INITIAL_LEFT: userPinElement.offsetLeft,
    INITIAL_TOP: userPinElement.offsetTop,
    POINT_SHIFT: 16,
    addressX: null,
    addressY: null,
    width: userPinElement.offsetWidth,
    height: userPinElement.offsetHeight,

    /**
     * Метод, возвращающий поправку при расчете x-координаты метки или ее адреса.
     * @return {number}
     */
    getShiftX: function () {
      return this.width / 2;
    },

    /**
     * Метод, возвращающий поправку при расчете y-координаты метки или ее адреса,
     * в зависимости от состояния метки. Если метка находится на неактивной странице,
     * то ее адресом являются координаты центра, в противном случае адресом являются
     * координаты острого конца.
     * @return {number}
     */
    getShiftY: function () {
      return window.map.isActive ? (this.height + this.POINT_SHIFT) : (this.height / 2);
    },

    /**
     * Метод, устанавливающий исходный адрес метки.
     */
    resetAddress: function () {
      this.addressX = this.INITIAL_LEFT + this.getShiftX();
      this.addressY = this.INITIAL_TOP + this.getShiftY();
    },

    /**
     * Метод, устанавливающий адрес метки по заданным координатам.
     * Если координаты метки выходят за границы допустимых значений, то
     * устанавливается минимально или максимально допустимое значение
     * @param {number} newAddressX - x-координата острого конца или середины пина
     * @param {number} newAddressY - y-координата острого конца или середины пина
     */
    setAddress: function (newAddressX, newAddressY) {
      this.addressX = Math.max(this.MIN_X, Math.min(this.MAX_X, newAddressX));
      this.addressY = Math.max(this.MIN_Y, Math.min(this.MAX_Y, newAddressY));
    }
  };

  /**
   * Начальные координаты указателя мыши при передвижении пина.
   * @type {Object}
   */
  var startPoint = {
    x: null,
    y: null
  };

  /**
   * Функция, сохраняющая начальные координаты указателя мыши при перемещении метки.
   * @param {number} startX - x-координата указателя мыши
   * @param {number} startY - y-координата указателя мыши
   */
  var setStartPoint = function (startX, startY) {
    startPoint.x = startX;
    startPoint.y = startY;
  };

  /**
   * Функция, устанавливающая адрес острого конца (или середины) метки пользователя
   * в поле ввода.
   */
  var setAddressField = function () {
    addressInput.value = userPin.addressX + ', ' + userPin.addressY;
  };

  /**
   * Функция, задающая позицию метки пользователя на карте в зависимости от
   * координат, указанных в поле ввода адреса.
   */
  var setUserPinPosition = function () {
    userPinElement.style.left = (userPin.addressX - userPin.getShiftX()) + 'px';
    userPinElement.style.top = (userPin.addressY - userPin.getShiftY()) + 'px';
  };

  /**
   * Функция, подготавливающая метку пользователя к перемещению.
   * @param {number} startX - начальная x-координата указателя мыши
   * @param {number} startY - начальная y-координата указателя мыши
   */
  var startMovingUserPin = function (startX, startY) {
    setStartPoint(startX, startY);

    document.addEventListener('mousemove', documentMouseMoveHandler);
    document.addEventListener('mouseup', documentMouseUpHandler);
  };

  /**
   * Функция, перемещающая метку пользователя вслед за указателем мыши.
   * @param {number} endX - конечная x-координата указателя мыши
   * @param {number} endY - конечная y-координата указателя мыши
   */
  var moveUserPinTo = function (endX, endY) {
    var mouseShift = {
      x: endX - startPoint.x,
      y: endY - startPoint.y
    };

    userPin.setAddress(userPin.addressX + mouseShift.x, userPin.addressY + mouseShift.y);
    setAddressField();
    setUserPinPosition();
    setStartPoint(endX, endY);
  };

  /**
   * Функция, завершающая перемещение метки пользователя
   */
  var finishMovingUserPin = function () {
    if (!window.map.isActive) {
      window.form.enable();
      window.map.enable();
    }
    setUserPinPosition();
    document.removeEventListener('mousemove', documentMouseMoveHandler);
    document.removeEventListener('mouseup', documentMouseUpHandler);
  };

  /**
   * Обработчик перемещения мыши
   * @param {Object} evt - объект события
   */
  var documentMouseMoveHandler = function (evt) {
    evt.preventDefault();
    moveUserPinTo(evt.clientX, evt.clientY);
  };

  /**
   * Обработчик отжатия мыши
   * @param {Object} evt - объект события
   */
  var documentMouseUpHandler = function (evt) {
    evt.preventDefault();
    finishMovingUserPin();
  };

  userPinElement.addEventListener('mousedown', function (evt) {
    evt.preventDefault();
    startMovingUserPin(evt.clientX, evt.clientY);
  });

  /**
   * Функция, возвращающая метку пользователя в исходное положение
   */
  window.resetUserPinPosition = function () {
    userPin.resetAddress();
    setAddressField();
    setUserPinPosition();
  };
})();
