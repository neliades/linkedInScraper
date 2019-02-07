
const fs = require('fs');
var path = require('path');
const scrapedin = require('scrapedin')
const {login} = require('../../config.js');
const email = login.email;
const password = login.password;
const searchResults = ['bhanifin', 'neliades', 'louis-otter', 'kenny-polyak'];

const {sample} = require('../../sample.js')
const {url} = require('../../sample.js')
const header = 'Name,URL,Headline,Location,Summary,Connections,Company Name(s),Position(s),Date Range(s),Duration(s),Description(s),School Name(s),Degree(s),Start(s),End(s),Volunteer Position(s),Experience(s),Description(s),Date Range(s),Duration(s),Skills,Accomplishments\n'

// //create a stream to write to a new file
// let stream = fs.createWriteStream(`./linkedInProfiles.csv`, { flags: 'a' });
// stream.write(header);

let buildUserObject = (URL, sample, cb) => {
    // console.log('buildUserObject evoked')
    let userInfo = {
        name : '',
        URL : '',
        headline : '',
        location : '',
        summary : '',
        connections : '',
        companies : [
        //     {
        //     name : '',
        //     position : '',
        //     range: '',
        //     duration: '',
        //     description: ''
        // }
        ],

        schools : [
        // {
        //     name: '',
        //     degree : '',
        //     start : '',
        //     end : ''
        // }
        ],

        volunteering : [
        //{
        //     position : '',
        //     experience : '',
        //     description : '',
        //     range : '',
        //     duration : ''
        // }
        ],
        skills : [],
        accomplishments : []
    }
    let count = 0;
    let count2 = 0;
    if (sample.profile.name !== undefined) userInfo.name = sample.profile.name;
    userInfo.URL = URL;
    if (sample.profile.headline !== undefined) userInfo.headline = sample.profile.headline;
    if (sample.profile.location !== undefined) userInfo.location = sample.profile.location;
    if (sample.profile.summary !== undefined) userInfo.summary = sample.profile.summary;
    if (sample.profile.connections !== undefined) userInfo.connections = sample.profile.connections.split('(')[1].split(')')[0];
   
    //for each company
    for (let i = 0;  i < sample.positions.length; i++) {
        let positionDetails = {
            name : '',
            position : '',
            range: '',
            duration: '',
            description: ''
        }
        //if there are multiple roles
        if (sample.positions[i].roles !== undefined) {
            //for each role
            if (sample.positions[i].title !== undefined) positionDetails.name = sample.positions[i].title;
            if (sample.positions[i].description !== undefined) positionDetails.description = sample.positions[i].description;
            for (let j = 0; j < sample.positions[i].roles.length; j++) {
                sample.positions[i].roles[j].title !== undefined ? positionDetails.position = sample.positions[i].roles[j].title : positionDetails.position = '';
                sample.positions[i].roles[j].date1 !== undefined ? positionDetails.range = sample.positions[i].roles[j].date1 : positionDetails.range = '';
                sample.positions[i].roles[j].date2 !== undefined ? positionDetails.duration = sample.positions[i].roles[j].date2 : positionDetails.duration = ''; 
                userInfo.companies.push(Object.assign({}, positionDetails));
            }
        
        //if there is only one role
        } else {
            if (sample.positions[i].companyName !== undefined) positionDetails.name = sample.positions[i].companyName;
            if (sample.positions[i].title !== undefined) positionDetails.position = sample.positions[i].title;
            if (sample.positions[i].description !== undefined) positionDetails.description = sample.positions[i].description;
            if (sample.positions[i].date1 !== undefined) positionDetails.range = sample.positions[i].date1;
            if (sample.positions[i].date2 !== undefined) positionDetails.duration = sample.positions[i].date2;
            userInfo.companies.push(positionDetails);
        }

    }


    for (let i = 0;  i < sample.educations.length; i++) {
        let schoolDetails = {
            name: '',
            degree : '',
            start : '',
            end : ''
        };
        if (sample.educations[i].title !== undefined) schoolDetails.name = sample.educations[i].title;
        if (sample.educations[i].degree !== undefined) schoolDetails.degree = sample.educations[i].degree;
        if (sample.educations[i].date1 !== undefined) schoolDetails.start = sample.educations[i].date1;
        if (sample.educations[i].date2 !== undefined) schoolDetails.end = sample.educations[i].date2;
        userInfo.schools.push(schoolDetails);
        
    }    
    
    for (let i = 0;  i < sample.volunteerExperience.length; i++) {
        let volunteerDetails = {
            position : '',
            experience : '',
            description : '',
            range : '',
            duration : ''
        };

        if (sample.volunteerExperience[i].title !== undefined) volunteerDetails.position = sample.volunteerExperience[i].title;
        if (sample.volunteerExperience[i].experience !== undefined) volunteerDetails.experience = sample.volunteerExperience[i].experience;
        if (sample.volunteerExperience[i].description !== undefined) volunteerDetails.description = sample.volunteerExperience[i].description;
        if (sample.volunteerExperience[i].date1 !== undefined) volunteerDetails.range = sample.volunteerExperience[i].date1;
        if (sample.volunteerExperience[i].date2 !== undefined) volunteerDetails.duration = sample.volunteerExperience[i].date2;
        userInfo.volunteering.push(volunteerDetails);

    }
        
    for (let i = 0;  i < sample.skills.length; i++) {
        let skillsDetails = {
            title : '',
            numOfEndorsements : '0'
        }
        if (sample.skills[i].title !== undefined) skillsDetails.title = sample.skills[i].title;
        if (sample.skills[i].count !== undefined) skillsDetails.numOfEndorsements = sample.skills[i].count;
        userInfo.skills.push(skillsDetails);
    }

    //for each type of accomplishment
    for (let i = 0;  i < sample.accomplishments.length; i++) {
        //for each accomplishment
        for (let j = 0; j < sample.accomplishments[i].items.length; j++) {
            userInfo.accomplishments.push(sample.accomplishments[i].items[j]);
        }
    }

      if (cb) cb(userInfo);
      return userInfo;
}





async function lookupProfiles(list, cb) {
    // console.log('lookupProfiles evoked')
    let profileScraper = await scrapedin({ email, password });
    for (let i = 0; i < list.length; i++) {
        let data = {};
        let URL = `https://www.linkedin.com${list[i]}`
        let profile = await profileScraper(URL)
        Object.assign(data, profile);
        cb(URL, data);
    }
}


const handleProfiles = (searchResults, cb) => {
    lookupProfiles(searchResults, (URL, data) => {
        buildUserObject(URL, data, cb)
    })
}


module.exports.lookupProfiles = lookupProfiles;
module.exports.buildUserObject = buildUserObject;
module.exports.handleProfiles = handleProfiles;