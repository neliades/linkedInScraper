//takes page and selector and optional type (e.g. 'href'), returns an array containing all the results or an empty array
const scrapeByType = async (page, selector, type = 'innerText') => {
    let elementArr = await page.$$(selector);
    return elementArr ? elementArr.map(element => element[type]) : [];
}

module.exports = scrapeByType;


