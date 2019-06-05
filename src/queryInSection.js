const queryFieldAndChildren = async (element, fieldKey, field, scrapedDataObject) => { 
  
    //if selector is intentionally empty
    if (field === null) {
      scrapedDataObject[fieldKey] = null;
      return scrapedDataObject;
    }

    //if the field has a selector, use it, otherwise the field IS the selector
    const selector = field.selector ? field.selector : field;
    const selectors = field.selectors;
    
    //check if selector-based element exists
    const exists = await element.$(selectors || selector)

    if (exists) {
      //if has subfields
      if (field.fields) {
        scrapedDataObject[fieldKey] = await queryInSection(element, field);
      //if no subfields
      } else {
        let fieldAttribute = field.attribute ? field.attribute : 'innerText';
        //if selecting all matches
        if (selectors) {
          scrapedDataObject[fieldKey] = await element.$$eval(selectors, (subElements, fieldAttribute) => subElements.map(subElement => subElement[fieldAttribute] || subElement.getAttribute(fieldAttribute) ), fieldAttribute);
        //if selecting one match
        } else {
          scrapedDataObject[fieldKey] = await element.$eval(selector, (elem, fieldAttribute) => elem ? elem[fieldAttribute] || elem.getAttribute(fieldAttribute) : '', fieldAttribute)
        }
      }
    }

    //return the object
    return scrapedDataObject;
}


const queryEachField = async (elementWithChildren, sectionOfSelectorsList) => {
  let fields = sectionOfSelectorsList.fields
  let storage = {};
  for (let fieldKey in fields) {
    let field = fields[fieldKey];
    //takes in storage and mutates it
    await queryFieldAndChildren(elementWithChildren, fieldKey, field, storage);
  }
  
  return storage;
}



const queryInSection = async (page, sectionOfSelectorsList) => {
  //wait for the page to find the selector, retrieve arr of elements
  const matchingElementsArr = await page.$$(sectionOfSelectorsList.selector || sectionOfSelectorsList.selectors) //[HTML]
  let results = [];
  //for every element build a new array containing the results of the queryEachField
  for (let index in matchingElementsArr) {
    results[index] = await queryEachField(matchingElementsArr[index], sectionOfSelectorsList);
  }

  //return all the scraped data
  return results;
}

module.exports = queryInSection;