f = open('./wordlist-10000.txt','r')
lines = f.read().split('\n')
print(len(lines), ' words loaded')

filtered = []
for word in lines:
	if(len(word)>3):
		filtered.append(word)
		
print(len(filtered), ' words remain after filter')

f.close()

f = open('./wordlist.js',"w")

f.write('let MASTER_WORD_LIST = [\n')
for word in filtered[:1500]:
	f.write("'" + word + "',\n")
f.write("]")
f.close()
print('done')