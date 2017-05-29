var MenuBar = (function () {
    function MenuBar() {
        var _this = this;
        this.menuBar = document.getElementById("menubar");
        this.menuBar.addEventListener("focusout", function (evt) {
            if (!_this.menuBar.contains(evt.relatedTarget))
                _this.close();
        });
        this.initializeMouseHandler();
        this.initializeKeyHandler();
    }
    MenuBar.prototype.initializeMouseHandler = function () {
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
    MenuBar.prototype.initializeKeyHandler = function () {
        var _this = this;
        document.addEventListener("keydown", function (evt) {
            if (!_this.isActive && evt.which == 18) {
                _this.menuBar.classList.add("keyboardActivated");
                _this.keyboardActivated = true;
            }
            if (!_this.isActive && _this.keyboardActivated && evt.which != 18) {
                var accs = Array.from(_this.menuBar.querySelectorAll(".keyboardActivated .accelerator"));
                var acc = accs.find(function (n) { return n.innerText.toLowerCase() == evt.key; });
                if (acc) {
                    _this.acceleratorInitiated = true;
                    var li = acc.parentElement;
                    _this.setActive();
                    _this.clearSelection();
                    _this.focusLi(li);
                    evt.stopPropagation();
                    evt.preventDefault();
                    return;
                }
                else
                    _this.close();
            }
            if (!_this.isActive)
                return;
            switch (evt.which) {
                case 9:
                    _this.close();
                    break;
                case 18:
                    break;
                case 27:
                    _this.close();
                    break;
                case 37:
                    {
                        var li_1 = _this.menuBar.querySelector("#menubar>li.selected");
                        var lis = Array.from(_this.menuBar.querySelectorAll("#menubar>li"));
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
                        var li = _this.menuBar.querySelector("#menubar>li.selected + li");
                        if (!li)
                            li = _this.menuBar.querySelector("#menubar>li");
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
                    if (!_this.hasFocus && _this.keyboardActivated) {
                        _this.clearSelection();
                        _this.setActive();
                        var li = _this.menuBar.querySelector("#menubar>li:first-Child");
                        _this.focusLi(li);
                    }
                    else if (_this.acceleratorInitiated)
                        _this.acceleratorInitiated = false;
                    else
                        _this.close();
                    break;
            }
        };
    };
    MenuBar.prototype.setActive = function () {
        var _this = this;
        this.focusedView = commanderInstance.getFocused();
        var lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
        lis.forEach(function (n) {
            n.onmouseover = function (evt) {
                _this.clearSelection();
                _this.focusLi(evt.currentTarget);
            };
        });
        this.hasFocus = true;
    };
    MenuBar.prototype.clearSelection = function () {
        Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(function (n) { return n.classList.remove("selected"); });
    };
    MenuBar.prototype.focusLi = function (li) {
        li.classList.add("selected");
        li.focus();
        this.isActive = true;
        this.closeSubMenus();
        switch (li.id) {
            case "menubar1":
                this.openSubMenu(li.offsetLeft, "submenu1");
                break;
            case "menubar2":
                this.openSubMenu(li.offsetLeft, "submenu2");
                break;
            case "menubar3":
                this.openSubMenu(li.offsetLeft, "submenu3");
                break;
        }
    };
    MenuBar.prototype.close = function () {
        this.closeSubMenus();
        this.menuBar.classList.remove("keyboardActivated");
        this.keyboardActivated = false;
        this.clearSelection();
        this.hasFocus = false;
        this.isActive = false;
        this.acceleratorInitiated = false;
        this.focusedView.focus();
        var lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
        lis.forEach(function (n) { return n.onmouseover = null; });
    };
    MenuBar.prototype.openSubMenu = function (offsetLeft, menuId) {
        var submenu = document.getElementById(menuId);
        submenu.style.left = offsetLeft + "px";
        submenu.classList.remove("hidden");
    };
    MenuBar.prototype.closeSubMenus = function () {
        var subs = Array.from(document.getElementsByClassName("submenu"));
        subs.forEach(function (n) { return n.classList.add("hidden"); });
    };
    return MenuBar;
}());
//# sourceMappingURL=menubar.js.map