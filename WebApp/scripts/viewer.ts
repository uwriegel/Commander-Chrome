
/**
 * Anzeige der Dateien unten in der Ansicht
 */
function Viewer() {
    
    var viewer = <HTMLElement>document.getElementById("viewer")
    var img = <HTMLImageElement>document.getElementById("viewerImg")
    var video = <HTMLVideoElement>document.getElementById("viewerVideo")
    var frame = <HTMLIFrameElement>document.getElementById("viewerFrame")
    var lastFile

    var timer = null
    function selectionChanged(item?) {
        if (viewer.classList.contains("displayNone")) {
            if (lastFile) {
                video.src = null
                frame.src = null
                img.src = null
                lastFile = null
            }
            return
        }
            
        if (lastFile == item)
            return
        lastFile = item;
        if (timer)
            clearTimeout(timer)
        timer = null

        timer = setTimeout(function () {
            if (item)
            {
                //let itemCoded = `/Commander/File?path=${btoa(item)}`
                let itemCoded = `/Commander/File?path=${btoa(encodeURIComponent(item))}`
                
                let itemcheck = item.toLowerCase()
                if (itemcheck.endsWith(".mp4") || itemcheck.endsWith(".mkv") || itemcheck.endsWith(".mp3") || itemcheck.endsWith(".wav"))
                {
                    img.classList.add("displayNone")
                    frame.classList.add("displayNone")
                    video.classList.remove("displayNone")
                    if (video.src != itemCoded)
                        video.src = itemCoded
                }
                else if (itemcheck.endsWith(".jpg") || itemcheck.endsWith(".png") || itemcheck.endsWith(".ico"))
                {
                    img.classList.remove("displayNone")
                    img.src = itemCoded
                    frame.classList.add("displayNone")
                    video.classList.add("displayNone")
                    video.pause()
                }
                else if (itemcheck.endsWith(".pdf") || itemcheck.endsWith("cs") || itemcheck.endsWith("html") || itemcheck.endsWith("xml")
                    || itemcheck.endsWith("java") || itemcheck.endsWith("xaml") || itemcheck.endsWith("java")
                    || itemcheck.endsWith("js") || itemcheck.endsWith("css"))
                {
                    img.classList.add("displayNone")
                    video.classList.add("displayNone")
                    video.pause()
                    frame.classList.remove("displayNone")
                    frame.src = itemCoded
                }
                else
                {
                    img.classList.add("displayNone")
                    video.classList.add("displayNone")
                    video.pause()
                    frame.classList.add("displayNone")
                }
            }
            else
            {
                img.classList.add("displayNone")
                video.classList.add("displayNone")
                video.pause()
                frame.classList.add("displayNone")
            }
        }, 50)
    }

    return {
        selectionChanged: selectionChanged
    }
}