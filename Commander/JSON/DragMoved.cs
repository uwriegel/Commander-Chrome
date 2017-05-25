using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

[DataContract]
class DragMoved
{
    [DataMember(Name = "commanderId")]
    public string CommanderId { get; set; }
}

