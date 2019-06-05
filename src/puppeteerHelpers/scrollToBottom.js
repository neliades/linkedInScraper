//takes page and lastSelector and optional max scrolls
const scrollEntirePage = async (page, lastSelector, maxScrolls = 15) => {
    let extraScrolls = 5;
    if (!lastSelector) throw('lastSelector was not provided');
    for (let i = 0; i < maxScrolls; i++) {
        // console.log('bout to scroll')
        try {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight))
        } catch (error) {
            // console.log('had error scrolling: ', error)
            if (extraScrolls > 0) {
                maxScrolls++;
                extraScrolls--;
            }
        }
        // console.log('just scrolled')
        let reachedBottom;
        try {
            reachedBottom = await page.waitForSelector(lastSelector, { visible: true, timeout: 500});
        } catch (error) {}
        if (reachedBottom) return;
    }
    console.log('Warning: Reached max number of scrolls, bottom of page not found')
}

module.exports = scrollEntirePage;
