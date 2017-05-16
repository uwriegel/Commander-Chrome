/**
 * Dient zur Anzeige der Modeldaten im View
 */
class ItemsViewModel {
    constructor(itemsModel) {
        this.itemsModel = itemsModel;
    }
    setColumns(columnsControl) {
        this.columnsControl = columnsControl;
    }
    /**
     * Einfügen der View an der Position 'index'
     * @param index Der Index des zugehörigen Eintrages
     */
    insertItem(index) {
        var item = this.itemsModel.getItem(index);
        switch (item.kind) {
            case ItemsKind.Drive:
                return this.insertDriveItem(item);
            case ItemsKind.Parent:
                return this.insertParentItem(item);
            case ItemsKind.Directory:
                return this.insertDirectoryItem(item);
            case ItemsKind.File:
                return this.insertFileItem(item);
            case ItemsKind.Favorite:
                return this.insertFavoriteItem(item);
            case ItemsKind.History:
            case ItemsKind.SavedView:
                return this.insertHistoryItem(item);
            case ItemsKind.Service:
                return this.insertServiceItem(item);
            case ItemsKind.Registry:
                return this.insertRegistryItem(item);
            case ItemsKind.RegistryProperty:
                return this.insertRegistryProperty(item);
        }
    }
    /**
     * Einfügen eines Testeintrages, um die Ausmaße im DOM zu bestimmen
     */
    insertMeasureItem() {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = "images/fault.png";
        template.querySelector('.it-nameValue').innerHTML = "Test";
        return template;
    }
    /**
     * Einfügen der Daten in die TableRow
     * @param itemElement
     * @param index Index des Eintrages, mit dem die TableRow gefüllt werden soll
     */
    updateItem(itemElement, index) {
        var item = this.itemsModel.getItem(index);
        this.insertExtendedInfos(itemElement, item);
    }
    insertParentItem(directory) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = directory.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = directory.name;
        return template;
    }
    insertDriveItem(drive) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = drive.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = drive.name;
        template.querySelector('.it-description').innerHTML = drive.description ? drive.description : "";
        template.querySelector('.it-size').innerHTML = FileHelper.formatFileSize(drive.fileSize);
        return template;
    }
    insertDirectoryItem(directory) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = directory.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = directory.name;
        template.querySelector('.it-time').innerHTML = FileHelper.formatDate(directory.dateTime);
        if (directory.isHidden)
            template.classList.add("hidden");
        this.insertExtendedInfos(template, directory);
        return template;
    }
    insertFavoriteItem(directory) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = directory.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = directory.name;
        template.querySelector('.it-description').innerHTML = directory.parent + directory.favoriteTarget;
        return template;
    }
    insertHistoryItem(directory) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = directory.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = directory.name;
        template.querySelector('.it-path').innerHTML = directory.favoriteTarget;
        return template;
    }
    insertFileItem(file) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = file.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = FileHelper.getNameOnly(file.name);
        template.querySelector('.it-extension').innerHTML = FileHelper.getExtension(file.name);
        template.querySelector('.it-size').innerHTML = FileHelper.formatFileSize(file.fileSize);
        template.querySelector('.it-time').innerHTML = FileHelper.formatDate(file.dateTime);
        if (file.isHidden)
            template.classList.add("hidden");
        this.insertExtendedInfos(template, file);
        return template;
    }
    insertServiceItem(service) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = service.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = service.name;
        template.querySelector('.it-status').innerHTML = service.status;
        switch (service.startType) {
            case 2:
                template.querySelector('.it-startType').innerHTML = "Automatisch";
                break;
            case 3:
                template.querySelector('.it-startType').innerHTML = "Manuell";
                break;
            case 4:
                template.querySelector('.it-startType').innerHTML = "Deaktiviert";
                break;
        }
        if (service.selected)
            template.classList.add("selected");
        else
            template.classList.remove("selected");
        return template;
    }
    insertRegistryItem(item) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = item.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = item.name;
        template.querySelector('.it-value').innerHTML = item.value;
        return template;
    }
    insertRegistryProperty(item) {
        var template = this.columnsControl.getItemTemplate();
        template.querySelector('.it-image').src = item.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = item.name;
        template.querySelector('.it-value').innerHTML = item.value;
        return template;
    }
    /**
     * Einfügen der erweiterten INformationen in die TableRow
     * @param tableRow Die TableRow, die mit den erweiterten Infos gefüttert werden soll
     * @param item Der Eintrag, dess Daten verwendet werden sollen
     */
    insertExtendedInfos(tableRow, item) {
        var itNew = tableRow.querySelector('.it-new');
        if (itNew) {
            if (item.renamedName)
                tableRow.querySelector('.it-new').innerHTML = item.renamedName;
            else
                tableRow.querySelector('.it-new').innerHTML = null;
        }
        if (item.version)
            tableRow.querySelector('.it-version').innerHTML = item.version;
        if (item.exifDateTime) {
            var time = tableRow.querySelector('.it-time');
            time.innerHTML = FileHelper.formatDate(item.exifDateTime);
            time.classList.add("exif");
        }
        if (item.selected)
            tableRow.classList.add("selected");
        else
            tableRow.classList.remove("selected");
        if (item.status) {
            tableRow.querySelector('.it-status').innerHTML = item.status;
            tableRow.querySelector('.it-image').src = item.imageUrl;
        }
    }
}
//# sourceMappingURL=itemsviewmodel.js.map