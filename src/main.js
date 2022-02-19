//TODO: Harden flow and handle edge cases/failures

require('dotenv').config();
const puppeteer = require('puppeteer');

const showBrowser = false;
const email = process.env.LOGIN_USER_EMAIL;
const password = process.env.LOGIN_USER_PASSWORD;
const clientName = process.env.CLIENT_NAME;
const url = process.env.PHQ_URL;
const getClientUrl = process.env.PHQ_GETCLIENT_URL;

const emailAddressSelector = 'input[id=signInName]';
const passwordInputSelector = 'input[id=password]';
const loginButtonSelector = 'button[id=next]';

function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}]: ${message}`);
}

async function setElementValue(page, selector, value) {

    log(`Waiting for selector '${selector}'`);
    const element = await page.waitForSelector(selector);

    if (!element) {
        throw `Error: Selector '${selector}' not found`;
    }

    log(`Setting value '${value}' for selector '${selector}'`);
    await emailInput.type(email);
}

async function clickElement() {

}

async function waitForApiCall() {
    log(`Waiting for getClient call ${getClientUrl}`);
    const firstResponse = await page.waitForResponse(getClientUrl);
}

(async () => {

    try {

        log("Launching browser");
        const browser = await puppeteer.launch({ headless: !showBrowser });
        const page = await browser.newPage();

        log(`Navigating to ${url}`);
        await page.goto(url);

        await setElementValue(page, emailAddressSelector, email);

        await setElementValue(page, passwordInputSelector, password);

        log(`Logging in using selector ${loginButtonSelector}`);
        await page.$eval(loginButtonSelector, el => el.click());

        log(`Waiting for getClient call ${getClientUrl}`);
        const firstResponse = await page.waitForResponse(getClientUrl);

        if (firstResponse.ok) {

            log(`Waiting for client buttons`);

            //Wait for the first client button to show
            await page.waitForXPath('//*[@id="app"]/div/div[2]/div/div/div/div/div[2]/div/div[1]/button');

            log(`Client buttons loaded`);

            //Find the span with the client name supplied in it, then grab its parent which will be the button to click
            const button = await page.$x(`//span[text() = '${clientName}']/parent::*`); //button

            //Even with waitForXPath above, sometimes the click happens too fast, so delay it for a second here
            await new Promise(x => setTimeout(x, 1000));

            await button[0].click();

            log(`Waiting for page to load`);

            await page.waitForNavigation();

            log(`Page loaded`);

            const localStorage = await page.evaluate(() => Object.assign({}, window.localStorage));

            log(`accessToken: ${localStorage.accessToken}`);

            if (!showBrowser) {
                await browser.close();
            }

            return localStorage.accessToken;
        }

    } catch (ex) {
        console.error('Fatal', ex)
    }

})();