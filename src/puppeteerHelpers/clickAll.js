//accepts objects with format {selectorName : selector, ...} or arrays with format [selector, ...]
const clickAll = async(page, selectorsList) => {
    for(let keyOrIndex in selectorsList){
      const selector = selectorsList[keyOrIndex];
      const element = await page.$$(selector);
      for (let i = 0; i < element.length; i++) {
        try {
            await element[i].click();
        } catch (error) {
            // console.log(`Could not find ${selector}`)
        }
      }
    }
  
    return
}

module.exports = clickAll;