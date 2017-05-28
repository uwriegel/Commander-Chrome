var Menu = (function () {
    function Menu() {
        var _this = this;
        this.menuBar = document.getElementById("menubar");
        this.menuBar.addEventListener("focusout", function (evt) {
            if (!_this.menuBar.contains(evt.relatedTarget))
                _this.close();
        });
        this.initializeMouseHandler();
        this.initializeKeyHandler();
    }
    Menu.prototype.initializeMouseHandler = function () {
        var _this = this;
        this.menuBar.onmousedown = function (evt) {
            var li = evt.target.closest("li");
            var selected = false;
            if (li.classList.contains("selected"))
                selected = true;
            if (!_this.isActive)
                _this.setActive();
            _this.clearSelection();
            if (!selected)
                _this.focusLi(li);
            else {
                _this.close();
                evt.stopPropagation();
                evt.preventDefault();
            }
        };
    };
    Menu.prototype.initializeKeyHandler = function () {
        var _this = this;
        document.addEventListener("keydown", function (evt) {
            if (!_this.isActive)
                return;
            switch (evt.which) {
                case 9: // TAB
                case 27:
                    _this.close();
                    break;
                case 37:
                    {
                        var li_1 = _this.menuBar.querySelector("li.selected");
                        var lis = Array.from(_this.menuBar.querySelectorAll("li"));
                        var i = (lis).findIndex(function (n) { return n == li_1; });
                        li_1 = lis[i - 1];
                        if (!li_1)
                            li_1 = lis[lis.length - 1];
                        _this.clearSelection();
                        _this.focusLi(li_1);
                    }
                    break;
                case 39:
                    {
                        var li = _this.menuBar.querySelector("li.selected + li");
                        if (!li)
                            li = _this.menuBar.querySelector("li");
                        _this.clearSelection();
                        _this.focusLi(li);
                    }
                    break;
            }
            evt.stopPropagation();
            evt.preventDefault();
        }, true);
        document.onkeyup = function (evt) {
            switch (evt.which) {
                case 18:
                    if (!_this.hasFocus) {
                        _this.clearSelection();
                        _this.setActive();
                        var li = _this.menuBar.querySelector("li:first-Child");
                        _this.focusLi(li);
                    }
                    else
                        _this.close();
                    break;
            }
        };
    };
    Menu.prototype.setActive = function () {
        this.focusedView = commanderInstance.getFocused();
        this.hasFocus = true;
    };
    Menu.prototype.clearSelection = function () {
        Array.from(this.menuBar.querySelectorAll("li")).forEach(function (n) { return n.classList.remove("selected"); });
    };
    Menu.prototype.focusLi = function (li) {
        li.classList.add("selected");
        li.focus();
        this.isActive = true;
    };
    Menu.prototype.close = function () {
        this.clearSelection();
        this.hasFocus = false;
        this.isActive = false;
        this.focusedView.focus();
    };
    return Menu;
}());
//# sourceMappingURL=menu.js.map