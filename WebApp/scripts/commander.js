// TODO: Weiterentwicklung
//
// drives: Gespeicherte Ansichten
// F10 MENÜ Erklärung der Tastenkürzel oder Hilfe
// RegistryItems anzeigen
// NachRefresh Selektion erhalten
// Conflicts: conflict liste in die Focusable anhängen
// Rename auch von mehreren Dateien
// Mehrfach-Umbenennen
var Commander = (function () {
    var leftView;
    var rightView;
    document.addEventListener("DOMContentLoaded", function ready() {
        document.removeEventListener("DOMContentLoaded", ready, false);
        leftView = new CommanderView("leftView");
        rightView = new CommanderView("rightView");
        leftView.otherView = rightView;
        rightView.otherView = leftView;
        var viewer = Viewer();
        leftView.setOnCurrentItemChanged(currentItemChanged);
        rightView.setOnCurrentItemChanged(currentItemChanged);
        var focusedView = leftView;
        leftView.setOnFocus(() => {
            focusedView = leftView;
        });
        rightView.setOnFocus(() => {
            focusedView = rightView;
        });
        var footer = document.getElementById("footer");
        leftView.initialize();
        rightView.initialize();
        leftView.focus();
        var gridElement = document.getElementById("grid");
        var viewerElement = document.getElementById("viewer");
        var grid = Grid(gridElement, document.getElementById("leftView"), document.getElementById("rightView"), document.getElementById("grip"), () => focusedView.focus());
        var vgrid = VerticalGrid(document.getElementById("vgrid"), gridElement, viewerElement, document.getElementById("vgrip"), () => focusedView.focus());
        viewerElement.onclick = function () {
            focusedView.focus();
        };
        document.onkeydown = function (evt) {
            switch (evt.which) {
                case 9:
                    var toFocus = focusedView == leftView ? rightView : leftView;
                    toFocus.focus();
                    break;
                case 72:
                    if (evt.ctrlKey) {
                        toggleHidden();
                        break;
                    }
                    else
                        return;
                case 83:
                    if (evt.ctrlKey) {
                        SavedViews.save({
                            left: leftView.currentDirectory,
                            right: rightView.currentDirectory
                        });
                        break;
                    }
                    else
                        return;
                case 112:
                    if (evt.ctrlKey) {
                        leftView.changeDirectory("SavedViews");
                        rightView.changeDirectory("SavedViews");
                    }
                    break;
                case 114:
                    vgrid.switchBottom();
                    break;
                case 116:
                    break;
                default:
                    return;
            }
            evt.preventDefault();
        };
        function currentItemChanged(item, directory) {
            if (item) {
                var text = directory + '\\' + item.name;
                footer.textContent = text;
                viewer.selectionChanged(text);
            }
            else {
                footer.textContent = "Nichts selektiert";
                viewer.selectionChanged();
            }
        }
    }, false);
    function getCommanderView(id) {
        switch (id) {
            case "leftView":
                return leftView;
            case "rightView":
                return rightView;
        }
    }
    function dragOver(x, y) {
        if (leftView.isMouseInTableView(x, y))
            console.log(`Drag: ${x}, ${y}`);
        if (rightView.isMouseInTableView(x, y))
            console.log(`Drag: ${x}, ${y}`);
    }
    function dragLeave() {
        leftView.dragLeave();
        rightView.dragLeave();
    }
    function drop(x, y, files) {
        if (leftView.isMouseInTableView(x, y))
            leftView.drop(x, y, files);
        if (rightView.isMouseInTableView(x, y))
            rightView.drop(x, y, files);
    }
    async function toggleHidden() {
        await Connection.toggleHidden();
        leftView.refresh();
        rightView.refresh();
    }
    return {
        getCommanderView: getCommanderView,
        dragOver: dragOver,
        dragLeave: dragLeave,
        drop: drop
    };
})();
//# sourceMappingURL=commander.js.map