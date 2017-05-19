// TODO: Weiterentwicklung
//
// drives: Gespeicherte Ansichten
// F10 MENÜ Erklärung der Tastenkürzel oder Hilfe
// RegistryItems anzeigen
// NachRefresh Selektion erhalten
// Conflicts: conflict liste in die Focusable anhängen
// Rename auch von mehreren Dateien
// Mehrfach-Umbenennen
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
        leftView.setOnFocus(function () {
            focusedView = leftView;
        });
        rightView.setOnFocus(function () {
            focusedView = rightView;
        });
        var footer = document.getElementById("footer");
        leftView.initialize();
        rightView.initialize();
        leftView.focus();
        var gridElement = document.getElementById("grid");
        var viewerElement = document.getElementById("viewer");
        var grid = Grid(gridElement, document.getElementById("leftView"), document.getElementById("rightView"), document.getElementById("grip"), function () { return focusedView.focus(); });
        var vgrid = VerticalGrid(document.getElementById("vgrid"), gridElement, viewerElement, document.getElementById("vgrip"), function () { return focusedView.focus(); });
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
            console.log("Drag: " + x + ", " + y);
        if (rightView.isMouseInTableView(x, y))
            console.log("Drag: " + x + ", " + y);
    }
    function toggleHidden() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Connection.toggleHidden()];
                    case 1:
                        _a.sent();
                        leftView.refresh();
                        rightView.refresh();
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        getCommanderView: getCommanderView,
        dragOver: dragOver
    };
})();
//# sourceMappingURL=commander.js.map