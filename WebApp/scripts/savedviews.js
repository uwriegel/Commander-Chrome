var SavedViews = (function () {
    function save(savedView) {
        var savedViews;
        var json = localStorage["SavedViews"];
        if (json) {
            savedViews = JSON.parse(json);
            if (savedViews.some(n => {
                return n.left == savedView.left && n.right == savedView.right;
            }))
                return;
        }
        else
            savedViews = [];
        savedViews.push(savedView);
        localStorage["SavedViews"] = JSON.stringify(savedViews);
    }
    /**
    * Abfrage der gespeicherten Ansichten
    * @param commanderId Die id der zugehörigen CommanderView
    * @param lastCurrentDir Das Verzeichnis, welches durch dieses ersetzt werden soll
    */
    function getItems(commanderId, lastCurrentDir) {
        return {
            currentDirectory: "SavedViews",
            items: [{
                    imageUrl: "images/parentfolder.png",
                    kind: ItemsKind.Parent,
                    name: "..",
                    savedViewParent: true,
                    fileSize: 0,
                    parent: lastCurrentDir || "drives"
                }].concat(get(commanderId).reverse().map(n => {
                return {
                    imageUrl: "images/folder.png",
                    kind: ItemsKind.SavedView,
                    name: FileHelper.getNameFromPath(n),
                    favoriteTarget: n,
                    savedViewParent: false,
                    fileSize: 0,
                    parent: "drives"
                };
            }))
        };
    }
    function deleteItem(itemIndex) {
        var savedViewsStr = localStorage["SavedViews"];
        if (!savedViewsStr)
            return [];
        var savedViews = JSON.parse(savedViewsStr);
        savedViews = savedViews.splice(itemIndex, 1);
        localStorage["SavedViews"] = JSON.stringify(savedViews);
    }
    function get(commanderId) {
        var savedViewsStr = localStorage["SavedViews"];
        if (!savedViewsStr)
            return [];
        return JSON.parse(savedViewsStr)
            .map(n => {
            return commanderId == "leftView" ? n.left : n.right;
        });
    }
    return {
        save: save,
        getItems: getItems,
        deleteItem: deleteItem
    };
})();
//# sourceMappingURL=savedviews.js.map