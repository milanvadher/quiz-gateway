
# pip install dropbox
# pip install pymongo
# pip install python-magic
    
import dropbox
import pymongo
import tempfile
import base64
import magic
from dropbox.files import WriteMode

from pprint import pprint as pprint_fun
mongoclient = pymongo.MongoClient("localhost", 27017)
db = mongoclient.QuizGateWay
dropbox_client = dropbox.Dropbox("uAcAIaPElKAvNERNONIJGvnA8JLAxKSQA-68AFIyyQh4OJ9PAAAAwXG9sHs5NtBD")

users = db.users

for user in users.find():
    try:
        if not 'img' in user:
            print "image not found"
            continue
        user_img = user['img']
        imgdata_base64 = base64.b64decode(user_img)
        dropfilename = '/profile_'+str(user['mht_id'])+'.png'
        filename = '..' + dropfilename
        print "Uploading image ", filename
        with open(filename, 'wb') as f:
            f.write(imgdata_base64)

        with open(filename, 'r') as f:
            res = dropbox_client.files_upload(f.read(), dropfilename, mode=WriteMode('overwrite'))
            share_data = dropbox_client.sharing_create_shared_link_with_settings(dropfilename)
            dropbox_com = 'www.dropbox.com'
            dropbox_usercontent_url = 'https://dl.dropboxusercontent.com'
            unique_fileid_index = share_data.url.index(dropbox_com) + len(dropbox_com)
            img_dropbox_url = dropbox_usercontent_url + share_data.url[unique_fileid_index:]

            result = users.update_many( 
                {"mht_id":user['mht_id']}, 
                {"$set":{"img_dropbox_url": img_dropbox_url},})
            print "img_dropbox_url ", img_dropbox_url

    except Exception, e:
        # print("e ", e)
        print("Shared already: ", e.error.is_shared_link_already_exists())
        # import pdb;pdb.set_trace()