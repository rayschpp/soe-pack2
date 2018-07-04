soe-pack
=====

A library and utility for accessing SOE/Daybreak Games pack2 files

One of the features of pack2 is the lack of filenames - just hashes of those filenames are kept.  
So, soe-pack2 tries to guess the filenames, or at least file extensions, of the files.

Building
=====

Install [Node](http://nodejs.org/) and run:

    npm install

in project folder.

Running
=====

This project is very much WIP, in the state of Barely-Working.

But, if you really hate your PC and want to see it in pain, sure, have a go:

Example commands that are working for me right now, although at a drunken snail's pace:

`node packer.js filelist "C:\Program Files (x86)\Steam\steamapps\common\H1Z1\Resources\Assets" fileList_out_all.txt fileList_all.txt`

`node packer.js manifest "C:\Program Files (x86)\Steam\steamapps\common\H1Z1\Resources\Assets" manif_all.txt fileList_all.txt`

`node packer.js extractall "C:\Program Files (x86)\Steam\steamapps\common\H1Z1\Resources\Assets" packs_out fileList_all.txt`

In those examples:

* 'filelist', 'manifest', 'extractall' are the commands
* The path is the path where all the .pack2s are. For now, if you want to extract from fewer paths, just copy the pack2 files to some other directory, and use that directory path in the command. 
* filelist creates a new filelist (a list of *possible* filenames, with all that fancy filename/extension guessing)
  * filelist further parameters: 'fileList_out_all.txt' is the newly generated filelist, while 'fileList_all.txt' (as in other commands) is the input file, to speed up the process
* manifest creates a new manifest (a list of all files in pack2s), with 'manif_all.txt' being the generated file
* extractall extracts all files from the pack2s to 'packs_out' (The directory has to exist. I think.)

