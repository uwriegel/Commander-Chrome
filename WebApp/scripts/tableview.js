/*
* Listview mit mehreren Spalten
*/
var TableView = (function () {
    /**
     *
     * @param parent Das Elternelement, das die Tableview beinhaltet
     */
    function TableView(parent) {
        var _this = this;
        this.itemsCount = 0;
        /**
        * Index des aktuellen Eintrags in der Liste der Einträge (items)
        */
        this.currentItemIndex = 0;
        this.startPosition = 0;
        /**
        * Die Anzahl der Einträge, die dieses TableView in der momentanen Größe tatsächlich auf dem Bildschirm anzeigen kann
        */
        this.tableCapacity = -1;
        this.id = 'tableView-' + tableViewId++;
        this.tableView = document.createElement("div");
        this.tableView.classList.add('tableView');
        this.tableView.id = this.id;
        this.tableView.tabIndex = 1;
        parent.appendChild(this.tableView);
        this.scrollbar = new Scrollbar(parent, this.scroll.bind(this));
        this.table = document.createElement("table");
        this.table.classList.add('tableViewTable');
        this.tableView.appendChild(this.table);
        this.tableView.addEventListener("focusin", function (e) {
            if (_this.onFocus)
                _this.onFocus();
            _this.focus();
        });
        this.tableView.onkeydown = function (e) {
            switch (e.which) {
                case 13:
                    if (_this.onSelectedCallback)
                        _this.onSelectedCallback(_this.currentItemIndex, e.ctrlKey, e.altKey);
                    break;
                case 33:
                    _this.pageUp();
                    break;
                case 34:
                    _this.pageDown();
                    break;
                case 35:
                    if (!e.shiftKey)
                        _this.end();
                    break;
                case 36:
                    if (!e.shiftKey)
                        _this.pos1();
                    break;
                case 38:
                    _this.upOne();
                    break;
                case 40:
                    _this.downOne();
                    break;
                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        };
        this.tableView.addEventListener('mousemove', function (e) {
            console.log("Maus: " + e.clientX + ", " + e.clientY);
        });
        this.recentHeight = this.tableView.clientHeight;
        window.requestAnimationFrame(function () { return _this.resizeChecking(); });
        this.thead = document.createElement("thead");
        this.table.appendChild(this.thead);
        this.tbody = document.createElement("tbody");
        this.table.appendChild(this.tbody);
        this.tbody.addEventListener('mousewheel', function (evt) {
            var wheelEvent = evt;
            var delta = wheelEvent.wheelDelta / Math.abs(wheelEvent.wheelDelta) * 3;
            _this.scroll(_this.startPosition - delta);
        });
        this.tbody.ondblclick = function () {
            if (_this.onSelectedCallback)
                _this.onSelectedCallback(_this.currentItemIndex, false, false);
        };
        {
            var tr = document.createElement("tr");
            this.thead.appendChild(tr);
        }
        this.scrollbar.initialize(this);
        this.tableView.onclick = function (evt) {
            focus();
        };
        this.tbody.onclick = function (evt) {
            var tr = evt.target.closest("tr");
            var trs = _this.tbody.querySelectorAll("tr");
            var index;
            for (var i = 0; i < trs.length; i++) {
                if (trs[i] == tr) {
                    index = i;
                    break;
                }
            }
            _this.currentItemIndex = index + _this.startPosition;
            if (_this.onCurrentItemChanged)
                _this.onCurrentItemChanged(_this.currentItemIndex);
            tr.focus();
        };
    }
    Object.defineProperty(TableView.prototype, "Columns", {
        get: function () {
            return this.columnsControl;
        },
        set: function (value) {
            this.columnsControl = value;
            var theadrow = this.thead.querySelector('tr');
            theadrow.innerHTML = "";
            this.columnsControl.initializeEachColumn(function (item) {
                var th = document.createElement("th");
                th.innerHTML = item.item;
                if (item.class)
                    th.classList.add(item.class);
                theadrow.appendChild(th);
            });
            this.itemsViewModel.setColumns(value);
            this.columnsControl.initialize(this.tableView);
        },
        enumerable: true,
        configurable: true
    });
    TableView.prototype.setObservable = function (observable) {
        this.observableItems = observable;
        this.observableItems.registerObservation(this);
    };
    TableView.prototype.setItemsViewModel = function (itemsViewModel) {
        this.itemsViewModel = itemsViewModel;
    };
    TableView.prototype.setOnSelectedCallback = function (callback) {
        this.onSelectedCallback = callback;
    };
    TableView.prototype.setOnCurrentItemChanged = function (callback) {
        this.onCurrentItemChanged = callback;
    };
    TableView.prototype.setOnFocus = function (callback) {
        this.onFocus = callback;
    };
    TableView.prototype.getCurrentItemIndex = function () {
        return this.currentItemIndex;
    };
    /**
     * Setzen des Focuses
     * @returns true, wenn der Fokus gesetzt werden konnte
     */
    TableView.prototype.focus = function () {
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
        var index = this.currentItemIndex - this.startPosition;
        if (index >= 0 && index < this.tableCapacity) {
            var trs = this.tbody.querySelectorAll('tr');
            if (index < trs.length) {
                trs[index].focus();
                return true;
            }
        }
        this.tableView.focus();
        return false;
    };
    TableView.prototype.pos1 = function () {
        this.clearItems();
        this.displayItems(0);
        this.currentItemIndex = 0;
        this.tbody.querySelectorAll('tr')[0].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.downOne = function () {
        if (this.currentItemIndex == this.itemsCount - 1)
            return false;
        this.scrollIntoView();
        this.currentItemIndex++;
        if (this.currentItemIndex - this.startPosition >= this.tableCapacity) {
            this.tbody.querySelector('tr').remove();
            this.startPosition += 1;
            this.scrollbar.setPosition(this.startPosition);
            if (this.currentItemIndex < this.itemsCount - 1) {
                var node = this.itemsViewModel.insertItem(this.currentItemIndex + 1);
                this.tbody.appendChild(node);
            }
        }
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
        return true;
    };
    TableView.prototype.ItemsCleared = function () {
        this.currentItemIndex = 0;
        this.clearItems();
    };
    TableView.prototype.itemsChanged = function (lastCurrentIndex) {
        this.ItemsCleared();
        this.currentItemIndex = lastCurrentIndex;
        this.displayItems(0);
        if (this.tableView == document.activeElement)
            this.focus();
        this.scrollIntoView();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.updateItems = function () {
        var trs = this.tbody.querySelectorAll('tr');
        for (var i = 0; i < trs.length; i++) {
            this.itemsViewModel.updateItem(trs[i], i + this.startPosition);
        }
    };
    TableView.prototype.refreshSelection = function (itemIndex, isSelected) {
        var item = this.tbody.querySelectorAll('tr')[itemIndex - this.startPosition];
        if (isSelected)
            item.classList.add("selected");
        else
            item.classList.remove("selected");
    };
    TableView.prototype.isMouseWithin = function (x, y) {
        var rect = this.tableView.getBoundingClientRect();
        rect.left, rect.top, rect.width, rect.bottom;
        //console.log(`${x} ${y} ${rectObject.left} ${rectObject.top} ${rectObject.width} ${rectObject.bottom}`)
        var result = (x > rect.left && x < (rect.left + rect.width)
            && y > rect.top && y < (rect.top + rect.bottom));
        if (result)
            this.tableView.classList.add("highlight");
        else
            this.tableView.classList.remove("highlight");
        return result;
    };
    TableView.prototype.dragLeave = function () {
        this.tableView.classList.remove("highlight");
    };
    TableView.prototype.initializeRowHeight = function () {
        var node = this.itemsViewModel.insertMeasureItem();
        this.tbody.appendChild(node);
        var td = this.tbody.querySelector('td');
        this.rowHeight = td.clientHeight;
        this.clearItems();
    };
    TableView.prototype.calculateTableHeight = function () {
        if (this.rowHeight) {
            this.scrollbar.setOffsetTop(this.thead.offsetHeight);
            this.tableCapacity = Math.floor((this.tableView.offsetHeight - this.thead.offsetHeight) / this.rowHeight);
            if (this.tableCapacity < 0)
                this.tableCapacity = 0;
        }
        else
            this.tableCapacity = -1;
        this.scrollbar.itemsChanged(undefined, this.tableCapacity);
    };
    TableView.prototype.clearItems = function () {
        var hasFocus = this.tableView.contains(document.activeElement);
        this.tbody.innerHTML = '';
        if (hasFocus)
            this.tableView.focus();
    };
    TableView.prototype.displayItems = function (start) {
        this.startPosition = start;
        this.itemsCount = this.observableItems.getItemsCount();
        if (this.tableCapacity == -1) {
            this.initializeRowHeight();
            this.calculateTableHeight();
        }
        var end = Math.min(this.tableCapacity + 1 + this.startPosition, this.itemsCount);
        for (var i = this.startPosition; i < end; i++) {
            var node = this.itemsViewModel.insertItem(i);
            this.tbody.appendChild(node);
        }
        this.scrollbar.itemsChanged(this.itemsCount, this.tableCapacity, this.startPosition);
    };
    TableView.prototype.upOne = function () {
        if (this.currentItemIndex == 0)
            return;
        this.scrollIntoView();
        this.currentItemIndex--;
        if (this.currentItemIndex - this.startPosition < 0) {
            if (this.currentItemIndex + this.tableCapacity < this.itemsCount - 1) {
                var trs = this.tbody.querySelectorAll('tr');
                trs[trs.length - 1].remove();
            }
            if (this.currentItemIndex >= 0) {
                this.startPosition -= 1;
                this.scrollbar.setPosition(this.startPosition);
                var node = this.itemsViewModel.insertItem(this.currentItemIndex);
                this.tbody.insertBefore(node, this.tbody.firstChild);
            }
        }
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.pageUp = function () {
        if (this.currentItemIndex == 0)
            return;
        this.scrollIntoView();
        if (this.currentItemIndex - this.startPosition > 0)
            this.currentItemIndex = this.startPosition;
        else {
            this.currentItemIndex -= this.tableCapacity;
            if (this.currentItemIndex < 0)
                this.currentItemIndex = 0;
            this.clearItems();
            this.displayItems(this.currentItemIndex);
        }
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.pageDown = function () {
        if (this.currentItemIndex == this.itemsCount - 1)
            return;
        this.scrollIntoView();
        if (this.currentItemIndex - this.startPosition < this.tableCapacity - 1) {
            this.currentItemIndex = Math.min(this.tableCapacity, this.itemsCount) - 1 + this.startPosition;
            if (this.currentItemIndex >= this.itemsCount)
                this.currentItemIndex = this.itemsCount - 1;
        }
        else {
            this.currentItemIndex += this.tableCapacity;
            if (this.currentItemIndex >= this.itemsCount)
                this.currentItemIndex = this.itemsCount - 1;
            this.clearItems();
            this.displayItems(this.currentItemIndex - this.tableCapacity + 1);
        }
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.end = function () {
        this.clearItems();
        this.currentItemIndex = this.itemsCount - 1;
        var startPos = this.currentItemIndex - this.tableCapacity + 1;
        if (startPos < 0)
            startPos = 0;
        this.displayItems(startPos);
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        if (this.onCurrentItemChanged)
            this.onCurrentItemChanged(this.currentItemIndex);
    };
    TableView.prototype.scrollIntoView = function () {
        var selector = this.currentItemIndex - this.startPosition;
        if (selector < 0)
            this.scroll(this.currentItemIndex);
        else if (selector >= this.tableCapacity) {
            this.scroll(this.currentItemIndex);
            this.scroll(this.currentItemIndex - this.tableCapacity + 1);
        }
    };
    TableView.prototype.scroll = function (position) {
        if (this.itemsCount < this.tableCapacity)
            return;
        if (position < 0)
            position = 0;
        else if (position > this.itemsCount - this.tableCapacity)
            position = this.itemsCount - this.tableCapacity;
        this.startPosition = position;
        this.clearItems();
        this.displayItems(this.startPosition);
        var selector = this.currentItemIndex - this.startPosition;
        if (selector >= 0 && selector < this.tableCapacity)
            this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus();
        else
            this.tableView.focus();
    };
    TableView.prototype.resizeChecking = function () {
        var _this = this;
        if (this.tableView.clientHeight != this.recentHeight) {
            var isFocused = this.tableView.contains(document.activeElement);
            this.recentHeight = this.tableView.clientHeight;
            if (this.tableCapacity == -1)
                window.requestAnimationFrame(function () { return _this.resizeChecking(); });
            var tableCapacityOld = this.tableCapacity;
            this.calculateTableHeight();
            var itemsCountOld = Math.min(tableCapacityOld + 1, this.itemsCount - this.startPosition);
            var itemsCountNew = Math.min(this.tableCapacity + 1, this.itemsCount - this.startPosition);
            if (itemsCountNew < itemsCountOld) {
                for (i = itemsCountOld - 1; i >= itemsCountNew; i--)
                    this.tbody.children[i].remove();
            }
            else {
                for (var i = itemsCountOld; i < itemsCountNew; i++) {
                    var node = this.itemsViewModel.insertItem(i + this.startPosition);
                    this.tbody.appendChild(node);
                }
            }
            if (isFocused)
                this.focus();
        }
        window.requestAnimationFrame(function () { return _this.resizeChecking(); });
    };
    return TableView;
}());
var tableViewId = 1000;
//# sourceMappingURL=tableview.js.map