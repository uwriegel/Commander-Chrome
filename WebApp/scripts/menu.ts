class Menu
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
            if (!this.isActive)
                return;

            switch (evt.which)
            {
                case 9: // TAB
                case 27: // ESC
                    this.close()
                    break;
                case 37: // <-
                    {
                        let li = <HTMLLIElement>this.menuBar.querySelector("li.selected")
                        let lis = Array.from(this.menuBar.querySelectorAll("li"))
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
                        let li = <HTMLLIElement>this.menuBar.querySelector("li.selected + li")
                        if (!li)
                            li = <HTMLLIElement>this.menuBar.querySelector("li")
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
                        let li = <HTMLLIElement>this.menuBar.querySelector("li:first-Child")
                        this.focusLi(li)
                    }
                    else
                        this.close()
                    break;
            }
        }
    }

    private setActive()
    {
        this.focusedView = commanderInstance.getFocused()
        this.hasFocus = true
    }

    private clearSelection()
    {
        Array.from(this.menuBar.querySelectorAll("li")).forEach(n => n.classList.remove("selected"))
    }

    private focusLi(li: HTMLLIElement)
    {
        li.classList.add("selected")
        li.focus()
        this.isActive = true
    }

    private close()
    {
        this.clearSelection()
        this.hasFocus = false
        this.isActive = false
        this.focusedView.focus()
    }

    private menuBar: HTMLUListElement
    private hasFocus: boolean
    private focusedView: CommanderView
    private isActive: boolean
}