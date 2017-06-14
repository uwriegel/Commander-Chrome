var SubMenu = (function () {
    function SubMenu(subMenuId, keyboardActivated, closeMenu) {
        var _this = this;
        this.onFocusOut = function (evt) {
            if (!_this.subMenu.contains(evt.relatedTarget)) {
                _this.close();
                _this.closeMenu();
            }
        };
        this.closeMenu = closeMenu;
        this.subMenu = document.getElementById(subMenuId);
        if (keyboardActivated) {
            this.subMenu.classList.add("keyboardActivated");
            var tr = this.subMenu.querySelector("tr");
            this.focusTr(tr);
        }
        this.subMenu.addEventListener("focusout", this.onFocusOut);
        this.initializeMouseHandler();
        if (subMenuId == "submenu4") {
            var trCheck = document.querySelector("#menuShowHidden .checker");
            if (localStorage["showHidden"] == "true")
                trCheck.classList.remove("hidden");
            else
                trCheck.classList.add("hidden");
        }
    }
    SubMenu.prototype.onKeyDown = function () {
        var tr = this.subMenu.querySelector("tr.selected");
        var trs = Array.from(this.subMenu.querySelectorAll("tr.selectable"));
        var i = (trs).findIndex(function (n) { return n == tr; });
        tr = trs[i + 1];
        if (!tr)
            tr = trs[0];
        this.clearSelection();
        this.focusTr(tr);
    };
    SubMenu.prototype.onKeyUp = function () {
        var tr = this.subMenu.querySelector("tr.selected");
        var trs = Array.from(this.subMenu.querySelectorAll("tr.selectable"));
        var i = (trs).findIndex(function (n) { return n == tr; });
        tr = trs[i - 1];
        if (!tr)
            tr = trs[trs.length - 1];
        this.clearSelection();
        this.focusTr(tr);
    };
    SubMenu.prototype.onEnter = function () {
        var tr = this.subMenu.querySelector("tr.selected");
        if (tr)
            this.onExecute(tr);
    };
    SubMenu.prototype.onKey = function (key) {
        var accs = Array.from(this.subMenu.querySelectorAll(".accelerator"));
        var acc = accs.find(function (n) { return n.innerText.toLowerCase() == key; });
        if (acc) {
            var tr = acc.parentElement.parentElement;
            if (tr)
                this.onExecute(tr);
        }
    };
    SubMenu.prototype.close = function () {
        this.clearSelection();
        this.subMenu.removeEventListener("focusout", this.onFocusOut);
    };
    SubMenu.prototype.initializeMouseHandler = function () {
        var _this = this;
        this.subMenu.onmousedown = function (evt) {
            var tr = evt.target.closest("tr");
            _this.onExecute(tr);
        };
    };
    SubMenu.prototype.onExecute = function (tr) {
        switch (tr.id) {
            case "menuRename":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.executeRename(false);
                break;
            case "menuCopy":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.executeCopy();
                break;
            case "menuMove":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.executeMove();
                break;
            case "menuDelete":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.executeDelete();
                break;
            case "menuProperties":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.executeShowProperties();
                break;
            case "menuExit":
                close();
                break;
            case "menuFirst":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.gotoFirst();
                break;
            case "menuFavorites":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.showFavorites();
                break;
            case "menuSelectAll":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.selectAll();
                break;
            case "menuSelectNone":
                var focused = commanderInstance.getFocused();
                if (!focused)
                    return;
                focused.selectNone();
                break;
            case "menuShowHidden":
                commanderInstance.showHidden(localStorage["showHidden"] != "true");
                break;
            case "menuDarkTheme":
                break;
            default:
                return;
        }
        this.close();
        this.closeMenu();
    };
    SubMenu.prototype.clearSelection = function () {
        Array.from(this.subMenu.querySelectorAll("tr")).forEach(function (n) { return n.classList.remove("selected"); });
    };
    SubMenu.prototype.focusTr = function (tr) {
        tr.classList.add("selected");
        tr.focus();
    };
    return SubMenu;
}());
//# sourceMappingURL=submenu.js.map