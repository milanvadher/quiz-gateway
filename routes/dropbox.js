const dropboxV2Api = require('dropbox-v2-api');
const fs = require('fs');
var tmp = require('tmp');

const dropbox = dropboxV2Api.authenticate({
    token: 'uJNxE8nFAIAAAAAAAAABLKKQ5N4NIN8-XOsvGaOQD6RyPHAclIP9Ehs9StJvwGJy'
});
var dropbox_folder_path = '/';

async function upload_file(tmp_media_name, media_name) {
    return new Promise(function(resolve, reject) {
        dropbox({
            resource: 'files/upload',
            parameters: {
                path: dropbox_folder_path + media_name,
            },
            readStream: fs.createReadStream(tmp_media_name)
        }, (error, result, response) => {
            //upload completed
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

exports.upload_and_sharelink = async function (img_base64, media_name){
    return new Promise(function(resolve, reject) {
        var tmp_media_name = tmp.tmpNameSync();
        var data = img_base64.replace(/^data:image\/\w+;base64,/, '');
        // for media types other than image, check above replacement
        fs.writeFile(tmp_media_name, data, {encoding: 'base64'}, async function(error){
            if(error){
                console.log(error);
                reject(error);
                return;
            }
            await upload_file(tmp_media_name, media_name).then(function(result){
                console.log("dropbox_folder_path + media_name ", dropbox_folder_path + media_name);
                dropbox({
                    resource: 'sharing/create_shared_link_with_settings',
                    parameters: {
                        'path': dropbox_folder_path + media_name,
                        'settings': {
                            'requested_visibility': 'public'
                        }
                    }
                }, (error, result, response) => {
                    if(error){
                        console.log(error);
                        reject(error);
                        return;
                    }
                    var dropbox_com = 'www.dropbox.com';
                    var dropbox_usercontent_url = 'https://dl.dropboxusercontent.com';
                    var unique_file_string = result.url.indexOf(dropbox_com) + dropbox_com.length;
                    var download_url = dropbox_usercontent_url + result.url.substr(unique_file_string);
                    resolve(download_url);
                    // console.log('error, result, response ', error, result, response);
                });
            }).catch(function(error) {
                console.log(error);
                reject(error);
                return;                
            });
        });
    });
}
// (async () => {
//     var img_base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
//     var media_name = 'example123.png';
//     // var download_url = await upload_and_sharelink(img_base64, media_name);
//     console.log("download_url ", download_url);
// })();

// Test payload for postman
// {
//     "mht_id":29077,
//     "image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
// }