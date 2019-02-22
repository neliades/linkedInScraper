//takes page and lastSelector and optional max scrolls
const scrollEntirePage = async (page, lastSelector, maxScrolls = 15) => {
    if (!lastSelector) throw('lastSelector was not provided');
    for (let i = 0; i < maxScrolls; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight))
        let reachedBottom;
        try {
            reachedBottom = await page.waitForSelector(lastSelector, { visible: true, timeout: 500});
        } catch (error) {}
        if (reachedBottom) return;
    }
    console.log('Warning: Reached max number of scrolls, bottom of page not found')
}

module.exports = scrollEntirePage;
