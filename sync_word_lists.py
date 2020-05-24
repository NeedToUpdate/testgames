import os
import glob
import re

def isnt_whitespace(string):
    return re.fullmatch(r"\s*",string) is None


dir = os.getcwd() + '\\';

phonics = []
esls = []
esl1 = []
esl2 = []
esl3 = []
meb = []
random = []

regex = r"(\/\/?\s*let words\s*=\s*\[[a-zA-Z\',\/\s-]*\];?)"
title_regex = r"//=+[a-zA-Z0-9]*=*"


def organize_lines(string, index):
    lines = re.findall(regex,string)
    for line in lines:
        if index is 0:
            if line not in phonics:
                phonics.append(line)
        if index is 1:
            if line not in esls:
                esls.append(line)
        if index is 2:
            if line not in esl1:
                esl1.append(line)
        if index is 3:
            if line not in esl2:
                esl2.append(line)
        if index is 4:
            if line not in esl3:
                esl3.append(line)
        if index is 5:
            if line not in meb:
                meb.append(line)
        if index is 6:
            if line not in random:
                random.append(line)
        
for file in glob.iglob(dir + '**/words.txt' ,recursive = True):
    f = open(file,"r")
    text = f.read()
    sections = re.split(title_regex,text)
    filtered_sections = [item for item in sections if isnt_whitespace(item)]
    for index, part in enumerate(filtered_sections):
        organize_lines(part,index)
    f.close()

list = glob.glob(dir + '**/words.txt' ,recursive = True)

def make_doc(name):
    new_file = open(name,"w+")
    new_file.write('//===============PHONICS===============\n')
    new_file.write('\n')
    for line in phonics:
        new_file.write(line + '\n')
    new_file.write('\n//================ESLS=================\n')
    new_file.write('\n')
    for line in esls:
        new_file.write(line + '\n')
    new_file.write('\n//================ESL1=================\n')
    new_file.write('\n')
    for line in esl1:
        new_file.write(line + '\n')
    new_file.write('\n//================ESL2=================\n')
    new_file.write('\n')
    for line in esl2:
        new_file.write(line + '\n')
    new_file.write('\n//================ESL3=================\n')
    new_file.write('\n')
    for line in esl3:
        new_file.write(line + '\n')
    new_file.write('\n//=================MEB=================\n')
    new_file.write('\n')
    for line in meb:
        new_file.write(line + '\n')
    new_file.write('\n//================EXTRAS===============\n')
    new_file.write('\n')
    for line in random:
        new_file.write(line + '\n')
    new_file.write('\n\nlet difficulty = 1\n')
    new_file.write("\n\nlet words = ['remember','uncomment','needed','words','after','sync'];")
    new_file.close()


list.append(dir + 'allwords.txt')

for filename in list:
    try:
        os.remove(filename)
    except OSError:
        pass
    make_doc(filename)
    
