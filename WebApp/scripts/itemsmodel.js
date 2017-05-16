var ItemsKind;
(function (ItemsKind) {
    ItemsKind[ItemsKind["Drive"] = 0] = "Drive";
    ItemsKind[ItemsKind["Parent"] = 1] = "Parent";
    ItemsKind[ItemsKind["File"] = 2] = "File";
    ItemsKind[ItemsKind["Directory"] = 3] = "Directory";
    ItemsKind[ItemsKind["Service"] = 4] = "Service";
    ItemsKind[ItemsKind["Registry"] = 5] = "Registry";
    ItemsKind[ItemsKind["RegistryProperty"] = 6] = "RegistryProperty";
    ItemsKind[ItemsKind["Favorite"] = 7] = "Favorite";
    ItemsKind[ItemsKind["History"] = 8] = "History";
    ItemsKind[ItemsKind["SavedView"] = 9] = "SavedView";
})(ItemsKind || (ItemsKind = {}));
/**
 * Das Itemsmodel, welches den Commander mit Daten versorgt
 */
class ItemsModel {
    /**
     *
     * @param id Die ID des zugehörigen CommanderViews
     */
    constructor(id) {
        /**
         * Jeder Request wird mit einer fortlaufenden Nummer versehen, damit die Updates zugeordnet werden können
         */
        this.requestNumber = 0;
        this.id = id;
        Connection.addFileEventSource(this.id, this.update.bind(this));
        Connection.addServiceEventSource(this.id, this.updateServiceItem.bind(this));
    }
    /**
     * Registrierung eines Observables, welches über Änderungen im Model informiert werden möchte
     * @param observator
     */
    registerObservation(observator) {
        this.observator = observator;
    }
    /**
     * Ermittlung aller Einträge für das angegebene Verzeichnis
     * @param directory
     * @param lastCurrentDir das Verzeichnis, welches durch das neue ersetzt wird
     */
    async getItems(directory, lastCurrentDir) {
        this.observator.ItemsCleared();
        if (directory != this.CurrentDirectory)
            this.exifDates = null;
        switch (directory) {
            case "Favoriten":
                this.currentItems = Favorites.getItems(lastCurrentDir);
                break;
            case "History":
                this.currentItems = SavedHistory.getItems(lastCurrentDir);
                break;
            case "SavedViews":
                this.currentItems = SavedViews.getItems(this.id, lastCurrentDir);
                break;
            default:
                this.currentItems = await Connection.getItems(this.id, ++this.requestNumber, directory);
                if (this.exifDates) {
                    this.currentItems.items.forEach(n => {
                        if (this.exifDates[n.name])
                            n.exifDateTime = this.exifDates[n.name];
                    });
                }
                break;
        }
        if (this.observator) {
            var lastCurrentIndex = 0;
            if (lastCurrentDir) {
                this.currentItems.items.forEach((item, index) => {
                    if ((item.kind == ItemsKind.Drive || item.kind == ItemsKind.Directory || item.kind == ItemsKind.Registry) && item.name == lastCurrentDir)
                        lastCurrentIndex = index;
                });
            }
            this.observator.itemsChanged(lastCurrentIndex);
        }
    }
    /**
     * Rückgabe des Eintrages mit dem angegebenem Index
     * @param index
     */
    getItem(index) {
        if (index > this.currentItems.items.length)
            return null;
        return this.currentItems.items[index];
    }
    /**
     * Ermittlung des originalen Einträge der Anwendung
     */
    getItemSource() {
        return this.currentItems.items;
    }
    /**
     * Ermittlung der selektierten Einträge
     */
    getSelectedItems() {
        return this.currentItems.items.filter(item => {
            return item.selected;
        });
    }
    /**
     * Wird von der Anwendung über WebSocket-Events aufgerufen, Dateiupdates
     * @param updateItems Array von ItemUpdate
     */
    update(updateItems) {
        var refresh = false;
        updateItems.forEach(item => {
            if (item.version)
                this.currentItems.items[item.index].version = item.version;
            if (item.dateTime) {
                this.currentItems.items[item.index].exifDateTime = item.dateTime;
                if (!this.exifDates)
                    this.exifDates = {};
                this.exifDates[this.currentItems.items[item.index].name] = item.dateTime;
            }
            refresh = true;
        });
        if (refresh && this.observator)
            this.observator.updateItems();
    }
    /**
     * Wird von der Anwendung über WebSocket-Events aufgerufen, ServiceStatusupdates
     * @param updateItems Array von ItemUpdate
     */
    updateServiceItem(updateItems) {
        var refresh = false;
        this.currentItems.items.forEach(item => {
            var updateItem = updateItems.find(n => {
                return item.serviceName == n.serviceName;
            });
            if (updateItem) {
                item.status = updateItem.status;
                item.imageUrl = updateItem.imageUrl;
                refresh = true;
            }
        });
        if (refresh && this.observator)
            this.observator.updateItems();
    }
    /**
    * Das aktuelle Verzeichnis
    */
    get CurrentDirectory() {
        if (!this.currentItems)
            return null;
        return this.currentItems.currentDirectory;
    }
    /**
     * Ermittlung der Anzahl der Einträge
     */
    getItemsCount() {
        return this.currentItems.items.length;
    }
}
//# sourceMappingURL=itemsmodel.js.map