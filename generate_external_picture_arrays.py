import os
from pathlib import Path
import glob
from datetime import datetime

old_file = open(os.getcwd() + '//image_config.js','r')
old_lines = old_file.read().split('\n')
internal_lines = []

internal_part = False
for line in old_lines:
	if internal_part:
		internal_lines.append(line)
		if 'END INTERNAL PICTURES' in line:
			break
	else:
		if 'BEGIN INTERNAL PICTURES' in line:
			internal_part = True
			internal_lines.append(line)

old_file.close()

relative_dir = '\\Classes\\Animals\\pngs\\'
animals_dir = str(Path(os.getcwd()).parent) + relative_dir

animals = []
for file in glob.iglob(animals_dir + '**.png'):
	animal = file[len(animals_dir):-4]
	animals.append(animal)

print('found ' + str(len(animals)) + ' pictures of animals. Generating file...') 	
	
file = open(os.getcwd() + '//image_config.js','w')


for line in internal_lines:
    file.write(line + '\n')

file.write('\n//=== BEGIN EXTERNAL PICTURES ===\n\n\n')
file.write('// This section is autogenerated from the images located at ' + animals_dir + ' by running the file generate_external_picture_arrays.py\n')
file.write('// Please don\'t edit this file directly to avoid errors.\n')
file.write('// Last creation date: ' + str(datetime.today().strftime('%Y-%m-%d-%H:%M:%S\n')) + '\n')
file.write('IMAGE_CONFIG.animals = {\n')
file.write('\tpath: \'..' + relative_dir.replace('\\','/') + '\',\n')
file.write('\tnum: ' + str(len(animals)) + ',\n')
file.write('\tsyntax: \'{valid_name}.png\'' + ',\n')
file.write('\tvalid_names: [' +  ' '.join(map(lambda x: '\'' + x + '\',',animals)) + ']\n')
file.write('};')
file.write('\n\n//=== END EXTERNAL PICTURES ===\n\n\n')


file.close()