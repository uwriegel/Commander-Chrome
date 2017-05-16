using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

[DataContract]
class Event
{
    [DataMember(EmitDefaultValue = false, Name = "serviceItems")]
    public Item[] ServiceItems { get; set; } = null;

    [DataMember(EmitDefaultValue = false, Name = "itemUpdates")]
    public ItemUpdate[] ItemUpdates { get; set; } = null;

    [DataMember(Name = "id")]
    public string Id { get; set; }

    [DataMember(Name = "refresh")]
    public bool Refresh{ get; set; }
}

