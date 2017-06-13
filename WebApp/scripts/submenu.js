class SubMenu {
    constructor(subMenuId, keyboardActivated, closeMenu) {
        this.onFocusOut = (evt) => {
            if (!this.subMenu.contains(evt.relatedTarget)) {
                this.close();
                this.closeMenu();
            }
        };
        this.closeMenu = closeMenu;
        this.subMenu = document.getElementById(subMenuId);
        if (keyboardActivated) {
            this.subMenu.classList.add("keyboardActivated");
            let tr = this.subMenu.querySelector("tr");
            this.focusTr(tr);
        }
        this.subMenu.addEventListener("focusout", this.onFocusOut);
        this.initializeMouseHandler();
    }
    onKeyDown() {
        let tr = this.subMenu.querySelector("tr.selected");
        let trs = Array.from(this.subMenu.querySelectorAll("tr.selectable"));
        var i = (trs).findIndex(n => n == tr);
        tr = trs[i + 1];
        if (!tr)
            tr = trs[0];
        this.clearSelection();
        this.focusTr(tr);
    }
    onKeyUp() {
        let tr = this.subMenu.querySelector("tr.selected");
        let trs = Array.from(this.subMenu.querySelectorAll("tr.selectable"));
        var i = (trs).findIndex(n => n == tr);
        tr = trs[i - 1];
        if (!tr)
            tr = trs[trs.length - 1];
        this.clearSelection();
        this.focusTr(tr);
    }
    onEnter() {
        let tr = this.subMenu.querySelector("tr.selected");
        if (tr)
            this.onExecute(tr);
    }
    onKey(key) {
        let accs = Array.from(this.subMenu.querySelectorAll(".accelerator"));
        let acc = accs.find(n => n.innerText.toLowerCase() == key);
        if (acc) {
            let tr = acc.parentElement.parentElement;
            if (tr)
                this.onExecute(tr);
        }
    }
    close() {
        this.clearSelection();
        this.subMenu.removeEventListener("focusout", this.onFocusOut);
    }
    initializeMouseHandler() {
        this.subMenu.onmousedown = evt => {
            var tr = evt.target.closest("tr");
            this.onExecute(tr);
        };
    }
    onExecute(tr) {
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
                var checker = tr.querySelector(".checker");
                if (checker.classList.contains("hidden"))
                    checker.classList.remove("hidden");
                else
                    checker.classList.add("hidden");
                break;
            case "menuDarkTheme":
                break;
            default:
                return;
        }
        this.close();
        this.closeMenu();
    }
    clearSelection() {
        Array.from(this.subMenu.querySelectorAll("tr")).forEach(n => n.classList.remove("selected"));
    }
    focusTr(tr) {
        tr.classList.add("selected");
        tr.focus();
    }
}
//# sourceMappingURL=submenu.js.map