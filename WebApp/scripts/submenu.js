class SubMenu {
    constructor(subMenuId, closeMenu) {
        this.onFocusOut = (evt) => {
            if (!this.subMenu.contains(evt.relatedTarget)) {
                this.close();
                this.closeMenu();
            }
        };
        this.closeMenu = closeMenu;
        this.subMenu = document.getElementById(subMenuId);
        this.subMenu.classList.add("keyboardActivated");
        let tr = this.subMenu.querySelector("tr");
        this.focusTr(tr);
        this.subMenu.addEventListener("focusout", this.onFocusOut);
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
    close() {
        this.clearSelection();
        this.subMenu.removeEventListener("focusout", this.onFocusOut);
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