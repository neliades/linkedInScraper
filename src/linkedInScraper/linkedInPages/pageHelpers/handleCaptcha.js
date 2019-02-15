const {linkedIn} = require('../../selectorsList.js');
const selectors = linkedIn.errorHandling.captcha;

const handleCaptcha = async (page) => {
    try {
        try {
            await page.waitFor(selectors, { timeout: 500});
        } catch (error) {
        }
        let captchaButton = await page.$(selectors);
        if (captchaButton) {
            await captchaButton.click();
        }
        return;
    } catch (error) {
        throw console.log (`Error with captcha`);
    }
}

module.exports = handleCaptcha;