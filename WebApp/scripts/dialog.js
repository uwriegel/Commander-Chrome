var Dialog = (function getDialog() {
    var shader;
    /// <var name="dialog" type="HTMLElement"></var>
    var dialog;
    var activeElement;
    /// <var name="buttonList" type="HTMLElement">OK-Knopf</var>
    var buttonList;
    /// <var name="ok" type="HTMLElement">OK-Knopf</var>
    var ok;
    /// <var name="cancel" type="HTMLElement">Abbrechen-Knopf</var>
    var cancel;
    /// <var name="no" type="HTMLElement">Nein-Knopf</var>
    var no;
    var focusableElements = [];
    var keydownProcessor;
    var input;
    var checkBox;
    /**
    * Die Liste der Konflikte beim Verschieben und Kopieren
    */
    var conflicts;
    /**
     * Die Einstellungen des ExtendedRename
     */
    var extendedRename;
    var dialogResultFunction;
    function initialize(text) {
        keydownProcessor = keydown;
        close();
        shader = document.createElement('div');
        shader.classList.add("shader");
        document.body.appendChild(shader);
        dialog = document.createElement('div');
        dialog.classList.add("dialog");
        dialog.textContent = text;
        buttonList = document.createElement('ul');
        dialog.appendChild(buttonList);
        ok = document.createElement('div');
        ok.setAttribute("tabindex", "0");
        ok.classList.add("dialogButton");
        ok.textContent = "OK";
        ok.onclick = function () {
            endDialog(DialogResult.OK);
        };
        ok.onkeyup = function (evt) {
            if (evt.which == 32)
                endDialog(DialogResult.OK);
        };
        var li = document.createElement('li');
        buttonList.appendChild(li);
        li.appendChild(ok);
    }
    function setOkCancel(okFunctionToSet) {
        dialogResultFunction = okFunctionToSet;
        cancel = document.createElement('div');
        cancel.setAttribute("tabindex", "0");
        cancel.classList.add("dialogButton");
        cancel.textContent = "Abbrechen";
        cancel.onclick = function () {
            endDialog(DialogResult.Cancel);
        };
        cancel.onkeyup = function (evt) {
            if (evt.which == 32)
                endDialog(DialogResult.Cancel);
        };
        var li = document.createElement('li');
        buttonList.appendChild(li);
        li.appendChild(cancel);
    }
    function setYesNoCancel(dialogResultFunctionToSet) {
        dialogResultFunction = dialogResultFunctionToSet;
        ok.textContent = "Ja";
        no = document.createElement('div');
        no.setAttribute("tabindex", "0");
        no.classList.add("dialogButton");
        no.textContent = "Nein";
        no.onclick = function () {
            endDialog(DialogResult.No);
        };
        no.onkeyup = function (evt) {
            if (evt.which == 32)
                endDialog(DialogResult.No);
        };
        var li = document.createElement('li');
        buttonList.appendChild(li);
        li.appendChild(no);
        cancel = document.createElement('div');
        cancel.setAttribute("tabindex", "0");
        cancel.classList.add("dialogButton");
        cancel.textContent = "Abbrechen";
        cancel.onclick = function () {
            endDialog(DialogResult.Cancel);
        };
        cancel.onkeyup = function (evt) {
            if (evt.which == 32)
                endDialog(DialogResult.Cancel);
        };
        li = document.createElement('li');
        buttonList.appendChild(li);
        li.appendChild(cancel);
    }
    function setInput(text, selectionCount) {
        var p = document.createElement('p');
        input = document.createElement('input');
        p.appendChild(input);
        input.type = "text";
        input.value = text;
        if (!selectionCount)
            input.select();
        else
            input.setSelectionRange(0, selectionCount);
        dialog.style.height = "100px";
        dialog.insertBefore(p, dialog.lastChild);
    }
    function setCheckBox(text) {
        var p = document.createElement('p');
        var label = document.createElement('label');
        p.appendChild(label);
        checkBox = document.createElement('input');
        checkBox.type = "checkbox";
        label.appendChild(checkBox);
        var textNode = document.createTextNode(text);
        label.appendChild(textNode);
        dialog.style.height = "130px";
        dialog.insertBefore(p, dialog.lastChild);
    }
    function addConflictView(operationCheckResult) {
        dialog.classList.add("conflictsDialog");
        conflicts = new ConflictView(dialog, operationCheckResult);
    }
    function addExtendedRename(itemsModel, observator) {
        var p = document.createElement('p');
        dialog.insertBefore(p, dialog.lastChild);
        extendedRename = new ExtendedRename(p, itemsModel, observator, endDialog);
        dialog.style.height = "160px";
        keydownProcessor = (evt) => extendedRename.keydown(evt);
        return extendedRename;
    }
    function show() {
        document.addEventListener('keydown', keydownProcessor, true);
        focusableElements = [];
        if (input)
            focusableElements.push(input);
        if (checkBox)
            focusableElements.push(checkBox);
        focusableElements.push(ok);
        if (no)
            focusableElements.push(no);
        if (cancel)
            focusableElements.push(cancel);
        activeElement = document.activeElement;
        document.body.appendChild(dialog);
        if (input)
            input.focus();
        else
            ok.focus();
        if (conflicts) {
            conflicts.initialize();
            if (conflicts.notToOverride())
                no.focus();
        }
        if (extendedRename)
            extendedRename.onShow();
        setTimeout(function () {
            if (shader)
                shader.classList.add('shaderVisible');
        }, 20);
    }
    function close() {
        buttonList = null;
        cancel = null;
        if (input)
            dialogInstance.text = input.value;
        else
            dialogInstance.text = null;
        input = null;
        if (checkBox)
            dialogInstance.isChecked = checkBox.checked;
        else
            dialogInstance.isChecked = null;
        checkBox = null;
        extendedRename = null;
        dialogResultFunction = null;
        document.removeEventListener('keydown', keydownProcessor, true);
        if (shader) {
            let thisShader = shader;
            shader = null;
            thisShader.classList.remove('shaderVisible');
            thisShader.addEventListener("webkitTransitionEnd", function endAni() {
                thisShader.removeEventListener("webkitTransitionEnd", endAni, false);
                thisShader.remove();
            }, false);
        }
        if (dialog)
            dialog.remove();
        dialog = null;
        if (activeElement)
            activeElement.focus();
        activeElement = null;
    }
    function endDialog(dialogResult) {
        var callFunction = dialogResultFunction;
        if (extendedRename && dialogResult == DialogResult.OK)
            extendedRename.initializeParameters();
        close();
        if (callFunction)
            callFunction(dialogResult);
    }
    function keydown(evt) {
        if ((document.activeElement == input || document.activeElement == checkBox) && evt.which != 9 && evt.which != 27) {
            if (evt.which == 13)
                endDialog(DialogResult.OK);
            return;
        }
        switch (evt.which) {
            case 9:
                if (focusableElements.length > 1) {
                    var indexToFocus = 0;
                    focusableElements.forEach(function (item, index) {
                        if (item == document.activeElement) {
                            if (evt.shiftKey) {
                                indexToFocus = index - 1;
                                if (indexToFocus == -1)
                                    indexToFocus = focusableElements.length - 1;
                            }
                            else {
                                indexToFocus = index + 1;
                                if (indexToFocus == focusableElements.length)
                                    indexToFocus = 0;
                            }
                        }
                    });
                    focusableElements[indexToFocus].focus();
                }
                break;
            case 13:
                if (ok == document.activeElement)
                    endDialog(DialogResult.OK);
                else if (cancel == document.activeElement)
                    endDialog(DialogResult.Cancel);
                else if (no == document.activeElement)
                    endDialog(DialogResult.No);
                break;
            case 27:
                endDialog(DialogResult.Cancel);
                break;
            case 32:
                if (ok == document.activeElement || no == document.activeElement || cancel == document.activeElement) {
                    document.activeElement.classList.add("buttonActive");
                    return;
                }
                break;
            case 37:
                {
                    var focused;
                    focusableElements.forEach(function (item, index) {
                        if (item == document.activeElement) {
                            var indexToFocus = index - 1;
                            if (!focused && indexToFocus >= 0) {
                                focusableElements[indexToFocus].focus();
                                focused = true;
                            }
                        }
                    });
                }
                break;
            case 39:
                {
                    var focused;
                    focusableElements.forEach(function (item, index) {
                        if (item == document.activeElement) {
                            var indexToFocus = index + 1;
                            if (!focused && indexToFocus < focusableElements.length) {
                                focusableElements[indexToFocus].focus();
                                focused = true;
                            }
                        }
                    });
                }
                break;
        }
        if (conflicts && conflicts.isTableView(evt.target))
            return;
        evt.preventDefault();
        evt.stopPropagation();
    }
    var dialogInstance = {
        initialize: initialize,
        setOkCancel: setOkCancel,
        setYesNoCancel: setYesNoCancel,
        setInput: setInput,
        setCheckBox: setCheckBox,
        addConflictView: addConflictView,
        addExtendedRename: addExtendedRename,
        close: close,
        text: null,
        isChecked: null,
        show: show
    };
    return dialogInstance;
})();
var DialogResult;
(function (DialogResult) {
    DialogResult[DialogResult["Cancel"] = 0] = "Cancel";
    DialogResult[DialogResult["OK"] = 1] = "OK";
    DialogResult[DialogResult["No"] = 2] = "No";
})(DialogResult || (DialogResult = {}));
//# sourceMappingURL=dialog.js.map