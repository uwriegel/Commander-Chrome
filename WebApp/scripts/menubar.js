class MenuBar {
    constructor() {
        this.menuBar = document.getElementById("menubar");
        this.menuBar.addEventListener("focusout", evt => {
            if (!(this.subMenuOpened && this.keyboardActivated) && !this.menuBar.contains(evt.relatedTarget))
                this.close();
        });
        this.initializeMouseHandler();
        this.initializeKeyHandler();
    }
    initializeMouseHandler() {
        this.menuBar.onmousedown = evt => {
            var li = evt.target.closest("li");
            var selected = false;
            if (li.classList.contains("selected"))
                selected = true;
            if (!this.isActive)
                this.setActive();
            this.subMenuOpened = true;
            this.clearSelection();
            if (!selected)
                this.focusLi(li);
            else {
                this.close();
                evt.stopPropagation();
                evt.preventDefault();
            }
        };
    }
    initializeKeyHandler() {
        document.addEventListener("keydown", evt => {
            if (!this.isActive && evt.which == 18) {
                this.menuBar.classList.add("keyboardActivated");
                this.keyboardActivated = true;
            }
            if (this.keyboardActivated && evt.which != 18) {
                let accs = Array.from(this.menuBar.querySelectorAll(".keyboardActivated .accelerator"));
                let acc = accs.find(n => n.innerText.toLowerCase() == evt.key);
                if (acc) {
                    if (!this.isActive)
                        this.acceleratorInitiated = true;
                    let li = acc.parentElement;
                    this.setActive();
                    this.setSubMenuOpened();
                    this.clearSelection();
                    this.focusLi(li);
                    evt.stopPropagation();
                    evt.preventDefault();
                    return;
                }
                else if (!this.isActive)
                    this.close();
            }
            if (!this.isActive)
                return;
            switch (evt.which) {
                case 9:
                    this.close();
                    break;
                case 18:
                    break;
                case 27:
                    this.close();
                    break;
                case 37:
                    {
                        if (this.openedSubMenu) {
                            this.openedSubMenu.close();
                            this.openedSubMenu = null;
                        }
                        let li = this.menuBar.querySelector("#menubar>li.selected");
                        let lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
                        var i = (lis).findIndex(n => n == li);
                        li = lis[i - 1];
                        if (!li)
                            li = lis[lis.length - 1];
                        this.clearSelection();
                        this.focusLi(li);
                    }
                    break;
                case 38:
                    if (this.openedSubMenu)
                        this.openedSubMenu.onKeyUp();
                    break;
                case 39:
                    {
                        if (this.openedSubMenu) {
                            this.openedSubMenu.close();
                            this.openedSubMenu = null;
                        }
                        let li = this.menuBar.querySelector("#menubar>li.selected + li");
                        if (!li)
                            li = this.menuBar.querySelector("#menubar>li");
                        this.clearSelection();
                        this.focusLi(li);
                    }
                    break;
                case 40:
                    {
                        if (evt.target.nodeName == "LI") {
                            this.keyboardActivated = true;
                            this.setSubMenuOpened();
                            let li = this.menuBar.querySelector("#menubar>li.selected");
                            this.focusLi(li);
                        }
                        else if (this.openedSubMenu)
                            this.openedSubMenu.onKeyDown();
                    }
                    break;
            }
            evt.stopPropagation();
            evt.preventDefault();
        }, true);
        document.onkeyup = evt => {
            switch (evt.which) {
                case 18:
                    if (!this.hasFocus && this.keyboardActivated) {
                        this.clearSelection();
                        this.setActive();
                        let li = this.menuBar.querySelector("#menubar>li:first-Child");
                        this.focusLi(li);
                    }
                    else if (this.acceleratorInitiated)
                        this.acceleratorInitiated = false;
                    else
                        this.close();
                    break;
            }
        };
    }
    setActive() {
        this.focusedView = commanderInstance.getFocused();
        let lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
        lis.forEach(n => {
            n.onmouseover = evt => {
                if (this.keyboardActivated) {
                    this.close();
                    var li = evt.target.closest("li");
                    var selected = false;
                    if (li.classList.contains("selected"))
                        selected = true;
                    if (!this.isActive)
                        this.setActive();
                    this.subMenuOpened = true;
                    this.clearSelection();
                    if (!selected)
                        this.focusLi(li);
                    else
                        this.close();
                    return;
                }
                this.clearSelection();
                this.focusLi(evt.currentTarget);
            };
        });
        this.hasFocus = true;
    }
    setSubMenuOpened() {
        this.menuBar.classList.add("subMenuOpened");
        this.subMenuOpened = true;
    }
    setSubMenuClosed() {
        this.menuBar.classList.remove("subMenuOpened");
        this.subMenuOpened = false;
    }
    clearSelection() {
        Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(n => n.classList.remove("selected"));
    }
    focusLi(li) {
        li.classList.add("selected");
        li.focus();
        this.isActive = true;
        if (!this.subMenuOpened)
            return;
        this.closeSubMenus();
        var subMenuId;
        switch (li.id) {
            case "menubar1":
                subMenuId = "submenu1";
                break;
            case "menubar2":
                subMenuId = "submenu2";
                break;
            case "menubar3":
                subMenuId = "submenu3";
                break;
            case "menubar4":
                subMenuId = "submenu3";
                break;
        }
        this.openSubMenu(li.offsetLeft, subMenuId);
    }
    close() {
        this.closeSubMenus();
        this.menuBar.classList.remove("keyboardActivated");
        this.keyboardActivated = false;
        this.clearSelection();
        this.hasFocus = false;
        this.isActive = false;
        this.acceleratorInitiated = false;
        this.focusedView.focus();
        this.setSubMenuClosed();
        if (this.openedSubMenu)
            this.openedSubMenu.close();
        this.openedSubMenu = null;
        let lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
        lis.forEach(n => n.onmouseover = null);
    }
    openSubMenu(offsetLeft, menuId) {
        let submenu = document.getElementById(menuId);
        submenu.style.left = `${offsetLeft}px`;
        submenu.classList.remove("hidden");
        if (this.subMenuOpened && this.keyboardActivated) {
            if (this.openedSubMenu)
                this.openedSubMenu.close();
            this.openedSubMenu = new SubMenu(menuId, () => this.close());
        }
    }
    closeSubMenus() {
        let subs = Array.from(document.getElementsByClassName("submenu"));
        subs.forEach(n => n.classList.add("hidden"));
    }
}
//# sourceMappingURL=menubar.js.map