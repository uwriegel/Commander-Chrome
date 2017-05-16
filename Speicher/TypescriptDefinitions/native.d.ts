
declare class sseEvent {
    data: string
}

declare class EventSource {
    constructor(url: string)
    addEventListener(eventName: string, onEvent: (evt: sseEvent) => void)
    onmessage: any
}

declare class GetItemsInput {
    directory: string
    requestNumber: number
    id: string
}

declare class GetItemsOutput {
    currentDirectory: string
    items: Item[]
}

declare class Favorite
{
    name: string
    path: string
    item: string
}

declare class Item {
    imageUrl: string
    name: string
    parent: string
    dateTime?: string
    isHidden?: boolean
    kind: ItemsKind
    updated?: string
    fileSize: number
    selected?: boolean

    version?: string
    exifDateTime?: string

    favoriteTarget?: string
    description?: string

    serviceName?: string
    startType?
    status? 
    value?
}

declare class ItemUpdate {
    index: number
    version: string
    dateTime: string
}

declare class ServiceItemUpdate
{
    serviceName: string    
    status: string
    imageUrl: string
}

declare class ConflictItem
{
    kind: ItemsKind
    imageUrl: string
    name: string
    sourceFileSize: number
    targetFileSize: number
    sourceVersion: string
    targetVersion: string
    sourceDateTime: string
    targetDateTime: string
}

interface IObservable {
    registerObservation(observator: IObservator)
    getItemsCount() 
}

interface IModel
{
    getItem(index: number): Item
}

interface IItemsViewModel
{
    /**
     * Einfügen der View an der Position 'index'
    * @param index Der Index des zugehörigen Eintrages
    */
    insertItem(index: number) 
    /**
    * Einfügen eines Testeintrages, um die Ausmaße im DOM zu bestimmen
    */
    insertMeasureItem()
    /**
     * Einfügen der Daten in die TableRow
    * @param itemElement
    * @param index Index des Eintrages, mit dem die TableRow gefüllt werden soll
    */
    updateItem(itemElement: HTMLTableRowElement, index: number)
}

interface IObservator
{
    ItemsCleared() 
    itemsChanged(lastCurrentIndex: number)
    updateItems()
    refreshSelection(itemIndex: number, isSelected: boolean)
    getCurrentItem()
}

interface IOperationData
{
    operation: string
    sourceDir: string
    targetDir?: string
    items: Item[]
}

declare class OperationCheckResult
{
    conflictItems: ConflictItem[]
    result: OperationCheck
    exception?: string
}


