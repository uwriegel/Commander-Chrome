/**
 * Verwaltung der Spalten der TableView
 */
class ColumnsControl {
    /**
     * *
     * @param columns Die Spalten der zugehörigen TableView
     * @param id Die Id dieses ColumnControls
     * @param sortOffset
     */
    constructor(columns, id, itemsSorter) {
        this.columns = columns;
        this.id = id;
        this.itemsSorter = itemsSorter;
        this.itemTemplate = document.createElement("tr");
        this.itemTemplate.draggable = true;
        var td = document.createElement("td");
        td.classList.add("it-name");
        var nameDiv = document.createElement("div");
        nameDiv.classList.add("it-iconName");
        var img = document.createElement("img");
        img.classList.add("it-image");
        img.src = 'images/fault.png';
        img.alt = "";
        img.onerror = () => img.src = 'images/fault.png';
        var span = document.createElement("span");
        span.classList.add("it-nameValue");
        nameDiv.appendChild(img);
        nameDiv.appendChild(span);
        td.appendChild(nameDiv);
        this.itemTemplate.appendChild(td);
        this.itemTemplate.tabIndex = 0;
        for (var i = 1; i < columns.length; i++) {
            var td = document.createElement("td");
            td.classList.add(columns[i].class);
            this.itemTemplate.appendChild(td);
        }
    }
    /**
     * Initialisierung des ColumnControls
     * @param tableView Das HTMLElement der zugehörigen TableView
     */
    initialize(tableView) {
        this.tableView = tableView;
        var ths = tableView.getElementsByTagName("th");
        var json = localStorage[this.id];
        if (json) {
            var columnWidth = JSON.parse(json);
            this.setWidths(columnWidth);
        }
        else
            this.setWidths();
        var grippingReady = false;
        Array.from(ths).forEach((th, i) => {
            let columnIndex = i;
            th.onmousedown = evt => {
                var column = evt.target;
                if (!grippingReady) {
                    var ascending = column.classList.contains("sortAscending");
                    for (let i = 0; i < ths.length; i++) {
                        ths[i].classList.remove("sortAscending");
                        ths[i].classList.remove("sortDescending");
                    }
                    column.classList.add(ascending ? "sortDescending" : "sortAscending");
                    this.itemsSorter.sort(this.columns[columnIndex].itemSortKind, !ascending, true);
                }
                else
                    this.beginColumnDragging(evt.pageX, column);
            };
        });
        this.tableView.addEventListener('mousemove', evt => {
            var th = evt.target;
            if (th.localName == "th" && (th.offsetLeft > 0 || evt.pageX - th.getBoundingClientRect().left > 10)
                && (th.offsetLeft + th.offsetWidth < tableView.offsetWidth || evt.pageX - th.getBoundingClientRect().left < 4)
                && (th.getBoundingClientRect().left + th.offsetWidth - evt.pageX < 4 || evt.pageX - th.getBoundingClientRect().left < 4)) {
                document.body.style.cursor = 'ew-resize';
                grippingReady = true;
                this.previous = evt.pageX - th.getBoundingClientRect().left < 4;
            }
            else {
                document.body.style.cursor = 'default';
                grippingReady = false;
            }
        });
    }
    initializeEachColumn(eachColumnAction) {
        this.columns.forEach(eachColumnAction);
    }
    getItemTemplate() {
        return this.itemTemplate.cloneNode(true);
    }
    beginColumnDragging(startGripPosition, targetColumn) {
        document.body.style.cursor = 'ew-resize';
        var currentWidth = 0;
        var currentHeader;
        if (!this.previous)
            currentHeader = targetColumn;
        else
            currentHeader = targetColumn.previousElementSibling;
        var nextHeader = currentHeader.nextElementSibling;
        var currentLeftWidth = currentHeader.offsetWidth;
        var sumWidth = currentLeftWidth + nextHeader.offsetWidth;
        var onmove = (evt) => {
            if (evt.which == 0) {
                document.body.style.cursor = 'default';
                window.removeEventListener('mousemove', onmove);
                return;
            }
            document.body.style.cursor = 'ew-resize';
            var diff = evt.pageX - startGripPosition;
            if (currentLeftWidth + diff < 15)
                diff = 15 - currentLeftWidth;
            else if (diff > sumWidth - currentLeftWidth - 15)
                diff = sumWidth - currentLeftWidth - 15;
            var combinedWidth = this.getCombinedWidth(currentHeader, nextHeader);
            var leftWidth = currentLeftWidth + diff;
            var rightWidth = sumWidth - currentLeftWidth - diff;
            var factor = combinedWidth / sumWidth;
            leftWidth = leftWidth * factor;
            rightWidth = rightWidth * factor;
            currentHeader.style.width = leftWidth + '%';
            nextHeader.style.width = rightWidth + '%';
            var columnsWidths = this.getWidths();
            localStorage[this.id] = JSON.stringify(columnsWidths);
            evt.preventDefault();
        };
        window.addEventListener('mousemove', onmove);
    }
    getWidths() {
        var widths = new Array();
        var ths = this.tableView.getElementsByTagName("th");
        Array.from(ths).forEach((th, i) => {
            widths[i] = th.style.width;
            if (!widths[i])
                widths[i] = (100 / this.columns.length) + '%';
        });
        return widths;
    }
    setWidths(widths) {
        var ths = this.tableView.getElementsByTagName("th");
        if (!widths) {
            var width = 100 / ths.length;
            widths = [];
            for (var i = 0; i < ths.length; i++) {
                widths.push(width + '%');
            }
        }
        Array.from(ths).forEach((th, i) => {
            th.style.width = widths[i];
        });
    }
    getCombinedWidth(column, nextColumn) {
        var firstWidth = column.style.width ? parseFloat(column.style.width.substr(0, column.style.width.length - 1)) : 100 / this.columns.length;
        var secondWidth = nextColumn.style.width ? parseFloat(nextColumn.style.width.substr(0, nextColumn.style.width.length - 1)) : 100 / this.columns.length;
        return firstWidth + secondWidth;
    }
}
//# sourceMappingURL=columnscontrol.js.map