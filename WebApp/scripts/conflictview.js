/**
 * Das ConflictView besteht aus einer Tableview mit den Einträgen der Konfliktdateien beim Kopieren oder Verschieben
 */
class ConflictView {
    /**
     *
     * @param parent Der Parent des ConflictView, also der Dialog
     * @param json Die Konflikteinträge, die vom HTTP-Server kommen
     */
    constructor(parent, operationCheckResult) {
        this.itemFactory = document.getElementById('conflictItemTemplate').content.querySelector('tr');
        this.operationCheckResult = operationCheckResult;
        this.conflictTable = document.createElement('div');
        this.conflictTable.classList.add('conflictTable');
        parent.appendChild(this.conflictTable);
        this.tableView = new TableView(this.conflictTable);
        this.columnsControl = new ColumnsControl([
            {
                item: "Name",
                class: "",
                itemSortKind: ItemSortKind.Name
            },
            {
                item: "Größe",
                class: "it-size",
                itemSortKind: ItemSortKind.Size
            },
            {
                item: "Datum",
                class: "it-time",
                itemSortKind: ItemSortKind.Date
            },
            {
                item: "Version",
                class: "it-version",
                itemSortKind: ItemSortKind.Version
            }
        ], 'columns', null);
        this.tableView.setItemsViewModel(this);
        this.tableView.Columns = this.columnsControl;
        this.tableView.setObservable(this);
    }
    initialize() {
        this.observator.itemsChanged(0);
    }
    setColumns(columns) {
    }
    /**
     * Überprüft ein HTMLElement, ob dies zur internen TableView gehört
     * @param elementToCheck Das zu überprüfende HTMLElement
     */
    isTableView(elementToCheck) {
        return this.conflictTable.contains(elementToCheck);
    }
    /**
     * Können die Konflikte nicht einfach überschrieben werden? Dann Default-Aktion "Nein"
     */
    notToOverride() {
        return this.shouldNotBeOverridden;
    }
    registerObservation(observator) {
        this.observator = observator;
    }
    getItemsCount() {
        return this.operationCheckResult.conflictItems.length;
    }
    /**
     * Einfügen der View an der Position 'index'
    * @param index Der Index des zugehörigen Eintrages
    */
    insertItem(index, startDrag) {
        /// <summary>Gibt den View des Items an der Position index zurück</summary>
        /// <returns type="Element">View des Items an der Position index</returns>
        var item = this.operationCheckResult.conflictItems[index];
        switch (item.kind) {
            case ItemsKind.File:
                return this.insertFileItem(item);
        }
    }
    insertMeasureItem() {
        /// <summary>Gibt den View eines Items zur Größenbestimmung zurück</summary>
        /// <returns type="Element">View zur Größenbestimmung</returns>
        var template = this.itemFactory.cloneNode(true);
        template.querySelector('.it-image').src = "images/fault.png";
        template.querySelector('.it-nameValue').innerHTML = "Test";
        template.querySelector('.it-sourcesize').innerHTML = "100";
        template.querySelector('.it-targetsize').innerHTML = "100";
        return template;
    }
    updateItem(itemElement, index) {
    }
    insertFileItem(conflictItem) {
        var template = this.itemFactory.cloneNode(true);
        template.querySelector('.it-image').src = conflictItem.imageUrl;
        template.querySelector('.it-nameValue').innerHTML = conflictItem.name;
        var sfs = template.querySelector('.it-sourcesize');
        sfs.innerHTML = FileHelper.formatFileSize(conflictItem.sourceFileSize);
        var tfs = template.querySelector('.it-targetsize');
        tfs.innerHTML = FileHelper.formatFileSize(conflictItem.targetFileSize);
        if (conflictItem.sourceFileSize == conflictItem.targetFileSize) {
            sfs.classList.add("conflictsEqual");
            tfs.classList.add("conflictsEqual");
        }
        var st = template.querySelector('.it-sourceTime');
        var tt = template.querySelector('.it-targetTime');
        st.innerHTML = FileHelper.formatDate(conflictItem.sourceDateTime);
        tt.innerHTML = FileHelper.formatDate(conflictItem.targetDateTime);
        if (conflictItem.sourceDateTime > conflictItem.targetDateTime)
            st.classList.add("conflictsNewer");
        else if (conflictItem.sourceDateTime < conflictItem.targetDateTime) {
            tt.classList.add("conflictsOlder");
            this.shouldNotBeOverridden = true;
        }
        else {
            st.classList.add("conflictsEqual");
            tt.classList.add("conflictsEqual");
        }
        if (conflictItem.sourceVersion) {
            var sv = template.querySelector('.it-sourceVersion');
            var tv = template.querySelector('.it-targetVersion');
            sv.innerHTML = conflictItem.sourceVersion;
            tv.innerHTML = conflictItem.targetVersion;
            let compareResult = FileHelper.compareVersion(conflictItem.sourceVersion, conflictItem.targetVersion);
            if (compareResult > 0)
                sv.classList.add("conflictsNewer");
            else if (compareResult < 0) {
                tv.classList.add("conflictsOlder");
                this.shouldNotBeOverridden = true;
            }
            else {
                sv.classList.add("conflictsEqual");
                tv.classList.add("conflictsEqual");
            }
        }
        return template;
    }
}
//# sourceMappingURL=conflictview.js.map