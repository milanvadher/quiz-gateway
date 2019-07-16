const faker = require('mongoose-faker');

const Question = require('./models/question');
const QuizLevel = require('./models/quiz_level');
const UserScore = require('./models/user_score');
const UserAnswerMapping = require('./models/user_answer_mapping');
const User = require('./models/user');
const UserHistory = require('./models/usershistory');

const ApplicationSetting=require('./models/app_setting');

// Creata a document and save it to the db
(async function cleanupMonthly() {
	console.log("fff");
	try {
		console.log("ggg");
        let userSc = await User.find({ "totalscore_month": { $gt: 0 } });
        console.log("userSc ", userSc);
        if (!userSc || userSc.length > 0) {
            userSc.forEach(async o => {
                console.log('o ', o);
                let userhistory = new UserHistory(
                    {
                        "mht_id": o.mht_id,
                        "monthlyscore": o.totalscore_month,
                        "monthdate": date
                    }
                );
              userhistory.save();
            })
        }
	} catch (error) {
		console.log(error);
	}
 })();

