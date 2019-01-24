
const fs = require('fs');
var path = require('path');
const scrapedin = require('scrapedin')
const {login} = require('../config.js');
const email = login.email;
const password = login.password;
const searchResults = ['bhanifin', 'neliades', 'louis-otter', 'kenny-polyak'];

//const {sample} = require('../sample.js')
const header = 'Name,URL,Headline,Location,Summary,Connections,Company Name(s),Position(s),Date Range(s),Duration(s),Description(s),School Name(s),Degree(s),Start(s),End(s),Volunteer Position(s),Experience(s),Description(s),Date Range(s),Duration(s),Skills,Accomplishments\n'

//create a stream to write to a new file
let stream = fs.createWriteStream(`./linkedInProfiles.csv`, { flags: 'a' });
stream.write(header);

let addProfileToCSV = (URL, sample) => {
    let userInfo = {
        name : '',
        URL : '',
        headline : '',
        location : '',
        summary : '',
        connections : '',
        companies : {
            names : '',
            positions : '',
            ranges: '',
            durations: '',
            descriptions: ''
        },
        schools : {
            names: '',
            degrees : '',
            starts : '',
            ends : ''
        },
        volunteering : {
            positions : '',
            experiences : '',
            descriptions : '',
            ranges : '',
            durations : ''
        }, 
        skills : '',
        accomplishments : ''
    }
    let count = 0;
    let count2 = 0;
    if (sample.profile.name !== undefined) userInfo.name = sample.profile.name;
    userInfo.URL = URL;
    if (sample.profile.headline !== undefined) userInfo.headline = sample.profile.headline;
    if (sample.profile.location !== undefined) userInfo.location = sample.profile.location;
    if (sample.profile.summary !== undefined) userInfo.summary = sample.profile.summary;
    if (sample.profile.connections !== undefined) userInfo.connections = sample.profile.connections;
    
    for (let i = 0;  i < sample.positions.length; i++) {
        count ++
        let newLine = '';
        if (count > 1) newLine = '\n';
        if (sample.positions[i].roles !== undefined) {
            for (let j = 0; j < sample.positions[i].roles.length; j++) {
                if (j > 0) count++
                let newLine = '';
                if (j > 0) newLine = '\n';
                if (sample.positions[i].title !== undefined) userInfo.companies.names = userInfo.companies.names + newLine + count + ': ' + sample.positions[i].title;
                if (sample.positions[i].roles[j].title !== undefined) userInfo.companies.positions = userInfo.companies.positions + newLine + count + ': ' + sample.positions[i].roles[j].title;
                if (sample.positions[i].description !== undefined && j === 0) userInfo.companies.descriptions = userInfo.companies.descriptions + newLine + count + ': ' + sample.positions[i].description;
                if (sample.positions[i].roles[j].date1 !== undefined) userInfo.companies.ranges = userInfo.companies.ranges + newLine + count + ': ' + sample.positions[i].roles[j].date1;
                if (sample.positions[i].roles[j].date2 !== undefined) userInfo.companies.durations = userInfo.companies.durations + newLine + count + ': ' + sample.positions[i].roles[j].date2;      
            }   
        } else {
            if (sample.positions[i].companyName !== undefined) userInfo.companies.names = userInfo.companies.names + newLine + count + ': ' + sample.positions[i].companyName;
            if (sample.positions[i].title !== undefined) userInfo.companies.positions = userInfo.companies.positions + newLine + count + ': ' + sample.positions[i].title;
            if (sample.positions[i].description !== undefined) userInfo.companies.descriptions = userInfo.companies.descriptions + newLine + count + ': ' + sample.positions[i].description;
            if (sample.positions[i].date1 !== undefined) userInfo.companies.ranges = userInfo.companies.ranges + newLine + count + ': ' + sample.positions[i].date1;
            if (sample.positions[i].date2 !== undefined) userInfo.companies.durations = userInfo.companies.durations + newLine + count + ': ' + sample.positions[i].date2;
        }
        if (i === sample.positions.length - 1) count = 0;
    }
    
    for (let i = 0;  i < sample.educations.length; i++) {
        count ++
        let newLine = '';
        if (count > 1) newLine = '\n';
        if (sample.educations[i].title !== undefined) userInfo.schools.names = userInfo.schools.names + newLine + count + ': ' + sample.educations[i].title;
        if (sample.educations[i].degree !== undefined) userInfo.schools.degrees = userInfo.schools.degrees + newLine + count + ': ' + sample.educations[i].degree;
        if (sample.educations[i].date1 !== undefined) userInfo.schools.starts = userInfo.schools.starts + newLine + count + ': ' + sample.educations[i].date1;
        if (sample.educations[i].date2 !== undefined) userInfo.schools.ends = userInfo.schools.ends + newLine + count + ': ' + sample.educations[i].date2;
        if (i === sample.educations.length - 1) count = 0;
    }
    
    for (let i = 0;  i < sample.volunteerExperience.length; i++) {
        count ++
        let newLine = '';
        if (count > 1) newLine = '\n';
        if (sample.volunteerExperience[i].title !== undefined) userInfo.volunteering.positions = userInfo.volunteering.positions + newLine + count + ': ' + sample.volunteerExperience[i].title;
        if (sample.volunteerExperience[i].experience !== undefined) userInfo.volunteering.experiences = userInfo.volunteering.experiences + newLine + count + ': ' + sample.volunteerExperience[i].experience;
        if (sample.volunteerExperience[i].description !== undefined) userInfo.volunteering.descriptions = userInfo.volunteering.descriptions + newLine + count + ': ' + sample.volunteerExperience[i].description;
        if (sample.volunteerExperience[i].date1 !== undefined) userInfo.volunteering.ranges = userInfo.volunteering.ranges + newLine + count + ': ' + sample.volunteerExperience[i].date1;
        if (sample.volunteerExperience[i].date2 !== undefined) userInfo.volunteering.durations = userInfo.volunteering.durations + newLine + count + ': ' + sample.volunteerExperience[i].date2;
        if (i === sample.volunteerExperience.length - 1) count = 0;
    }
    for (let i = 0;  i < sample.skills.length; i++) {
        count ++
        let newLine = '';
        if (count > 1) newLine = '\n';
        let endorsements = ''
        if (sample.skills[i].count !== undefined) endorsements = ` (${sample.skills[i].count})`;
        userInfo.skills = userInfo.skills + newLine + count + ': ' + sample.skills[i].title + endorsements;
        if (i === sample.skills.length - 1) count = 0;
    }
    
    for (let i = 0;  i < sample.accomplishments.length; i++) {
        if (sample.accomplishments[i].items !==undefined) {
            count ++
            let newLine = '';
            if (count > 1) newLine = '\n';
            let groupList = '';
            for (let j = 0; j < sample.accomplishments[i].items.length; j++) {
              count2++;
              let newLine2 = '';
              if (count2 > 1) newLine2 = '\n';
              groupList = groupList + newLine2 + '  ' + count2 + ': ' + sample.accomplishments[i].items[j];
            }
            count2 = 0;
            userInfo.accomplishments = userInfo.accomplishments + newLine + 'Group ' + count + ':' + '\n' + groupList;
        }
        if (i === sample.volunteerExperience.length - 1) count = 0;
    }
    
    
    
      let deepObj = (obj, cb) => {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
              deepObj(obj[key], cb);
          } else {
              cb(obj, key)
          }
        }
      };
    
      deepObj(userInfo, (obj, key) => {
        obj[key] = `"${obj[key]}"`
      });
    
    
      let userInfoStr = '';
      deepObj(userInfo, (obj, key) => {
        let comma = ','
        if (userInfoStr === '') comma = '';
        userInfoStr = `${userInfoStr}${comma}${obj[key]}`
      });
      userInfoStr = userInfoStr + '\n';
    
    //   console.log('writing...')
      stream.write(userInfoStr);
    //   console.log('complete')
}





async function lookupProfile(list, cb) {
    let profileScraper = await scrapedin({ email, password });
    for (let i = 0; i < list.length; i++) {
        let data = {};
        let URL = `https://www.linkedin.com${list[i]}`
        let profile = await profileScraper(URL)
        Object.assign(data, profile);
        cb(URL, data);
    }
}





// lookupProfile(searchResults, (URL, data) => {
//     addProfileToCSV(URL, data)
// })


module.exports.lookupProfile = lookupProfile;
module.exports.addProfileToCSV = addProfileToCSV;