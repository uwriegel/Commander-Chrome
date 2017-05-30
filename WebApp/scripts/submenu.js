class SubMenu {
    constructor(subMenuId) {
        this.subMenu = document.getElementById(subMenuId);
        let trs = Array.from(this.subMenu.querySelectorAll("tr"));
        trs.forEach(n => {
            n.onmouseover = evt => {
                this.clearSelection();
                //                this.focusLi(<HTMLLIElement>evt.currentTarget)
            };
        });
    }
    clearSelection() {
        //      Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(n => n.classList.remove("selected"))
    }
}
//# sourceMappingURL=submenu.js.map