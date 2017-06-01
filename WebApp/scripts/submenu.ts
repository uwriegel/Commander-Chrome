class SubMenu
{
    constructor(subMenuId: string, closeMenu: () => void)
    {
        this.closeMenu = closeMenu
        this.subMenu = <HTMLTableElement>document.getElementById(subMenuId)
        this.subMenu.classList.add("keyboardActivated")
        let tr = this.subMenu.querySelector("tr")
        this.focusTr(tr)
        this.subMenu.addEventListener("focusout", this.onFocusOut)
    }

    onKeyDown()
    {
        let tr = <HTMLTableRowElement>this.subMenu.querySelector("tr.selected")
        let trs = <HTMLTableRowElement[]>Array.from(this.subMenu.querySelectorAll("tr.selectable"))
        var i = (trs).findIndex(n => n == tr)
        tr = trs[i + 1]
        if (!tr)
            tr = trs[0]
        this.clearSelection()
        this.focusTr(tr)
    }

    onKeyUp()
    {
        let tr = <HTMLTableRowElement>this.subMenu.querySelector("tr.selected")
        let trs = <HTMLTableRowElement[]>Array.from(this.subMenu.querySelectorAll("tr.selectable"))
        var i = (trs).findIndex(n => n == tr)
        tr = trs[i - 1]
        if (!tr)
            tr = trs[trs.length - 1]
        this.clearSelection()
        this.focusTr(tr)
    }

    close()
    {
        this.clearSelection()
        this.subMenu.removeEventListener("focusout", this.onFocusOut)
    }

    private onFocusOut = (evt: Event) =>
    {
        if (!this.subMenu.contains((<any>evt).relatedTarget))
        {
            this.close()
            this.closeMenu()
        }
    }

    private clearSelection()
    {
        Array.from(this.subMenu.querySelectorAll("tr")).forEach(n => n.classList.remove("selected"))
    }

    private focusTr(tr: HTMLTableRowElement)
    {
        tr.classList.add("selected")
        tr.focus()
    }

    private subMenu: HTMLTableElement
    private closeMenu: () => void
}
