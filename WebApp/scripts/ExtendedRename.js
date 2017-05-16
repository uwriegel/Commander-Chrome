/**
 * Ansicht der ExtendedRename-Konfigurationseinstellungen
 */
class ExtendedRename {
    constructor(parent, itemsModel, observator, endDialog) {
        this.focusableElements = [];
        this.endDialog = endDialog;
        this.itemsModel = itemsModel;
        this.observator = observator;
        var extendedRenameTemplate = document.getElementById('extendedRenameTemplate').content.querySelector('div');
        var extendedRenameDiv = extendedRenameTemplate.cloneNode(true);
        parent.appendChild(extendedRenameDiv);
        var params = localStorage['ExtendedRenameParams'];
        if (params)
            this.params = JSON.parse(params);
        else
            this.params = { digits: 3, prefix: "Bild", initialValue: 1 };
    }
    get isEnabled() {
        return;
    }
    get Columns() {
        return this._Columns;
    }
    set Columns(value) {
        this._Columns = value;
    }
    initializeParameters() {
        var prefix = document.getElementById('prefix');
        this.params.prefix = prefix.value;
        var initialValue = document.getElementById('initial');
        this.params.initialValue = Number(initialValue.value);
        var digitsElement = document.getElementById('digits');
        this.params.digits = Number(digitsElement.value);
        var pad = "0".repeat(this.params.digits);
        this.pad = function (val) {
            var str = val.toString();
            return pad.substring(0, pad.length - str.length) + str;
        };
        localStorage['ExtendedRenameParams'] = JSON.stringify(this.params);
    }
    onShow() {
        var prefix = document.getElementById('prefix');
        prefix.value = this.params.prefix;
        prefix.onfocus = evt => prefix.select();
        this.focusableElements.push(prefix);
        var initial = document.getElementById('initial');
        initial.value = this.params.initialValue;
        initial.onfocus = evt => initial.select();
        this.focusableElements.push(initial);
        var digits = document.getElementById('digits');
        digits.value = this.params.digits;
        this.focusableElements.push(digits);
        this.focusableElements.push(document.getElementsByClassName('dialogButton')[0]);
        this.focusableElements.push(document.getElementsByClassName('dialogButton')[1]);
        this.focusableElements[0].focus();
    }
    selectionChanged() {
        var allItems = this.itemsModel.getItemSource();
        allItems.forEach((n, i) => n.renamedName = null);
        var sellies = this.itemsModel.getSelectedItems();
        sellies.forEach((n, i) => n.renamedName = `${this.params.prefix}${this.pad(i + this.params.initialValue)}`);
        this.observator.updateItems();
    }
    keydown(evt) {
        switch (evt.which) {
            case 9:
                var active = document.activeElement;
                if (evt.shiftKey) {
                    if (active == this.focusableElements[0])
                        this.focusableElements[4].focus();
                    else if (active == this.focusableElements[1])
                        this.focusableElements[0].focus();
                    else if (active == this.focusableElements[2])
                        this.focusableElements[1].focus();
                    else if (active == this.focusableElements[3])
                        this.focusableElements[2].focus();
                    else if (active == this.focusableElements[4])
                        this.focusableElements[3].focus();
                }
                else {
                    if (active == this.focusableElements[0])
                        this.focusableElements[1].focus();
                    else if (active == this.focusableElements[1])
                        this.focusableElements[2].focus();
                    else if (active == this.focusableElements[2])
                        this.focusableElements[3].focus();
                    else if (active == this.focusableElements[3])
                        this.focusableElements[4].focus();
                    else if (active == this.focusableElements[4])
                        this.focusableElements[0].focus();
                }
                break;
            case 13:
                this.endDialog(DialogResult.OK);
                break;
            case 27:
                this.endDialog(DialogResult.Cancel);
                break;
            default:
                return;
        }
        evt.preventDefault();
        evt.stopPropagation();
    }
    async execute(directory, items) {
        return await Connection.extendedRename(directory, items);
    }
}
//# sourceMappingURL=ExtendedRename.js.map