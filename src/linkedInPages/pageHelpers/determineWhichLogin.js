const {linkedIn} = require('../../selectorsList.js');
const selectors = linkedIn.errorHandling.signIn;

const determineWhichLogin = async (page) => {
    try {
        for (let key in selectors) {
            try {
                let selectorsObj = {
                    email : selectors[key].email,
                    password : selectors[key].password,
                    submit : selectors[key].submit
                }
                await page.waitFor(selectorsObj.email, { timeout: 1000 * 0.25});
                let emailExists = await page.$(selectorsObj.email);
                let passwordExists = await page.$(selectorsObj.password);
                let submitExists = await page.$(selectorsObj.submit);
                if(emailExists && passwordExists && submitExists) return selectorsObj;
            } catch(error) {};
        }
        return;
    } catch (error) {
        throw console.log (`Error with finding login fields`)
    }
}

module.exports = determineWhichLogin;