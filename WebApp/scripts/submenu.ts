class SubMenu
{
    constructor(subMenuId: string)
    {
        this.subMenu = <HTMLTableElement>document.getElementById(subMenuId)

        let trs = <HTMLTableRowElement[]>Array.from(this.subMenu.querySelectorAll("tr"))
        trs.forEach(n =>
        {
            n.onmouseover = evt =>
            {
                this.clearSelection()
//                this.focusLi(<HTMLLIElement>evt.currentTarget)
            }
        })
    }

    private clearSelection()
    {
  //      Array.from(this.menuBar.querySelectorAll("#menubar>li")).forEach(n => n.classList.remove("selected"))
    }

    private subMenu: HTMLTableElement
}