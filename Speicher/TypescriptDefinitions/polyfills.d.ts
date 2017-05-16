interface ArrayConstructor
{
    from(arrayLike): any
}

interface Array<T>
{
    find(predicate: (search: T, index?: number) => boolean): T
}

interface String
{
    startsWith(searchString: string, position?: number)
}
