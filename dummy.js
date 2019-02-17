const faker = require('mongoose-faker');

const Question = require('./models/question');
const QuizLevel = require('./models/quiz_level');
const UserScore = require('./models/user_score');
const UserAnswerMapping = require('./models/user_answer_mapping');
const User = require('./models/user');

const ApplicationSetting=require('./models/app_setting');

// Creata a document and save it to the db
try {
    let k = faker.generateObject(ApplicationSetting, { save: true});
    console.log(k.then(r => { console.log(r)}));
} catch (error) {
    console.log(error);
}
