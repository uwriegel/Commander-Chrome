/**
 * Verwaltung der Favoriten
 */
var Favorites = (function () {
    /**
     * Abfrage der Favoriten
     * @param lastCurrentDir Das Verzeichnis, welches durch dieses ersetzt werden soll
     */
    function getItems(lastCurrentDir) {
        return {
            currentDirectory: "Favoriten",
            items: getFavoriteItems(lastCurrentDir)
        };
    }
    function addItem(path, itemName) {
        var favorites = get();
        if (find(favorites, path, itemName) == -1) {
            favorites.push({
                name: itemName,
                item: itemName,
                path: path
            });
            favorites = favorites.sort((a, b) => {
                /// <param name="a" type="Item">Das erste zu vergleichende Item</param>
                /// <param name="b" type="Item">Das zweite zu vergleichende Item</param>
                return a.name.localeCompare(b.name);
            });
            safe(favorites);
        }
    }
    function renameItem(path, name, newName) {
        var favorites = get();
        var pos = find(favorites, path, name);
        if (pos != -1)
            favorites[pos].name = newName;
        favorites = favorites.sort((a, b) => {
            /// <param name="a" type="Item">Das erste zu vergleichende Item</param>
            /// <param name="b" type="Item">Das zweite zu vergleichende Item</param>
            return a.name.localeCompare(b.name);
        });
        safe(favorites);
    }
    function deleteItems(items) {
        var favorites = get();
        items.forEach(n => {
            var index = find(favorites, n.parent, n.name);
            if (index != -1)
                favorites.splice(index, 1);
        });
        safe(favorites);
    }
    function getFavoriteItems(lastCurrentDir) {
        return [{
                imageUrl: "images/parentfolder.png",
                kind: ItemsKind.Parent,
                name: "..",
                fileSize: 0,
                parent: "drives"
            }].concat(get().map(n => {
            return {
                imageUrl: "images/favorite.png",
                kind: ItemsKind.Favorite,
                name: n.name,
                favoriteTarget: n.item,
                fileSize: 0,
                parent: n.path
            };
        }));
    }
    function get() {
        var favoritesString = localStorage["favorites"];
        if (!favoritesString)
            return [];
        return JSON.parse(favoritesString);
    }
    function safe(favorites) {
        localStorage["favorites"] = JSON.stringify(favorites);
    }
    function find(favorites, path, itemName) {
        var index = -1;
        return favorites.find((n, i) => {
            index = i;
            return (n.name == itemName && n.path == path);
        }) ? index : -1;
    }
    return {
        getItems: getItems,
        addItem: addItem,
        renameItem: renameItem,
        deleteItems: deleteItems
    };
})();
//# sourceMappingURL=favorites.js.map