import os
import cv2

dir = os.getcwd() + '\\'

for file in os.listdir(dir):
	if(file.endswith('ball.png')):
		print(dir+file);
		#img = cv2.imread(dir + file, -1)
		#new_img = cv2.flip(img, 1)
		#cv2.imshow(file,img)
		#cv2.waitKey(0)
		#cv2.destroyAllWindows()
		print(file)
		newfile = file.replace('ball','_projectile')
		os.rename(file,newfile)
