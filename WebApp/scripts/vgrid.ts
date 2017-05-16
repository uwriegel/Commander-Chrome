
/**
 * Oben beide CommanderViews, unten, wenn eingeschaltet, der Viewer
 * @param gridContainer der beinhaltende Container
 * @param topView die obere Ansicht
 * @param bottomView die untere Ansicht
 * @param gridSplitter der Teiler
 * @param onChanged Callback, wird aufgerufen wenn die Aufteilung geändert wurde
  */
function VerticalGrid(gridContainer: HTMLDivElement, topView: HTMLElement, bottomView: HTMLElement,
    gridSplitter: HTMLDivElement, onChanged: () => void)
{
    var grid = Grid(gridContainer, topView, bottomView, gridSplitter, (firstPercent) =>
    {
        topPercent = firstPercent
        localStorage["vgrid"] = firstPercent
        onChanged()
    }, true)

    var topPercent = localStorage["vgrid"]
    if (!topPercent)
        topPercent = 70
    grid.setSize(topPercent)    
    switchBottom()

    /**
     * Ein/Ausblenden der unteren Ansicht
     */
    function switchBottom()
    {
        if (bottomView.classList.contains("displayNone"))
        {
            bottomView.classList.remove("displayNone")
            gridSplitter.classList.remove("displayNone")
            topView.style.height = `calc(${topPercent}% - 3px)`
        }
        else
        {
            bottomView.classList.add("displayNone")
            gridSplitter.classList.add("displayNone")
            topView.style.height = "100%"
        }
    }

    return {
        switchBottom: switchBottom
    }
}

