const {linkedIn} = require('../../selectorsList.js');
const selectors = linkedIn.errorHandling;

const determineWhichLogin = async (page) => {
    try {
        let found = false;
        for (let key in selectors) {
            if (key !== 'captcha' && key !== 'defaultConfirmation') {
                try {
                    let selectorsObj = {
                        email : selectors[key].email,
                        password : selectors[key].password,
                        submit : selectors[key].submit
                    }
                    if (!found) await page.waitFor(selectorsObj.email);
                    let emailExists = await page.$(selectorsObj.email);
                    let passwordExists = await page.$(selectorsObj.password);
                    let submitExists = await page.$(selectorsObj.submit);
                    if(emailExists && passwordExists && submitExists) return selectorsObj;

                } catch(error) {};
            }
        }
    } catch (error) {
        throw console.log (`Error with finding login fields`)
    }
}

module.exports = determineWhichLogin;