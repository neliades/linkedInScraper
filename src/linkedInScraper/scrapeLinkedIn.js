const puppeteer = require('puppeteer')

const logIn = require('./linkedInPages/logIn.js')
const userProfile = require('./linkedInPages/userProfile.js')

// let template = {
//     email,
//     password,
//     logInUrl,
//     userProfileUrls
// }

// let selectors = {
//     'site' : {
//         'config' : {
//             email,
//             password,
//             logInUrl,
//             userProfileUrls : []
//         },
//         'selectors' : {

//         }
//     }
// }

//returns a promise that resolves to a completed profile object
const scrapeLinkedIn = (email, password, url, isVisible = false) => {
    return new Promise(async (resolve, reject) => {
        if (!email || !password || !url) return reject('Email, password, and a profile url are required.');
        const browser = await puppeteer.launch({headless: !isVisible})
        let completedProfile;
        try {
            await logIn(browser, email, password);
            completedProfile = await userProfile(browser, url);
        } catch (error) {
            await browser.close()
            return reject(error)
        }
        await browser.close();
        return resolve(completedProfile);
    })
}

module.exports = scrapeLinkedIn;




// //reject if email or password are not provided
// if (!email || !password) {
//   let errorMessage;
//   if (password) errorMessage = 'Email is required.'
//   else if (email) errorMessage = 'Password is required.'
//   else errorMessage = 'Email and password are required.'
//   return reject(new Error(errorMessage))
// }