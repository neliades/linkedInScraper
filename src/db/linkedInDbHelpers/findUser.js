
const {checkIfExists, queryWithInnerJoin} = require('../helpers.js') 


const findUser = async (url) => {

      let profile = await new Promise ( (resolve) => {
        let complete = (info, results) => resolve(results);
        try {
          checkIfExists(null, 'users', 'url', url, complete, complete);
        } catch (error) {
          resolve();
        }
      })
    
      if (profile && profile.length > 0) {

        let queryResults = {};
        queryResults.profile = profile[0];
        let id = profile[0].id;
    
        let positions = await new Promise ( (resolve) => {
          let complete = (results) => resolve(results);

          let desiredTablesAndFieldsObj = {
            companiesFROMusers : ['name', 'linkedInUrl', 'companyUrl'],
            positionsFROMcompanies : ['position', 'startToEnd', 'duration', 'description', 'location'],
          };
          let innerJoinsArr = [ 
            ['users'],
            ['users_companiesFROMusers', 'id_users', 'id'],
            ['companiesFROMusers', 'id', 'id_companiesFROMusers'],
            [ 'positionsFROMcompanies', 'id_companiesFROMusers', 'id']
          ];
          let whereArr = ['users', 'id', id];
          queryWithInnerJoin(desiredTablesAndFieldsObj, innerJoinsArr, whereArr, complete, complete);
        })
        queryResults.positions = positions;
    
        let educations = await new Promise ( (resolve) => {
          let complete = (results) => resolve(results);
    
          let desiredTablesAndFieldsObj = {
            schools : ['name'],
            degrees : ['degree', 'start', 'end']
          };
          let innerJoinsArr = [ 
            ['users'],
            ['users_schools', 'id_users', 'id'],
            ['schools', 'id', 'id_schools'],
            [ 'degrees', 'id_schools', 'id']
          ];
          let whereArr = ['users', 'id', id];
          queryWithInnerJoin(desiredTablesAndFieldsObj, innerJoinsArr, whereArr, complete, complete);
        })
        queryResults.educations = educations;
    
        let skills = await new Promise ( (resolve) => {
          let complete = (results) => resolve(results);
    
          let desiredTablesAndFieldsObj = {
            skills : ['name', 'endorsements']
          };
          let innerJoinsArr = [ 
            ['users'],
            ['users_skills', 'id_users', 'id'],
            ['skills', 'id', 'id_skills']
          ];
          let whereArr = ['users', 'id', id];
          queryWithInnerJoin(desiredTablesAndFieldsObj, innerJoinsArr, whereArr, complete, complete);
        })
        queryResults.skills = skills;
    
        // let accomplishments = await new Promise ( (resolve) => {
        //   let complete = (results) => resolve(results);
    
        //   let desiredTablesAndFieldsObj = {
        //     accomplishments : ['name']
        //   };
        //   let innerJoinsArr = [ 
        //     ['users'],
        //     ['users_accomplishments', 'id_users', 'id'],
        //     ['accomplishments', 'id', 'id_accomplishments']
        //   ];
        //   let whereArr = ['users', 'id', id];
        //   queryWithInnerJoin(desiredTablesAndFieldsObj, innerJoinsArr, whereArr, complete, complete);
        // })
        // queryResults.accomplishments = accomplishments;
    
        let volunteerExperience = await new Promise ( (resolve) => {
          let complete = (results) => resolve(results);

          let desiredTablesAndFieldsObj = {
            organizations : ['name'],
            positionsFROMorganizations : ['position', 'description', 'startToEnd', 'duration']
          };
          let innerJoinsArr = [ 
            ['users'],
            ['users_organizations', 'id_users', 'id'],
            ['organizations', 'id', 'id_organizations'],
            [ 'positionsFROMorganizations', 'id_organizations', 'id']
          ];
          let whereArr = ['users', 'id', id];
          queryWithInnerJoin(desiredTablesAndFieldsObj, innerJoinsArr, whereArr, complete, complete);
        })
        queryResults.volunteerExperience = volunteerExperience;
    
        return queryResults;
      }
}

module.exports = findUser;