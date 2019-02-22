//user agents list
const userAgents = [
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
];

//open a new page (async), accepts browser = puppeteer.launch promise
const openNewPage = async (browser, url, max = 5, count = 0) => {
    try {    const page = await browser.newPage()
        let randomItem = arr => arr[Math.floor(Math.random()*arr.length)] 
        await page.setUserAgent(randomItem(userAgents));
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8' })
        await page.setViewport({
            width: 1920,
            height: 1080
        })
        await page.goto(url)
        return page
    } catch (error) {
        count++;
        console.log(`Error opening new page. Attempt ${count}/${max}`);
        if (count === 5) throw 'Terminating.'
        return openNewPage(browser, url, max, count);
    }
}

module.exports = openNewPage;
  