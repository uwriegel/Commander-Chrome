/**
 * Verbindung zur nativen Anwendung
 */
var Connection = (function () {
    var wsref = location.href.replace('http://', 'ws://');
    var url = `${wsref}Commander`;
    var webSocket = new WebSocket(url);
    var itemUpdatesCallbacks = {};
    var serviceItemsCallbacks = {};
    webSocket.onmessage = param => {
        var evt = JSON.parse(param.data);
        var id = evt.id;
        if (evt.itemUpdates)
            itemUpdatesCallbacks[evt.id](evt.itemUpdates);
        if (evt.serviceItems)
            serviceItemsCallbacks[evt.id](evt.serviceItems);
        if (evt.refresh)
            commanderInstance.getCommanderView(evt.id).refresh();
        if (evt.dragOver)
            commanderInstance.dragOver(evt.dragOver.x, evt.dragOver.y);
        if (evt.dragLeave)
            commanderInstance.dragLeave();
        if (evt.drop)
            commanderInstance.drop(evt.drop.x, evt.drop.y, evt.drop.dragDropKind, evt.drop.directory, evt.drop.items);
        if (evt.dragFinished)
            commanderInstance.getCommanderView(evt.dragFinished.commanderId).dragFinished(evt.dragFinished.refresh);
    };
    /**
     * Hinzufügen eines Eventhandlers für Dateiinfoupdates
     * @param id Die zugehörige ID
     * @param callback Rückruffunktion
     */
    function addFileEventSource(id, callback) {
        itemUpdatesCallbacks[id] = callback;
    }
    /**
     * Hinzufügen eines Eventhandlers für Dienststatusänderungen
     * @param id Die zugehörige ID
     * @param callback Rückruffunktion
     */
    function addServiceEventSource(id, callback) {
        serviceItemsCallbacks[id] = callback;
    }
    /**
     * Ermittlung aller Einträge eines Verzeichnisses
     * @param id Die Id des zugehörigen Controls
     * @param requestNumber die eindeutige, fortlaufende Nummer der Abfrage
     * @param directory Das Verzeichnis, das abgefragt werden soll
     */
    function getItems(id, requestNumber, directory) {
        var input = {
            id: id,
            requestNumber: requestNumber,
            directory: directory
        };
        return invoke("getItems", input);
    }
    function showHidden(show) {
        return invoke("showHidden", {
            show: show
        });
    }
    function startExplorer(directory) {
        return invoke("startExplorer", {
            directory: directory
        });
    }
    function checkFileOperation(operationData) {
        return invoke("checkFileOperation", operationData);
    }
    function createFolder(newName, directory) {
        return invoke("createFolder", {
            newName: newName,
            directory: directory
        });
    }
    /**
     * Ausführen der laufenden Operation
     * @param ignoreConflicts Sollen Konfliktdateien ignoriert werden?
     */
    function runOperation(idsToRefresh, ignoreConflicts) {
        return invoke("runOperation", { idsToRefresh: idsToRefresh, ignoreConflicts: ignoreConflicts });
    }
    /**
     * Abbruch der laufenden Operation
     */
    function cancel() {
        return invoke("cancel");
    }
    /**
     * Starten von Diensten
     * @param Die Service-Items
     */
    function rename(oldName, newName, directory, makeCopy, idToRefresh) {
        return invoke("rename", {
            oldName: oldName,
            newName: newName,
            directory: directory,
            makeCopy: makeCopy,
            idsToRefresh: [idToRefresh]
        });
    }
    function extendedRename(directory, items) {
        return invoke("extendedRename", {
            directory: directory,
            items: items
        });
    }
    function startDrag(commanderId, directory, items) {
        var input = {
            directory: directory,
            items: items,
            commanderId: commanderId
        };
        return invoke("startDrag", input);
    }
    function processItem(item, showProperties, openWith) {
        return invoke("processItem", {
            file: item,
            openWith: openWith,
            showProperties: showProperties
        });
    }
    /**
     * Starten von Diensten
     * @param Die Service-Items
     */
    function startServices(services) {
        return invoke("startServices", services);
    }
    /**
     * Stoppen von Diensten
     * @param Die Service-Items
     */
    function stopServices(services) {
        return invoke("stopServices", services);
    }
    function invoke(method, param) {
        return new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onload = evt => {
                var result = JSON.parse(xmlhttp.responseText);
                resolve(result);
            };
            xmlhttp.open('POST', `Commander/${method}`, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            xmlhttp.send(JSON.stringify(param));
        });
    }
    return {
        addFileEventSource: addFileEventSource,
        addServiceEventSource: addServiceEventSource,
        getItems: getItems,
        showHidden: showHidden,
        startExplorer: startExplorer,
        checkFileOperation: checkFileOperation,
        createFolder: createFolder,
        runOperation: runOperation,
        rename: rename,
        cancel: cancel,
        startDrag: startDrag,
        processItem: processItem,
        startServices: startServices,
        stopServices: stopServices,
        extendedRename: extendedRename
    };
})();
var OperationCheck;
(function (OperationCheck) {
    OperationCheck[OperationCheck["OK"] = 0] = "OK";
    OperationCheck[OperationCheck["Cancelled"] = 1] = "Cancelled";
    OperationCheck[OperationCheck["IdenticalDirectories"] = 2] = "IdenticalDirectories";
    OperationCheck[OperationCheck["NoSelection"] = 3] = "NoSelection";
    OperationCheck[OperationCheck["SubordinateDirectory"] = 4] = "SubordinateDirectory";
    OperationCheck[OperationCheck["ServiceNotSupported"] = 5] = "ServiceNotSupported";
    OperationCheck[OperationCheck["Incompatible"] = 6] = "Incompatible";
    OperationCheck[OperationCheck["AlreadyExists"] = 7] = "AlreadyExists";
    OperationCheck[OperationCheck["Unauthorized"] = 8] = "Unauthorized";
    OperationCheck[OperationCheck["CopyToFavorites"] = 9] = "CopyToFavorites";
})(OperationCheck || (OperationCheck = {}));
//# sourceMappingURL=connection.js.map