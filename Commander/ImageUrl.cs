﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Commander
{
    public static class ImageUrl
    {
        public static string Get(string name, string extension, string fullname)
        {
            string file;
            if (string.Compare(extension, ".exe", true) == 0)
                file = fullname;
            else
                file = extension;
            return string.Format("Commander/Icon?file={0}", file);
        }
    }
}
