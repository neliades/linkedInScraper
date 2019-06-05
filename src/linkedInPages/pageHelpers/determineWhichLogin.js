const {linkedIn} = require('../../selectorsList.js');
const selectors = linkedIn.errorHandling.signIn;
const buttonSelectors = linkedIn.errorHandling.signInButtons;
const clickAll = require('../../puppeteerHelpers/clickAll.js');

const determineWhichLogin = async (page) => {
    for (let key in buttonSelectors) {
        try {
            await page.waitFor(buttonSelectors[key], { timeout: 1000 * 10});
            await page.click(buttonSelectors[key]);
        } catch (error) {
            console.log('encountered error on ', key)
            console.log({error})
        };
    }
    try {
        page.waitForNavigation({ timeout: 1000 * 1});
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
            } catch(error) {
                console.log('error with ', key, ': ', selectors[key])
            };
        }
        console.log({selectorsObj});
        return;
    } catch (error) {
        throw console.log (`Error with finding login fields`)
    }
}

module.exports = determineWhichLogin;