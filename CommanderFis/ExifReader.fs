namespace Commander
open System
open System.Collections.Generic
open System.Globalization
open System.IO
open System.Security
open System.Text

module ExifReader =
        
    [<AllowNullLiteral>]
    type Reader (getTagValue: (uint16 -> Object), reader: BinaryReader) =
        let getTagValue = getTagValue
        let reader = reader
        interface IDisposable with
            member x.Dispose() = reader.Dispose ()
        member this.GetTagValue with get() = getTagValue

    let GetExif fileName: Reader =  

        let mutable reader: BinaryReader = null

        /// Indicates whether to read data using big or little endian byte aligns
        let mutable isLittleEndian = false

        /// The position in the filestream at which the TIFF header starts
        let mutable tiffHeaderStart = 0L

        /// The catalogue of tag ids and their absolute offsets within the file
        let mutable catalogue = null 

        /// Returns the length (in bytes) per component of the specified TIFF data type
        let GetTIFFFieldLength tiffDataType = 
            match tiffDataType with
            | 1us | 2us | 6us -> 1uy
            | 3us | 8us -> 2uy
            | 4us | 7us| 9us| 11us -> 4uy
            | 5us | 10us -> 8uy
            | _ -> failwithf "Unknown TIFF datatype: %A" tiffDataType

        let ReadBytes byteCount = 
            reader.ReadBytes(byteCount)

        /// Reads some bytes from the specified TIFF offset
        let ReadBytesWithOffset (tiffOffset: uint16) byteCount =
            // Keep the current file offset
            let originalOffset = reader.BaseStream.Position

            // Move to the TIFF offset and retrieve the data
            reader.BaseStream.Seek((int64)tiffOffset + tiffHeaderStart, SeekOrigin.Begin) |> ignore

            let data = reader.ReadBytes(byteCount)

            // Restore the file offset
            reader.BaseStream.Position <- originalOffset
            data

        let ToSByte (data: Byte[]) = 
            // An sbyte should just be a byte with an offset range.
            sbyte (data.[0] - Byte.MaxValue)

        let ToShort (data: Byte []) = 
            match data.Length with
            | 0 -> 0s
            | _ -> 
                if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
                BitConverter.ToInt16(data, 0)

        /// Converts 2 bytes to a ushort using the current byte aligns
        let ToUShort (data: Byte []) = 
            match data.Length with
            | 0 -> 0us
            | _ -> 
                if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
                BitConverter.ToUInt16(data, 0)

        /// Converts 4 bytes to an int using the current byte aligns
        let ToInt (data: Byte[]) =
            if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
            BitConverter.ToInt32(data, 0)

        /// Converts 4 bytes to a uint using the current byte aligns
        let ToUInt (data: Byte[]) =
            if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
            BitConverter.ToUInt32(data, 0)

        /// Converts 8 bytes to a signed rational using the current byte aligns.
        /// A TIFF rational contains 2 4-byte integers, the first of which is
        /// the numerator, and the second of which is the denominator.
        let ToRational (data: byte[]) =
            let numeratorData = Array.zeroCreate 4
            let denominatorData = Array.zeroCreate 4

            Array.Copy(data, numeratorData, 4)
            Array.Copy(data, 4, denominatorData, 0, 4)

            let numerator = ToInt(numeratorData)
            let denominator = ToInt(denominatorData)

            (double)numerator / double denominator

        /// Converts 8 bytes to an unsigned rational using the current byte aligns.
        let ToURational (data: byte[]) =
            let numeratorData = Array.zeroCreate 4
            let denominatorData = Array.zeroCreate 4

            Array.Copy(data, numeratorData, 4)
            Array.Copy(data, 4, denominatorData, 0, 4)

            let numerator = ToUInt(numeratorData)
            let denominator = ToUInt(denominatorData)

            (double)numerator / double denominator

        let ToSingle (data: byte[]) =
            if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
            BitConverter.ToSingle(data, 0)

        let ToDouble (data: byte[]) =
            if isLittleEndian <> BitConverter.IsLittleEndian then System.Array.Reverse(data)
            BitConverter.ToDouble(data, 0)

        let ReadString (chars: int) =
            ReadBytes chars |> Encoding.ASCII.GetString

        /// Gets a 2 byte unsigned integer from the file
        let ReadUShort _ =
            ReadBytes 2 |> ToUShort

        /// Gets a 4 byte unsigned integer from the file
        let ReadUInt _ =
            ReadBytes 4 |> ToUInt

        /// Retrieves an array from a byte array using the supplied converter
        /// to read each individual element from the supplied byte array
        let GetArray (data: byte[]) (elementLengthBytes: byte) (converter: Byte[] -> Object) = 
            let convertedData = Array.CreateInstance(typedefof<Object>, data.Length / int elementLengthBytes) 
            let buffer = Array.zeroCreate (int elementLengthBytes)

            // Read each element from the array
            [0..data.Length/int elementLengthBytes - 1] |> List.iter (fun elementCount ->
                // Place the data for the current element into the buffer
                Array.Copy(data, elementCount * (int elementLengthBytes), buffer, 0, int elementLengthBytes)
                // Process the data and place it into the output array
                convertedData.SetValue(converter(buffer), elementCount))

            convertedData

        /// Scans to the Exif block
        let ReadToExifStart () = 
            // The file has a number of blocks (Exif/JFIF), each of which
            // has a tag number followed by a length. We scan the document until the required tag (0xFFE1)
            // is found. All tags start with FF, so a non FF tag indicates an error.

            // Get the next tag.
            let mutable markerStart = 0uy
            let mutable markerNumber = 0uy

            let readStartAndMarker () =
                markerStart <- reader.ReadByte()
                markerNumber <- reader.ReadByte()
                markerStart = 0xFFuy && markerNumber <> 0xE1uy

            while readStartAndMarker () do
                // Get the length of the data.
                let dataLength = ReadUShort ()

                // Jump to the end of the data (note that the size field includes its own size)!
                reader.BaseStream.Seek(int64 dataLength - 2L, SeekOrigin.Current) |> ignore

            // It's only success if we found the 0xFFE1 marker
            match (markerStart, markerNumber) with
            | (0xFFuy, 0xE1uy) -> true
            | _ -> false //throw new Exception("Could not find Exif data block");

        /// Records all Exif tags and their offsets within
        /// the file from the current IFD
        let CatalogueIFD _ = 
            if catalogue = null then catalogue <- new Dictionary<uint16, int64>() 
                    
            // Assume we're just before the IFD.

            // First 2 bytes is the number of entries in this IFD
            let entryCount = ReadUShort ()
                
            [1us..entryCount] |> List.iter (fun _ ->
                let currentTagNumber = ReadUShort ()

                // Record this in the catalogue
                catalogue.[currentTagNumber] <- reader.BaseStream.Position - 2L;

                // Go to the end of this item (10 bytes, as each entry is 12 bytes long)
                reader.BaseStream.Seek(10L, SeekOrigin.Current) |> ignore) 

        /// Gets the data in the specified tag ID, starting from before the IFD block.
        /// returns (data, tiffDataType, numberOfComponents)
        let GetTagBytes tagID = // , out ushort tiffDataType, out uint numberOfComponents)
            // Get the tag's offset from the catalogue and do some basic error checks
            if catalogue = null || catalogue.ContainsKey(tagID) = false then (null, 0us, 0u)
            else
                let tagOffset = catalogue.[tagID]

                // Jump to the TIFF offset
                reader.BaseStream.Position <- tagOffset

                // Read the tag number from the file
                let currentTagID = ReadUShort ()

                if currentTagID <> tagID then failwith "Tag number not at expected offset"

                // Read the offset to the Exif IFD
                let tiffDataType = ReadUShort ()
                let numberOfComponents = ReadUInt ()
                let mutable tagData = ReadBytes 4

                // If the total space taken up by the field is longer than the
                // 2 bytes afforded by the tagData, tagData will contain an offset
                // to the actual data.
                let dataSize = (int)numberOfComponents * (int)(GetTIFFFieldLength tiffDataType)

                if dataSize > 4 then
                    let offsetAddress = ToUShort tagData
                    (ReadBytesWithOffset offsetAddress dataSize, tiffDataType, numberOfComponents)
                else
                    // The value is stored in the tagData starting from the left
                    System.Array.Resize(&tagData, dataSize)
                    (tagData, tiffDataType, numberOfComponents)

        /// Retrieves an Exif value with the requested tag ID
        let GetTagValue tagID : Object =
            let (tagData, tiffDataType, numberOfComponents) = GetTagBytes tagID

            match tagData with 
            | null -> null
            | _ ->
                let fieldLength = GetTIFFFieldLength tiffDataType

                // Convert the data to the appropriate datatype. Note the weird boxing via object.
                // The compiler doesn't like it otherwise.
                match tiffDataType with
                | 1us ->
                    // unsigned byte
                    if numberOfComponents = 1u then tagData.[0] :> Object
                    else tagData :> Object
                | 2us ->
                    // ascii string
                    let rawstr = Encoding.ASCII.GetString tagData

                    // There may be a null character within the string
                    let nullCharIndex = rawstr.IndexOf "\0"
                    let str = 
                        match nullCharIndex with
                        | -1 -> rawstr
                        | _str -> rawstr.Substring(0, nullCharIndex)
                    str :> Object
                | 3us ->
                    // unsigned short
                    match numberOfComponents with 
                    | 1u -> ToUShort tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToUShort(bs) :> Object) :> Object
                | 4us ->
                    // unsigned long
                    match numberOfComponents with 
                    | 1u -> ToUInt tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToUInt(bs) :> Object) :> Object
                | 5us ->
                    // unsigned rational
                    match numberOfComponents with 
                    | 1u -> ToURational tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToURational(bs) :> Object) :> Object
                | 6us ->
                    // signed byte
                    match numberOfComponents with 
                    | 1u -> ToSByte tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToSByte(bs) :> Object) :> Object
                | 7us ->
                    // undefined. Treat it as an unsigned integer.
                    match numberOfComponents with 
                    | 1u -> ToUInt tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToUInt(bs) :> Object) :> Object
                | 8us ->
                    // Signed short
                    match numberOfComponents with 
                    | 1u -> ToShort tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToShort(bs) :> Object) :> Object
                | 9us ->
                    // Signed long
                    match numberOfComponents with 
                    | 1u -> ToInt tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToInt(bs) :> Object) :> Object
                | 10us ->
                    // signed rational
                    match numberOfComponents with 
                    | 1u -> ToRational tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToRational(bs) :> Object) :> Object
                | 11us ->
                    // single float
                    match numberOfComponents with 
                    | 1u -> ToSingle tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToSingle(bs) :> Object) :> Object
                | 12us ->
                    // double float
                    match numberOfComponents with 
                    | 1u -> ToDouble tagData :> Object
                    | _ -> GetArray tagData fieldLength (fun bs -> ToDouble(bs) :> Object) :> Object
                | _ -> null

        /// Reads through the Exif data and builds an index of all Exif tags in the document
        let CreateTagIndex () = 
            // The next 4 bytes are the size of the Exif data.
            ReadUShort () |> ignore

            // Next is the Exif data itself. It starts with the ASCII "Exif" followed by 2 zero bytes.
            if ReadString 4 <> "Exif" then failwith "Exif data not found"
                
            // 2 zero bytes
            if ReadUShort () <> 0us then failwith "Malformed Exif data"
                    
            // We're now into the TIFF format
            tiffHeaderStart <- reader.BaseStream.Position

            // What byte align will be used for the TIFF part of the document? II for Intel, MM for Motorola
            isLittleEndian <- ReadString 2 = "II"

            // Next 2 bytes are always the same.
            if ReadUShort () <> 0x002Aus then failwith "Error in TIFF data"
                    
            // Get the offset to the IFD (image file directory)
            let ifdOffset = ReadUInt ()

            // Note that this offset is from the first byte of the TIFF header. Jump to the IFD.
            reader.BaseStream.Position <- int64 ifdOffset + tiffHeaderStart

            // Catalogue this first IFD (there will be another IFD)
            CatalogueIFD ()

            // There's more data stored in the subifd, the offset to which is found in tag 0x8769.
            // As with all TIFF offsets, it will be relative to the first byte of the TIFF header.
            let mutable offset = GetTagValue 0x8769us 
            if offset = null then failwith "Unable to locate Exif data"

            // Jump to the exif SubIFD
            let mutable offsetInt:uint32 = unbox offset
            reader.BaseStream.Position <- int64 offsetInt + tiffHeaderStart

            // Add the subIFD to the catalogue too
            CatalogueIFD ()

            // Go to the GPS IFD and catalogue that too. It's an optional section.
            offset <- GetTagValue 0x8825us 
            if offset <> null then
                // Jump to the GPS SubIFD
                let mutable offsetInt:uint32 = unbox offset
                reader.BaseStream.Position <- int64 offsetInt + tiffHeaderStart 
                // Add the subIFD to the catalogue too
                CatalogueIFD ()

        let HasExif _ =
            // Make sure the file's a JPEG.
            let result = 
                match ReadUShort () with
                | 0xFFD8us -> ReadToExifStart ()
                | _ -> false
            result
                
        let GetExifData _ =
            CreateTagIndex ()
            new Reader(GetTagValue, reader)

        try 
            let fileStream = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)
            reader <- new BinaryReader(fileStream)
            match HasExif () with 
            | false -> 
                reader.Dispose();
                null
            | true -> GetExifData ()
        with  
            _ -> 
                reader.Dispose();
                null
            
        
    


