class SubMenu {
    constructor(subMenuId) {
        this.subMenu = document.getElementById(subMenuId);
        let trs = Array.from(this.subMenu.querySelectorAll("tr"));
        trs.forEach(n => {
            //            n.onmouseover = evt =>
            //            {
            //                this.clearSelection()
            ////                this.focusLi(<HTMLLIElement>evt.currentTarget)
            //            }
        });
        this.focusTr(trs[0]);
    }
    onKeyDown() {
        let tr = this.subMenu.querySelector("tr.selected + tr");
        if (!tr)
            tr = this.subMenu.querySelector("tr");
        this.clearSelection();
        this.focusTr(tr);
    }
    onKeyUp() {
        let tr = this.subMenu.querySelector("tr.selected");
        let trs = Array.from(this.subMenu.querySelectorAll("tr"));
        var i = (trs).findIndex(n => n == tr);
        tr = trs[i - 1];
        if (!tr)
            tr = trs[trs.length - 1];
        this.clearSelection();
        this.focusTr(tr);
    }
    close() {
        this.clearSelection();
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