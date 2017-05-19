var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * Ein Commanderview besteht aus einer Tableview mit den Einträgen des aktuellen Verzeichnisses und einem Verzeichnis-Textfeldes
 * @param id Die ID des CommanderViews
 */
var CommanderView = (function () {
    function CommanderView(id) {
        var _this = this;
        this.recentDirectories = [];
        this._id = id;
        this.parent = document.getElementById(id);
        this.commanderDirectory = document.createElement("input");
        this.commanderDirectory.classList.add('directory');
        this.parent.appendChild(this.commanderDirectory);
        var commanderTable = document.createElement('div');
        commanderTable.classList.add('commanderTable');
        this.parent.appendChild(commanderTable);
        {
            var restrictor = document.createElement('input');
            restrictor.classList.add('restrictor');
            restrictor.classList.add('restrictorHide');
            this.parent.appendChild(restrictor);
        }
        this.tableView = new TableView(commanderTable);
        this.itemsModel = new ItemsModel(id);
        this.itemsSorter = new ItemsSorter(this.itemsModel);
        this.columnsControl = new ColumnsControl([
            {
                item: "Name",
                class: "",
                itemSortKind: ItemSortKind.Name
            },
            {
                item: "Erw.",
                class: "it-extension",
                itemSortKind: ItemSortKind.Extension
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
        ], id + '-columns', this.itemsSorter);
        this.drivesColumnControl = new ColumnsControl([
            {
                item: "Name",
                class: "",
                itemSortKind: ItemSortKind.Name
            },
            {
                item: "Beschreibung",
                class: "it-description",
                itemSortKind: ItemSortKind.Description
            },
            {
                item: "Größe",
                class: "it-size",
                itemSortKind: ItemSortKind.Size
            }
        ], id + '-drivesColumns', this.itemsSorter);
        this.favoritesColumnControl = new ColumnsControl([
            {
                item: "Name",
                class: "",
                itemSortKind: ItemSortKind.Name
            },
            {
                item: "Beschreibung",
                class: "it-description",
                itemSortKind: ItemSortKind.Description
            }
        ], id + '-favoritesColumns', this.itemsSorter);
        this.historyColumnControl = new ColumnsControl([
            {
                item: "Name",
                class: "",
                itemSortKind: ItemSortKind.Name
            },
            {
                item: "Pfad",
                class: "it-path",
                itemSortKind: ItemSortKind.Description
            }
        ], id + '-historyColumns', this.itemsSorter);
        this.serviceColumnsControl;
        this.registryColumnsControl;
        this.tableView.setObservable(this.itemsSorter);
        var itemsViewModel = new ItemsViewModel(this.itemsSorter);
        this.tableView.setItemsViewModel(itemsViewModel);
        this.tableView.Columns = this.columnsControl;
        this.tableView.setOnSelectedCallback(function (i, o, sp) { return _this.processItem(i, o, sp); });
        this.commanderDirectory.onfocus = function () {
            _this.commanderDirectory.select();
        };
        this.commanderDirectory.onkeydown = function (e) {
            switch (e.which) {
                case 13:
                    if (e.altKey)
                        Connection.processItem(FileHelper.pathCombine(_this.itemsModel.CurrentDirectory, _this.commanderDirectory.value), true);
                    else {
                        _this.changeDirectory(_this.commanderDirectory.value);
                        _this.tableView.focus();
                    }
                    break;
            }
        };
        this.tableView.setOnCurrentItemChanged(function (item) {
            if (_this.onCurrentItemChanged) {
                if (!item)
                    _this.onCurrentItemChanged();
                else
                    _this.onCurrentItemChanged(_this.itemsSorter.getItem(item), _this.itemsModel.CurrentDirectory);
            }
        });
        commanderTable.onkeypress = function (e) {
            _this.keysRestrict(e);
        };
        commanderTable.onkeydown = function (e) {
            switch (e.which) {
                case 8:
                    if (_this.restrictor != null) {
                        _this.restrictBack();
                        e.preventDefault();
                        return;
                    }
                    _this.changeDirectory("History");
                    e.preventDefault();
                    break;
                case 27:
                    _this.closeRestrict();
                    break;
                case 32:
                    if (_this.restrictor == null)
                        _this.itemsSorter.toggleSelection(_this.tableView.getCurrentItemIndex());
                    break;
                case 35:
                    if (e.shiftKey) {
                        _this.itemsSorter.selectAll(true, _this.tableView.getCurrentItemIndex());
                        e.preventDefault();
                    }
                    break;
                case 36:
                    if (e.shiftKey) {
                        _this.itemsSorter.selectAll(false, _this.tableView.getCurrentItemIndex() + 1);
                        e.preventDefault();
                    }
                    break;
                case 45:
                    var itemIndex = _this.tableView.getCurrentItemIndex();
                    _this.itemsSorter.toggleSelection(_this.tableView.getCurrentItemIndex());
                    _this.tableView.downOne();
                    break;
                case 46:
                    _this.processOperation(function (n) { return _this.getDeleteOperationData(n); }, function (r) { return _this.operateDelete(r); });
                    break;
                case 69:
                    if (e.ctrlKey) {
                        e.preventDefault();
                        Connection.startExplorer(_this.currentDirectory);
                    }
                    break;
                case 82:
                    if (e.ctrlKey) {
                        _this.refresh();
                        e.preventDefault();
                    }
                    break;
                case 107:
                    _this.itemsSorter.selectAll(true);
                    break;
                case 109:
                    _this.itemsSorter.selectAll(false);
                    break;
                case 112:
                    if (!e.ctrlKey) {
                        _this.changeDirectory("Favoriten");
                        e.preventDefault();
                    }
                    break;
                case 113:
                    _this.executeRename(e.ctrlKey);
                    break;
                case 116:
                    _this.processOperation(function (n) { return _this.getCopyOperationData(n); }, function (result) {
                        _this.operateFile(result, "Möchtest Du die ausgewählten Dateien kopieren?", false);
                    });
                    break;
                case 117:
                    _this.processOperation(function (n) { return _this.getMoveOperationData(n); }, function (result) {
                        _this.operateFile(result, "Möchtest Du die ausgewählten Dateien verschieben?", true);
                    });
                    break;
                case 118:
                    _this.createDirectory();
                    break;
                case 120:
                    _this.otherView.changeDirectory(_this.currentDirectory);
                    break;
            }
        };
    }
    Object.defineProperty(CommanderView.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommanderView.prototype, "otherView", {
        /**
       * Das andere CommanderView
       */
        get: function () {
            return this._otherView;
        },
        set: function (value) {
            this._otherView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommanderView.prototype, "currentDirectory", {
        get: function () {
            return this.itemsModel.CurrentDirectory;
        },
        enumerable: true,
        configurable: true
    });
    CommanderView.prototype.initialize = function () {
        var currentDirectory = localStorage[this.id];
        if (!currentDirectory)
            currentDirectory = "drives";
        this.changeDirectory(currentDirectory);
    };
    CommanderView.prototype.focus = function () {
        this.tableView.focus();
    };
    CommanderView.prototype.setOnFocus = function (callback) {
        this.tableView.setOnFocus(function () { return callback(); });
    };
    CommanderView.prototype.changeDirectory = function (directory) {
        if (this.historyWriterTimeouter) {
            clearTimeout(this.historyWriterTimeouter);
            this.historyWriterTimeouter = null;
        }
        this.closeRestrict(true);
        var historyDirectory;
        switch (directory) {
            case "drives":
                if (this.tableView.Columns != this.drivesColumnControl)
                    this.tableView.Columns = this.drivesColumnControl;
                break;
            case "Favoriten":
                if (this.tableView.Columns != this.favoritesColumnControl)
                    this.tableView.Columns = this.favoritesColumnControl;
                break;
            case "History":
                if (this.tableView.Columns != this.historyColumnControl)
                    this.tableView.Columns = this.historyColumnControl;
                this.lastCurrentDir = this.currentDirectory;
                break;
            case "SavedViews":
                if (this.tableView.Columns != this.historyColumnControl)
                    this.tableView.Columns = this.historyColumnControl;
                this.lastCurrentDir = this.currentDirectory;
                break;
            case "Dienste":
                if (this.tableView.Columns != this.serviceColumnsControl) {
                    this.serviceColumnsControl = new ColumnsControl([
                        {
                            item: "Name",
                            class: "",
                            itemSortKind: ItemSortKind.Name
                        },
                        {
                            item: "Status",
                            class: "it-status",
                            itemSortKind: ItemSortKind.ServiceItemStatus
                        },
                        {
                            item: "Startart",
                            class: "it-startType",
                            itemSortKind: ItemSortKind.ServiceItemStartKind
                        }
                    ], this.id + "-serviceColumns", this.itemsSorter);
                    this.tableView.Columns = this.serviceColumnsControl;
                }
                break;
            default:
                if (directory == "Registry" || directory.startsWith("HKEY_")) {
                    if (this.tableView.Columns != this.registryColumnsControl) {
                        this.registryColumnsControl = new ColumnsControl([
                            {
                                item: "Name",
                                class: "",
                                itemSortKind: ItemSortKind.Name
                            },
                            {
                                item: "Wert",
                                class: "it-value",
                                itemSortKind: ItemSortKind.RegistryValue
                            }
                        ], this.id + "--registryColumns", this.itemsSorter);
                        this.tableView.Columns = this.registryColumnsControl;
                    }
                }
                else {
                    if (this.extendedRename) {
                        if (this.tableView.Columns != this.extendedRename.Columns)
                            this.tableView.Columns = this.extendedRename.Columns;
                    }
                    else {
                        if (this.tableView.Columns != this.columnsControl)
                            this.tableView.Columns = this.columnsControl;
                    }
                }
                if (!directory.endsWith(':\\'))
                    historyDirectory = directory;
                break;
        }
        localStorage[this.id] = directory;
        this.itemsModel.getItems(directory, this.lastCurrentDir);
        this.commanderDirectory.value = directory;
        if (historyDirectory) {
            this.historyWriterTimeouter = setTimeout(function () {
                SavedHistory.saveHistory(historyDirectory);
            }, 6000);
        }
    };
    CommanderView.prototype.refresh = function () {
        this.changeDirectory(this.currentDirectory);
    };
    CommanderView.prototype.setOnCurrentItemChanged = function (callback) {
        this.onCurrentItemChanged = callback;
    };
    CommanderView.prototype.changeSavedView = function (index) {
        this.processItem(index, false, false, true);
    };
    CommanderView.prototype.isMouseInTableView = function (x, y) {
        return this.tableView.isMouseWithin(x, y);
    };
    CommanderView.prototype.dragLeave = function () {
        this.tableView.dragLeave();
    };
    CommanderView.prototype.processItem = function (itemIndex, openWith, showProperties, fromOtherView) {
        var dir;
        this.lastCurrentDir = null;
        var item = this.itemsSorter.getItem(itemIndex);
        var selectedItems = this.itemsModel.getSelectedItems();
        if (selectedItems.length == 0 || (selectedItems[0].kind != ItemsKind.Service || item.kind == ItemsKind.Parent)) {
            switch (item.kind) {
                case ItemsKind.Drive:
                    if (showProperties) {
                        Connection.processItem(item.name, true);
                        return;
                    }
                    dir = item.name;
                    this.recentDirectories.push(dir);
                    break;
                case ItemsKind.Parent:
                    dir = item.parent;
                    this.lastCurrentDir = this.recentDirectories.pop();
                    if (item.savedViewParent && !fromOtherView)
                        this.otherView.changeSavedView(0);
                    break;
                case ItemsKind.Directory:
                    if (showProperties) {
                        Connection.processItem(FileHelper.pathCombine(this.itemsModel.CurrentDirectory, item.name), true);
                        return;
                    }
                    dir = FileHelper.pathCombine(this.itemsModel.CurrentDirectory, item.name);
                    this.recentDirectories.push(item.name);
                    break;
                case ItemsKind.File:
                    Connection.processItem(FileHelper.pathCombine(this.itemsModel.CurrentDirectory, item.name), showProperties, openWith);
                    return;
                case ItemsKind.Favorite:
                    dir = FileHelper.pathCombine(item.parent, item.favoriteTarget);
                    this.recentDirectories.push(item.favoriteTarget);
                    break;
                case ItemsKind.History:
                    dir = item.favoriteTarget;
                    break;
                case ItemsKind.SavedView:
                    dir = item.favoriteTarget;
                    if (!fromOtherView)
                        this.otherView.changeSavedView(this.tableView.getCurrentItemIndex());
                    break;
                case ItemsKind.Service:
                    var selItems = [];
                    selItems.push(item);
                    Connection.startServices(selItems);
                    return;
                case ItemsKind.Registry:
                    dir = FileHelper.pathCombine(this.itemsModel.CurrentDirectory, item.name);
                    this.recentDirectories.push(item.name);
                    break;
                default:
                    return;
            }
        }
        else
            Connection.startServices(selectedItems);
        this.changeDirectory(dir);
        this.tableView.focus();
    };
    CommanderView.prototype.keysRestrict = function (e) {
        var restrict = String.fromCharCode(e.charCode).toLowerCase();
        if (this.restrictor != null)
            restrict = this.restrictor.value + restrict;
        if (this.itemsSorter.restrict(restrict))
            this.checkRestrict(restrict);
        if (!this.tableView.focus())
            this.tableView.pos1();
    };
    CommanderView.prototype.checkRestrict = function (restrict) {
        if (this.restrictor == null) {
            this.restrictor = this.parent.getElementsByClassName("restrictor")[0];
            this.restrictor.classList.remove('restrictorHide');
        }
        this.restrictor.value = restrict;
    };
    CommanderView.prototype.closeRestrict = function (noRefresh) {
        if (this.restrictor) {
            this.restrictor.classList.add('restrictorHide');
            this.restrictor = null;
            this.itemsSorter.closeRestrict(noRefresh);
            this.tableView.focus();
        }
    };
    CommanderView.prototype.restrictBack = function () {
        var restrict = this.restrictor.value;
        restrict = restrict.substring(0, restrict.length - 1);
        if (restrict.length == 0)
            this.closeRestrict();
        else {
            if (this.itemsSorter.restrict(restrict, true))
                this.checkRestrict(restrict);
            this.tableView.focus();
        }
    };
    CommanderView.prototype.processOperation = function (getOperationData, operate) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var selection, operationData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selection = this.getSelectedItems();
                        if (!selection.length)
                            return [2 /*return*/];
                        switch (this.currentDirectory) {
                            case "SavedViews":
                                Dialog.initialize("Möchtest Du diese gespeicherte Ansicht löschen?");
                                Dialog.setOkCancel(function (dialogResult) {
                                    if (dialogResult == DialogResult.OK) {
                                        SavedViews.deleteItem(_this.tableView.getCurrentItemIndex());
                                        _this.refresh();
                                        _this.otherView.refresh();
                                    }
                                });
                                Dialog.show();
                                return [2 /*return*/];
                            case "Favoriten":
                                Dialog.initialize("Möchtest Du diesen Favoriten löschen?");
                                Dialog.setOkCancel(function (dialogResult) {
                                    if (dialogResult == DialogResult.OK) {
                                        Favorites.deleteItems(selection);
                                        _this.refresh();
                                    }
                                });
                                Dialog.show();
                                return [2 /*return*/];
                            default:
                                break;
                        }
                        WaitingItem.start(15, function (isCancelled) {
                            WaitingItem.stop(!isCancelled);
                            Connection.cancel();
                            if (!isCancelled) {
                                Dialog.initialize("Dauert zu lange");
                                Dialog.show();
                            }
                        });
                        operationData = getOperationData(selection);
                        return [4 /*yield*/, Connection.checkFileOperation(operationData)];
                    case 1:
                        result = _a.sent();
                        WaitingItem.stop(true);
                        switch (result.result) {
                            case OperationCheck.OK:
                                operate(result);
                                break;
                            case OperationCheck.Cancelled:
                                break;
                            case OperationCheck.IdenticalDirectories:
                                Dialog.initialize("Die Verzeichnisse sind identisch");
                                Dialog.show();
                                break;
                            case OperationCheck.NoSelection:
                                Dialog.initialize("Für diese Operation sind keine gültigen Elemente ausgewählt");
                                Dialog.show();
                                break;
                            case OperationCheck.SubordinateDirectory:
                                Dialog.initialize("Der Zielordner ist dem Quellordner untergeordnet");
                                Dialog.show();
                            case OperationCheck.Incompatible:
                                Dialog.initialize("Du kannst diese Elemente nicht in diesen Zielordner kopieren/verschieben");
                                Dialog.show();
                            case OperationCheck.ServiceNotSupported:
                                if (operationData.operation == "delete")
                                    Connection.stopServices(selection);
                                break;
                            case OperationCheck.CopyToFavorites:
                                Favorites.addItem(operationData.sourceDir, operationData.items[0].name);
                                this.otherView.refresh();
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CommanderView.prototype.getSelectedItems = function () {
        /// <summary>gibt den aktuellen Eintrag zurück, oder die selektierten</summary>
        var items = this.itemsModel.getSelectedItems();
        if (items.length == 0) {
            items = [];
            items.push(this.itemsSorter.getItem(this.tableView.getCurrentItemIndex()));
        }
        return items;
    };
    CommanderView.prototype.getCopyOperationData = function (selection) {
        return {
            operation: "copy",
            sourceDir: this.currentDirectory,
            targetDir: this.otherView.currentDirectory,
            items: selection
        };
    };
    CommanderView.prototype.getMoveOperationData = function (selection) {
        return {
            operation: "move",
            sourceDir: this.currentDirectory,
            targetDir: this.otherView.currentDirectory,
            items: selection
        };
    };
    CommanderView.prototype.getDeleteOperationData = function (selection) {
        return {
            operation: "delete",
            sourceDir: this.currentDirectory,
            items: selection
        };
    };
    CommanderView.prototype.operateDelete = function (result) {
        var _this = this;
        Dialog.initialize("Möchtest Du die ausgewählten Dateien löschen?");
        Dialog.setOkCancel(function (dialogResult) {
            if (dialogResult == DialogResult.OK)
                Connection.runOperation([_this.id]);
        });
        Dialog.show();
    };
    CommanderView.prototype.operateFile = function (result, question, refreshTarget) {
        var _this = this;
        if (result.result == OperationCheck.Incompatible) {
            Dialog.initialize("Du kannst die ausgewählten Elemente nicht in diesen Zielordner kopieren");
            Dialog.show();
        }
        else if (result.conflictItems.length > 0) {
            Dialog.initialize("Folgende Dateien überschreiben?");
            Dialog.addConflictView(result);
            Dialog.setYesNoCancel(function (dialogResult) { return __awaiter(_this, void 0, void 0, function () {
                var idsToRefresh;
                return __generator(this, function (_a) {
                    if (dialogResult != DialogResult.Cancel) {
                        idsToRefresh = [this.otherView.id];
                        if (refreshTarget)
                            idsToRefresh.push(this.id);
                        Connection.runOperation(idsToRefresh, dialogResult == DialogResult.OK);
                    }
                    return [2 /*return*/];
                });
            }); });
            Dialog.show();
        }
        else {
            if (result.exception == "ToFavorites")
                question = "Möchtest Du die ausgewählten Ordner als Favoriten hinzufügen?";
            Dialog.initialize(question);
            Dialog.setOkCancel(function (dialogResult) {
                if (dialogResult == DialogResult.OK) {
                    var idsToRefresh = [_this.otherView.id];
                    if (refreshTarget)
                        idsToRefresh.push(_this.id);
                    Connection.runOperation(idsToRefresh);
                }
            });
            Dialog.show();
        }
    };
    CommanderView.prototype.createDirectory = function () {
        var _this = this;
        var input = "Neuer Ordner";
        var selectedItems = this.getSelectedItems();
        if (selectedItems.length == 1 && selectedItems[0].kind == ItemsKind.Directory)
            input = selectedItems[0].name;
        Dialog.initialize("Neuen Ordner anlegen:");
        Dialog.setInput(input);
        Dialog.setOkCancel(function (dialogResult) {
            if (dialogResult == DialogResult.OK)
                _this.createFolder(Dialog.text);
        });
        Dialog.show();
    };
    CommanderView.prototype.createFolder = function (newName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Connection.createFolder(newName, this.currentDirectory)];
                    case 1:
                        result = _a.sent();
                        switch (result.result) {
                            case OperationCheck.OK:
                                this.refresh();
                                break;
                            case OperationCheck.Incompatible:
                                Dialog.initialize("Du kannst hier keinen neuen Ordner anlegen!");
                                Dialog.show();
                                break;
                            case OperationCheck.AlreadyExists:
                                Dialog.initialize("Der Ordner ist doch schon da!");
                                Dialog.show();
                                break;
                            case OperationCheck.Unauthorized:
                                Dialog.initialize("Du hast kein Recht hier einen Ordner anzulegen!");
                                Dialog.show();
                                break;
                            default:
                                Dialog.initialize("Die Aktion konnte nicht durchgeführt werden!");
                                Dialog.show();
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Umbenennen eines Eintrages
     * @param item Der umzubennende Eintrag
     * @param selectionCount wenn angegeben, werden nur die Anzahl der Zeichen selektiert (Bei Dateien: nur der Name, nicht die Erweiterung
     */
    CommanderView.prototype.rename = function (item, selectionCount) {
        var _this = this;
        Dialog.initialize("Umbennenen:");
        Dialog.setInput(item.name, selectionCount);
        Dialog.setCheckBox("Kopie anlegen");
        Dialog.setOkCancel(function (dialogResult) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(dialogResult == DialogResult.OK)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Connection.rename(item.name, Dialog.text, this.currentDirectory, Dialog.isChecked, this.id)];
                    case 1:
                        result = _a.sent();
                        switch (result) {
                            case OperationCheck.AlreadyExists:
                                Dialog.initialize("Du kannst hier keinen neuen Ordner anlegen!");
                                Dialog.show();
                                break;
                            case OperationCheck.CopyToFavorites:
                                Favorites.renameItem(item.parent, item.name, Dialog.text);
                                this.refresh();
                                break;
                            case OperationCheck.OK:
                                this.refresh();
                                break;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        Dialog.show();
    };
    CommanderView.prototype.executeRename = function (ctrlKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var extendedRename, result, currentIndex, item, count, name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ctrlKey) return [3 /*break*/, 1];
                        Dialog.initialize("Erweitertes Umbenennen");
                        this.extendedRename = null;
                        this.itemsSorter.RegisterSelectionChange(null);
                        extendedRename = Dialog.addExtendedRename(this.itemsSorter, this.tableView);
                        Dialog.setOkCancel(function (dialogResult) {
                            if (dialogResult == DialogResult.OK) {
                                _this.extendedRename = extendedRename;
                                _this.itemsSorter.RegisterSelectionChange(_this.extendedRename);
                                _this.extendedRename.Columns = new ColumnsControl([
                                    {
                                        item: "Name",
                                        class: "",
                                        itemSortKind: ItemSortKind.Name
                                    },
                                    {
                                        item: "Neu",
                                        class: "it-new",
                                        itemSortKind: ItemSortKind.Date
                                    },
                                    {
                                        item: "Erw.",
                                        class: "it-extension",
                                        itemSortKind: ItemSortKind.Extension
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
                                    }
                                ], _this.id + '-columns', _this.itemsSorter);
                            }
                            _this.refresh();
                        });
                        Dialog.show();
                        return [3 /*break*/, 4];
                    case 1:
                        if (!this.extendedRename) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extendedRename.execute(this.itemsModel.CurrentDirectory, this.itemsModel.getSelectedItems())];
                    case 2:
                        result = _a.sent();
                        switch (result) {
                            case OperationCheck.OK:
                                this.refresh();
                                break;
                            case OperationCheck.Cancelled:
                                Dialog.initialize("Abgebrochen");
                                Dialog.show();
                                break;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        currentIndex = this.tableView.getCurrentItemIndex();
                        item = this.itemsSorter.getItem(currentIndex);
                        if (item.kind == ItemsKind.Directory || item.kind == ItemsKind.File || item.kind == ItemsKind.Favorite) {
                            if (item.kind == ItemsKind.File) {
                                name = FileHelper.getNameOnly(item.name);
                                count = name.length;
                            }
                            this.rename(item, count);
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CommanderView;
}());
//# sourceMappingURL=commanderview.js.map