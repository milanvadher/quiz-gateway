var request = 	require('request');
const RESTKEY = 'ZmYwY2NkNTAtZTFjNC00MmFkLWJiMjQtNWYwYWM4MzAzYmZk';
const APPID = '92246c90-f7d7-4a28-b765-11aa85b9e3f1';
const TEMPLATE_ID = '0b0678b4-73aa-4e01-9273-47e6da46d5e7';
const APP_SMALL_ICON_URL = "https://purecelibacy.org/target-zero/wp-content/uploads/2018/04/TFinal_B_192.jpg";
const sendMessage = exports.sendMessage = function(message){
	request(
		{
			method:'POST',
			uri:'https://onesignal.com/api/v1/notifications',
			headers: {
				"authorization": "Basic "+ RESTKEY,
				"content-type": "application/json"
			},
			json: true,
			body:{
				'app_id': APPID,
				'contents': {en: message},
				'included_segments': ["All"],
				'template_id' : TEMPLATE_ID
			}
		},
		function(error, response, body) {
			if(!body.errors){
				console.log(body);
			}else{
				console.error('Error:', body.errors);
			}
			
		}
	);
}

exports.sendNewChallengeMsg = function() {
	sendMessage("New Question is Added. Please give answer to get more score");
}

//sendMessage('a9fb63b1-b5cc-4ee9-92f0-5be15eb300c0', 'Hello!');
// Also accepts an array of devices