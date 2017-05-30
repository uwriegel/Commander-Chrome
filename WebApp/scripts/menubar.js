class MenuBar {
    constructor() {
        this.menuBar = document.getElementById("menubar");
        this.menuBar.addEventListener("focusout", evt => {
            if (!this.menuBar.contains(evt.relatedTarget))
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
                case 39:
                    {
                        let li = this.menuBar.querySelector("#menubar>li.selected + li");
                        if (!li)
                            li = this.menuBar.querySelector("#menubar>li");
                        this.clearSelection();
                        this.focusLi(li);
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
                this.clearSelection();
                this.focusLi(evt.currentTarget);
            };
        });
        this.hasFocus = true;
    }
    clearSelection() {
        Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(n => n.classList.remove("selected"));
    }
    focusLi(li) {
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
            case "menubar4":
                this.openSubMenu(li.offsetLeft, "submenu4");
                break;
        }
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
        let lis = Array.from(this.menuBar.querySelectorAll("#menubar>li"));
        lis.forEach(n => n.onmouseover = null);
    }
    openSubMenu(offsetLeft, menuId) {
        let submenu = document.getElementById(menuId);
        submenu.style.left = `${offsetLeft}px`;
        submenu.classList.remove("hidden");
    }
    closeSubMenus() {
        let subs = Array.from(document.getElementsByClassName("submenu"));
        subs.forEach(n => n.classList.add("hidden"));
    }
}
//# sourceMappingURL=menubar.js.map