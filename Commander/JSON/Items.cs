using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

[DataContract]
class Items
{
#pragma warning disable 649

    [DataMember]
    public string directory;
    [DataMember]
    public Item[] items;

#pragma warning restore 649
}

