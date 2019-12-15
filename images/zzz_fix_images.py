import os
import cv2

dir = os.getcwd() + '\\'

for file in os.listdir(dir):
	if(file.startswith('ultraman2') or file.startswith('ultraman4')):
		print(dir+file);
		img = cv2.imread(dir + file, -1)
		new_img = cv2.flip(img, 1)
		#cv2.imshow(file,img)
		#cv2.waitKey(0)
		#cv2.destroyAllWindows()
		print(file)
		cv2.imwrite(file, new_img)
