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
// TODO: Weiterentwicklung
//
// Start as Admin im Hintergrund
// drives: Gespeicherte Ansichten
// F10 MENÜ Erklärung der Tastenkürzel oder Hilfe
// RegistryItems anzeigen
// NachRefresh Selektion erhalten
// Conflicts: conflict liste in die Focusable anhängen
// Rename auch von mehreren Dateien
var Commander = (function () {
    function Commander() {
        var _this = this;
        this.leftView = new CommanderView("leftView");
        this.rightView = new CommanderView("rightView");
        this.leftView.otherView = this.rightView;
        this.rightView.otherView = this.leftView;
        this.viewer = new Viewer();
        this.leftView.setOnCurrentItemChanged(this.currentItemChanged.bind(this));
        this.rightView.setOnCurrentItemChanged(this.currentItemChanged.bind(this));
        this.focusedView = this.leftView;
        this.leftView.setOnFocus(function () { return _this.focusedView = _this.leftView; });
        this.rightView.setOnFocus(function () { return _this.focusedView = _this.rightView; });
        this.footer = document.getElementById("footer");
        this.leftView.initialize();
        this.rightView.initialize();
        this.leftView.focus();
        this.menu = new MenuBar();
        var gridElement = document.getElementById("grid");
        var viewerElement = document.getElementById("viewer");
        var grid = Grid(gridElement, document.getElementById("leftView"), document.getElementById("rightView"), document.getElementById("grip"), function () { return _this.focusedView.focus(); });
        this.vgrid = new VerticalGrid(document.getElementById("vgrid"), gridElement, viewerElement, document.getElementById("vgrip"), function () { return _this.focusedView.focus(); });
        viewerElement.onclick = function () { return _this.focusedView.focus(); };
        this.initializeOnKeyDownHandler();
        if (localStorage["showHidden"] == "true")
            this.showHidden(true);
        if (localStorage["darkTheme"] = "true")
            this.darkTheme(true);
    }
    Commander.prototype.getCommanderView = function (id) {
        switch (id) {
            case "leftView":
                return this.leftView;
            case "rightView":
                return this.rightView;
        }
    };
    Commander.prototype.getFocused = function () {
        return this.focusedView;
    };
    Commander.prototype.dragOver = function (x, y) {
        if (this.leftView.isMouseInTableView(x, y)) {
            // console.log(`Drag: ${x}, ${y}`);
        }
        if (this.rightView.isMouseInTableView(x, y)) {
            //console.log(`Drag: ${x}, ${y}`);
        }
    };
    Commander.prototype.dragLeave = function () {
        this.leftView.dragLeave();
        this.rightView.dragLeave();
    };
    Commander.prototype.drop = function (x, y, dragDropKind, directory, items) {
        if (this.leftView.isMouseInTableView(x, y)) {
            this.leftView.dragLeave();
            this.rightView.drop(dragDropKind, directory, items);
        }
        if (this.rightView.isMouseInTableView(x, y)) {
            this.rightView.dragLeave();
            this.leftView.drop(dragDropKind, directory, items);
        }
    };
    Commander.prototype.initializeOnKeyDownHandler = function () {
        var _this = this;
        document.onkeydown = function (evt) {
            switch (evt.which) {
                case 9:
                    if (!evt.shiftKey) {
                        if (_this.focusedView.isDirectoryInputFocused())
                            _this.focusedView.focus();
                        else {
                            var toFocus = _this.focusedView == _this.leftView ? _this.rightView : _this.leftView;
                            toFocus.focus();
                        }
                    }
                    else
                        _this.focusedView.focusDirectoryInput();
                    break;
                case 72:
                    if (evt.ctrlKey) {
                        _this.showHidden(localStorage["showHidden"] != "true");
                        break;
                    }
                    else
                        return;
                case 83:
                    if (evt.ctrlKey) {
                        SavedViews.save({
                            left: _this.leftView.currentDirectory,
                            right: _this.rightView.currentDirectory
                        });
                        break;
                    }
                    else
                        return;
                case 112:
                    if (evt.ctrlKey) {
                        _this.leftView.changeDirectory("SavedViews");
                        _this.rightView.changeDirectory("SavedViews");
                    }
                    break;
                case 114:
                    _this.vgrid.switchBottom();
                    break;
                case 116:
                    break;
                case 121:
                    break;
                default:
                    return;
            }
            evt.preventDefault();
        };
    };
    Commander.prototype.showHidden = function (show) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Connection.showHidden(show)];
                    case 1:
                        _a.sent();
                        localStorage["showHidden"] = show;
                        this.leftView.refresh();
                        this.rightView.refresh();
                        return [2 /*return*/];
                }
            });
        });
    };
    Commander.prototype.darkTheme = function (activate) {
        return __awaiter(this, void 0, void 0, function () {
            var head, link, styleSheet;
            return __generator(this, function (_a) {
                if (activate) {
                    head = document.getElementsByTagName('head')[0];
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.id = 'darkThemeStylesheet';
                    link.type = 'text/css';
                    link.href = 'styles/dark.css';
                    link.media = 'all';
                    head.appendChild(link);
                }
                else {
                    styleSheet = document.getElementById("darkThemeStylesheet");
                    styleSheet.remove();
                }
                localStorage["darkTheme"] = activate;
                return [2 /*return*/];
            });
        });
    };
    Commander.prototype.currentItemChanged = function (item, directory) {
        if (item) {
            var text = directory + '\\' + item.name;
            this.footer.textContent = text;
            this.viewer.selectionChanged(text);
        }
        else {
            this.footer.textContent = "Nichts selektiert";
            this.viewer.selectionChanged();
        }
    };
    return Commander;
}());
document.addEventListener("DOMContentLoaded", function ready() {
    document.removeEventListener("DOMContentLoaded", ready, false);
    commanderInstance = new Commander();
}, false);
var commanderInstance;
//# sourceMappingURL=commander.js.map