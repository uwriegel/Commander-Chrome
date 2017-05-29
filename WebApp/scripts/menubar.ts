
class MenuBar
{
    constructor()
    {
        this.menuBar = <HTMLUListElement>document.getElementById("menubar")
        this.menuBar.addEventListener("focusout", evt =>
        {
            if (!this.menuBar.contains((<any>evt).relatedTarget))
                this.close()
        })

        this.initializeMouseHandler()
        this.initializeKeyHandler()
    }

    private initializeMouseHandler()
    {
        this.menuBar.onmousedown = evt =>
        {
            var li = <HTMLLIElement>(<HTMLElement>evt.target).closest("li")
            var selected = false
            if (li.classList.contains("selected"))
                selected = true

            if (!this.isActive)
                this.setActive()

            this.clearSelection()
            if (!selected)
                this.focusLi(li)
            else
            {
                this.close()
                evt.stopPropagation()
                evt.preventDefault()
            }
        }
    }

    private initializeKeyHandler()
    {
        document.addEventListener("keydown", evt =>
        {
            if (!this.isActive && evt.which == 18) // Alt
            {
                this.menuBar.classList.add("keyboardActivated")
                this.keyboardActivated = true;
            }

            if (this.keyboardActivated && evt.which != 18) // Alt
            {
                let accs = <HTMLSpanElement[]>Array.from(this.menuBar.querySelectorAll(".keyboardActivated .accelerator"))
                let acc = accs.find(n => n.innerText.toLowerCase() == evt.key)
                if (acc)
                {
                    this.acceleratorInitiated = true
                    let li = <HTMLLIElement>acc.parentElement
                    this.setActive()
                    this.clearSelection()
                    this.focusLi(li)
                }
            }
            
            if (!this.isActive)
                return;

            switch (evt.which)
            {
                case 9: // TAB
                    this.close()
                    break;
                case 27: // ESC
                    this.close()
                    break;
                case 37: // <-
                    {
                        let li = <HTMLLIElement>this.menuBar.querySelector("#menubar>li.selected")
                        let lis = <HTMLLIElement[]>Array.from(this.menuBar.querySelectorAll("#menubar>li"))
                        var i = (lis).findIndex(n => n == li)
                        li = lis[i-1]
                        if (!li)
                            li = lis[lis.length - 1]
                        this.clearSelection()
                        this.focusLi(li)
                    }
                    break;
                case 39:// ->
                    {
                        let li = <HTMLLIElement>this.menuBar.querySelector("#menubar>li.selected + li")
                        if (!li)
                            li = <HTMLLIElement>this.menuBar.querySelector("#menubar>li")
                        this.clearSelection()
                        this.focusLi(li)
                    }
                    break;
            }
            evt.stopPropagation()
            evt.preventDefault()
        }, true)

        document.onkeyup = evt =>
        {
            switch (evt.which)
            {
                case 18: // alt
                    if (!this.hasFocus)
                    {
                        this.clearSelection()
                        this.setActive()
                        let li = <HTMLLIElement>this.menuBar.querySelector("#menubar>li:first-Child")
                        this.focusLi(li)
                    }
                    else if (this.acceleratorInitiated)
                        this.acceleratorInitiated = false
                    else
                        this.close()
                    break;
            }
        }
    }

    private setActive()
    {
        this.focusedView = commanderInstance.getFocused()
        let lis = <HTMLLIElement[]>Array.from(this.menuBar.querySelectorAll("#menubar>li"))
        lis.forEach(n => 
        {
            n.onmouseover = evt =>
            {
                this.clearSelection()
                this.focusLi(<HTMLLIElement>evt.currentTarget)
            }
        })
        this.hasFocus = true
    }

    private clearSelection()
    {
        Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(n => n.classList.remove("selected"))
    }

    private focusLi(li: HTMLLIElement)
    {
        li.classList.add("selected")
        li.focus()
        this.isActive = true

        this.closeSubMenus()

        switch (li.id)
        {
            case "menubar1":
                this.openSubMenu(li.offsetLeft, "submenu1")
                break;
            case "menubar2":
                this.openSubMenu(li.offsetLeft, "submenu2")
                break;
            case "menubar3":
                this.openSubMenu(li.offsetLeft, "submenu3")
                break;
        }
    }

    private close()
    {
        this.closeSubMenus()
        this.menuBar.classList.remove("keyboardActivated")
        this.keyboardActivated = false;
        this.clearSelection()
        this.hasFocus = false
        this.isActive = false
        this.acceleratorInitiated = false
        this.focusedView.focus()
        let lis = <HTMLLIElement[]>Array.from(this.menuBar.querySelectorAll("#menubar>li"))
        lis.forEach(n => n.onmouseover = null)
    }

    private openSubMenu(offsetLeft: number, menuId: string)
    {
        let submenu = document.getElementById(menuId)
        submenu.style.left = `${offsetLeft}px`
        submenu.classList.remove("hidden")

    }

    private closeSubMenus()
    {
        let subs = Array.from(document.getElementsByClassName("submenu"))
        subs.forEach(n => n.classList.add("hidden"))
    }

    private menuBar: HTMLUListElement
    private hasFocus: boolean
    private focusedView: CommanderView
    private isActive: boolean
    private keyboardActivated: boolean
    private acceleratorInitiated: boolean
}