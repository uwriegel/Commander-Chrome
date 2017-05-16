﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Commander
{
    public static class FolderCreator
    {
        public static void Create(NewName createFolder, bool elevated = false)
        {
            var path = Path.Combine(createFolder.directory, createFolder.newName);
            Create(path, elevated);
        }

        public static void Create(string path, bool elevated)
        {
            if (Directory.Exists(path))
                throw new AlreadyExistsException();
            try
            {
                Directory.CreateDirectory(path);
            }
            catch (UnauthorizedAccessException)
            {
                if (elevated || !ElevatedOperation.CreateFolder(path))
                    throw;
            }
        }
    }
}
