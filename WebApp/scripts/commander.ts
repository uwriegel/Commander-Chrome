// TODO: Weiterentwicklung
//
// Start as Admin im Hintergrund
// drives: Gespeicherte Ansichten
// F10 MENÜ Erklärung der Tastenkürzel oder Hilfe
// RegistryItems anzeigen
// NachRefresh Selektion erhalten
// Conflicts: conflict liste in die Focusable anhängen
// Rename auch von mehreren Dateien
// Mehrfach-Umbenennen

var Commander = (function ()
{
    var leftView: CommanderView
    var rightView: CommanderView

    document.addEventListener("DOMContentLoaded", function ready() {
        document.removeEventListener("DOMContentLoaded", ready, false)
        leftView = new CommanderView("leftView")
        rightView = new CommanderView("rightView")
        leftView.otherView = rightView
        rightView.otherView = leftView
        var viewer = Viewer()

        leftView.setOnCurrentItemChanged(currentItemChanged)
        rightView.setOnCurrentItemChanged(currentItemChanged)

        var focusedView = leftView
        leftView.setOnFocus(() => 
        {
            focusedView = leftView
        })
        rightView.setOnFocus(() =>
        {
            focusedView = rightView
        })

        var footer = document.getElementById("footer")

        leftView.initialize()
        rightView.initialize()
        leftView.focus()

        var gridElement = <HTMLDivElement>document.getElementById("grid")
        var viewerElement = document.getElementById("viewer")
        var grid = Grid(gridElement, document.getElementById("leftView"), document.getElementById("rightView"),
            <HTMLDivElement>document.getElementById("grip"), () => focusedView.focus())
        var vgrid = VerticalGrid(<HTMLDivElement>document.getElementById("vgrid"), gridElement, viewerElement,
            <HTMLDivElement>document.getElementById("vgrip"), () => focusedView.focus())

        viewerElement.onclick = function () {
            focusedView.focus()
        }

        document.onkeydown = function (evt) {
            switch (evt.which) {
                case 9: // TAB
                    var toFocus = focusedView == leftView ? rightView : leftView
                    toFocus.focus()
                    break
                case 72: // h
                    if (evt.ctrlKey)
                    {
                        toggleHidden()
                        break
                    }
                    else
                        return
                case 83: // s
                    if (evt.ctrlKey)
                    {
                        SavedViews.save({
                            left: leftView.currentDirectory,
                            right: rightView.currentDirectory
                        })
                        break
                    }
                    else
                        return
                case 112: // F1
                    if (evt.ctrlKey)
                    {
                        leftView.changeDirectory("SavedViews")
                        rightView.changeDirectory("SavedViews")
                    }
                    break
                case 114: // F3
                    vgrid.switchBottom()
                    break
                case 116: // F5
                    break
                case 121: // F10
                    break
                default:
                    return
            }
            evt.preventDefault()
        }

        function currentItemChanged(item, directory) {
            if (item) {
                var text = directory + '\\' + item.name
                footer.textContent = text
                viewer.selectionChanged(text)
            }
            else {
                footer.textContent = "Nichts selektiert"
                viewer.selectionChanged()
            }
        }
    }, false)

    function getCommanderView(id: string)
    {
        switch (id)
        {
            case "leftView":
                return leftView
            case "rightView":
                return rightView
        }        
    }

    function dragOver(x: number, y: number)
    {
        if (leftView.isMouseInTableView(x, y))
            console.log(`Drag: ${x}, ${y}`);
        if (rightView.isMouseInTableView(x, y))
            console.log(`Drag: ${x}, ${y}`);
    }

    function dragLeave()
    {
        leftView.dragLeave()
        rightView.dragLeave()
    }

    function drop(x: number, y: number, dragDropKind: DragDropKind, directory: string, items: Item[])
    {
        if (leftView.isMouseInTableView(x, y))
        {
            leftView.dragLeave()
            rightView.drop(dragDropKind, directory, items)
        }
        if (rightView.isMouseInTableView(x, y))
        {
            rightView.dragLeave()
            leftView.drop(dragDropKind, directory, items)
        }
    }

    async function toggleHidden()
    {
        await Connection.toggleHidden()
        leftView.refresh()
        rightView.refresh()
    }

    return {
        getCommanderView: getCommanderView,
        dragOver: dragOver,
        dragLeave: dragLeave,
        drop: drop
    }
})()

