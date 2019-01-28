
const puppeteer = require('puppeteer');
const {login} = require(`./config.js`);

// const companyName = 'google';

const findCompanyInfo = (companyName) => {

    const everyChild = async function (page, before, after, elementProp) {
        let num = 1;
        let result = [];
        let children = true;
        while (children === true) {
        let selector = before + num + after;
        if (await page.$(selector) !== null) {
            let data = await findElementInfo(page, selector, elementProp);
            await result.push(data);
            await num++;
        } else {
            children = false;
        }
        return result;
    }
    
    }
    
    const findElementInfo = async function(page, selector, elementProp, multiple) {
        if (multiple === true) {
            let list = [];
            let elements = await page.$$(selector);  
            elements.forEach((element) => {
                list.push(element.innerText);
            });
            return list;
        } else {
            let element = await page.$(selector);
            let elementValue = await element.getProperty(elementProp)
            return (await elementValue.jsonValue())
        }
    }
    const findInnerText = (str) => {
        let ans = ''
        let save = true;
        for (let i = 0; i < str.length; i++) {
          if (str[i] === '>') {
            save = true;
            if (str[i+1] !== ' ') {
                ans = ans + ' ';
            }
          } else if (str[i] === '<') {
            save = false;
          } else if (save === true) {
            ans = ans + str[i];
          }
        }
        ans = ans.split('&nbsp;').join(' ');
        ans = ans.split(' ');
        condensedAns = [];
        for (let i = 0; i < ans.length; i++) {
          if (ans[i].length > 0) {
            condensedAns.push(ans[i]);
          }
        }
        ans = condensedAns.join(' ')
        return ans;
    }
    
    let companyInfo = {
        overview : {
            name : '',
            website : '',
            size : '',
            industry : '',
            competitors : [],
            description : '',
            awards : ''
        },
        reviews : {
            rating : '',
            recommended : '',
            CEOApproval : ''
        },
        locatedInNYC : false,
        alsoViewed : [],
        interview : {
            experience : {
                positive : '',
                neutral : '',
                negative : ''
            },
            process : [],
            difficulty : ''
        },
        salary : [
            // {
            // position: '',
            // low : '',
            // high : '',
            // average : ''
            // }
        ]
    
    
    }
    
    
    
    
    //connect to puppeteer and visit URL
    async function run() {
      const browser = await puppeteer.launch({
        headless : false
      });
      let page = await browser.newPage();
      
      await page.goto('https://www.glassdoor.com/');
    
    //login
      const signIn = '#TopNav > nav > div:nth-child(4) > a';
      const signInAlt = '#TopNav > nav > div > div > div.d-flex.justify-content-lg-end.align-items-baseline.order-lg-last.col-3 > div.locked-home-sign-in > a';
      const usernameBox = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > div:nth-child(3) > div > input';
      const passwordBox = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > div:nth-child(4) > div > input';
      const submitSignIn = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > button';
      
      if (await page.$(signIn) !== null) {
        await page.click(signIn);
      } else {
        await page.click(signInAlt);
      }
    
    
      await page.click(usernameBox);
      await page.keyboard.type(login.email);
      
      await page.click(passwordBox);
      await page.keyboard.type(login.password);
      
      await page.click(submitSignIn);
    
      await page.waitForNavigation();
    
    
    const searchBox = '#sc\\2e keyword';
    const typeDropdown = '#SiteSrchTop > form > div > ul > li.jobs.active-context';
    const typeSelection = '#SiteSrchTop > form > div > ul > li.reviews > span';
    const submitSearch = '#HeroSearchButton';
    
    await page.click(searchBox);
    await page.keyboard.type(companyName);
    
    await page.click(typeDropdown);
    await page.click(typeSelection);
    
    
    await page.click(submitSearch);
    
    
    await page.waitForNavigation();
    
    
    
    
    let pages = await browser.pages();
    let page2 = pages[2];
    const firstResult = '#MainCol > div:nth-child(1) > div:nth-child(3) > div.empInfo.tbl > div.header.cell.info > div.margBotXs > a';
    await page2.click(firstResult);
    
    await page2.waitFor(5*1000);
    const readMore = '#ExpandDesc';
    await page2.click(readMore);
    let selectors = {
        name : '#EmpHeroAndEmpInfo > div.empInfo.tbl.hideHH > div.header.cell.info > h1',
        website : '#EmpBasicInfo > div:nth-child(1) > div > div:nth-child(1) > span > a',
        size : '#EmpBasicInfo > div:nth-child(1) > div > div:nth-child(3) > span',
        industry : '#EmpBasicInfo > div:nth-child(1) > div > div:nth-child(6) > span',
        competitors : '#EmpBasicInfo > div:nth-child(1) > div > div:nth-child(8) > span',
        description : '#EmpBasicInfo > div:nth-child(2) > div.margTop.empDescription',
        awards : '#EmpBasicInfo > div:nth-child(2) > div.table > div:nth-child(2)'
    }
    
    for (let key in selectors) {
        let data = await findElementInfo(page2, selectors[key], 'innerHTML');
        data = findInnerText(data);
        companyInfo.overview[key] = data;
    }
    
    selectors = {
        rating : '#EmpStats > div > div.ratingInfo.tighten.cf > div.ratingNum',
        recommended : '#EmpStats_Recommend',
        CEOApproval : '#EmpStats_Approve'
    };
    
    for (let key in selectors) {
        let data = await findElementInfo(page2, selectors[key], 'innerHTML');
        data = findInnerText(data);
        companyInfo.reviews[key] = data;
    }
    
    const showMore = '#ZCol > div.module.toggleable > a.toggleOn.strong.small';
    await page2.click(showMore);
    
    selectors = {
        locatedInNYC : '#ZCol > div.module.toggleable > ul'
    };
    
    for (let key in selectors) {
        let data = await findElementInfo(page2, selectors[key], 'innerHTML');
        data = findInnerText(data);
        companyInfo[key] = /New York/.test(data);
    }
    
    selectors = {
        alsoViewed1 : `#ZCol > div.bucket.module.similarCompanies > div > ul:nth-child(1) > li:nth-child(`,
        alsoViewed2 : `) > div > div.companyName > a`
    };
    
    let num = 1
    let children = true;
    while (children === true) {
        let selector = selectors.alsoViewed1 + num + selectors.alsoViewed2;
        if (await page2.$(selector) !== null) {
            let data = await findElementInfo(page2, selector, 'innerHTML');
            companyInfo.alsoViewed.push(data);
            num++;
        } else {
            children = false;
        }
    }
    
    selectors = {
        interviewTab : '#EIProductHeaders > div > a.eiCell.cell.interviews',
        interviewBox : '#EIFilter > div > form > div > div.d-flex > input',
        interviewButton : '#EIFilter > div > form > div > div.d-flex > button.gd-ui-button.d-none.d-sm-inline.ml-xsm.EIFilterModuleStyles__findBtn___3cS_i.css-2crf8m',
        more : '#ToggleOnObtained',
        experience : {
            positive : '#AllStats > div.cell.chartWrapper.experience > div > div > div:nth-child(2) > div > div:nth-child(2) > div.cell.pct.alignRt > span.strong.num.pros.pct',
            neutral : '#AllStats > div.cell.chartWrapper.experience > div > div > div:nth-child(2) > div > div:nth-child(3) > div.cell.pct.alignRt > span.strong.num.pros.pct',
            negative : '#AllStats > div.cell.chartWrapper.experience > div > div > div:nth-child(2) > div > div:nth-child(4) > div.cell.pct.alignRt > span.strong.num.pros.pct'
        },
        processBefore : '#AllStats > div.cell.chartWrapper.obtained > div > div > div:nth-child(2) > div > div:nth-child(',
        processAfter : ')',
        difficulty : '#AllStats > div.cell.chartWrapper.difficulty > div > div > div.cell.middle.center.subtle.difficultyLabelWrapper > div'
    }
    
    await page2.click(selectors.interviewTab);
    await page2.waitFor(5*1000);
    
    await page2.click(selectors.interviewBox);
    await page2.keyboard.type('Software Engineer');
    
    await page2.click(selectors.interviewButton);
    await page2.click(selectors.more);
    await page2.waitFor(2*1000);
    
    
    for (let key in selectors.experience) {
        let data = await findElementInfo(page2, selectors.experience[key], 'innerHTML');
        data = findInnerText(data);
        companyInfo.interview.experience[key] = data;
    }
    
    
    num = 2
    children = true;
    while (children === true) {
        let selector = selectors.processBefore + num + selectors.processAfter;
        if (await page2.$(selector) !== null) {
            let data = await findElementInfo(page2, selector, 'innerHTML');
            data = findInnerText(data).split(' ');
            if (data.length > 2) {
                let key = data.slice(0,data.length-2).join('');
                let val = data.slice(data.length-2, data.length-1)[0];
                companyInfo.interview.process.push({[key] : val});
            }
            num++;
        } else {
            children = false;
        }
    }
    
    
    
    let data = await findElementInfo(page2, selectors.difficulty, 'innerHTML');
    data = findInnerText(data);
    companyInfo.interview.difficulty = data;
    
    
    selectors = {
        salariesTab : '#EIProductHeaders > div > a.eiCell.cell.salaries',
        salariesBox : '#SalaryChartContainer > div.module > div.EISalariesFiltersStyle__filtersWrapper.flex__vBottom.flex__container.flex__justifySpaceBetween.flex__container.flex__wrap > div.flex__flex5of12 > div > div > div > input',
        salariesButton : '#SalaryChartContainer > div.module > div.EISalariesFiltersStyle__filtersWrapper.flex__vBottom.flex__container.flex__justifySpaceBetween.flex__container.flex__wrap > div.flex__flex7of12.flex__vBottom.flex__container.flex__justifySpaceBetween.flex__container > div.EISalariesFiltersStyle__buttonWrapper.flex__flex2of12 > button',
        positionSalaryBefore : '#SalaryChartContainer > div.module > div.salaryList > div:nth-child(2) > div:nth-child(',
        positionSalaryAfter : ') > div'
    }
    
    await page2.click(selectors.salariesTab);
    await page2.waitFor(5*1000);
    
    await page2.click(selectors.salariesBox);
    await page2.keyboard.type('Software Engineer');
    
    await page2.click(selectors.salariesButton);
    await page2.waitFor(5*1000);
    
    
    
    num = 1
    children = true;
    while (children === true) {
        let selector = selectors.positionSalaryBefore + num + selectors.positionSalaryAfter;
        if (await page2.$(selector) !== null) {
            console.log('num: ', num)
            let data = await findElementInfo(page2, selector, 'innerHTML');
            data = findInnerText(data).split(' ');
            let salary = {
                position: '',
                low : '',
                high : '',
                average : ''
            }
            let position = false;
            let count = 0;
            let monthly = false;
            console.log({data})
            for (let i = 0; i < data.length; i++) {
                if (data[i] === `/mo`) {
                    monthly = true;
                    break;
                }
                if (position === false) {
                    salary.position = salary.position + data[i];
                    if((data[i+1][0] === '$')) position = true;
                } else if (data[i][0] === '$') {
                    if (count === 0) {
                        salary.average = data[i];
                    } else if (count === 1) {
                        salary.low = data[i];
                    } else if (count === 2) {
                        salary.high = data[i];
                    }
                    count++;
                }
            }
            num++;
            if (monthly === false) {
                companyInfo.salary.push(salary);
            } else {
                monthly = false;
            }
            if(companyInfo.salary.length >= 3) children = false;
        } else {
            console.log('done')
            children = false;
        }
    }
    
    
    
    
    console.log(companyInfo)
    
    
    await page.waitForNavigation();
    
    }
    
    
    run();
}


module.exports.findCompanyInfo = findCompanyInfo;