// Require Cypress
const cypress = require("cypress");
const program = require('commander');

program
    .version('0.1.0')
    .option('-m, --mobile', 'run test on mobile')
    .option('-t, --tablet', 'run test on tablet')
    .option('-d, --desktop', 'run test on desktop')
    .option('-o, --open', 'opens cypress');

// must be before .parse() since
// node's emit() is immediat
program.on('--help', function () {
    console.log('')
    console.log('Examples:');
    console.log('  $ node cypress-starter.js --help');
    console.log('  $ node cypress-starter.js -h');
});

program.parse(process.argv);

// Check the program.args obj
const NO_COMMAND_SPECIFIED = process.argv.length <=2;

if (NO_COMMAND_SPECIFIED) {
    // e.g. display usage
    program.help();
}else{
    // use this options 
    if (program.debug) console.log(program.opts());
    console.log('Test details:');
    if (program.mobile) console.log('- run test on mobile');
    if (program.tablet) console.log('- run test on tablet');
    if (program.desktop) console.log('- run test on desktop');
}

// Determine the device type
const device = program.mobile ? 'mobile' : program.tablet ? 'tablet': 'desktop'

const cypressOptions = {
    // Expose the device type as Cypress environment variables
    env: {
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop"
    },
    config: {
        baseUrl: ``,
        // Mobile: emulate iPhone 6
        ...(device === "mobile" && {
            userAgent: "Mozilla/5.0 googlebot (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
            viewportWidth: 375,
            viewportHeight: 667
        }),
        // Tablet: emulate iPad in portrait mode
        ...(device === "tablet" && {
            userAgent: "Mozilla/5.0 googlebot (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
            viewportWidth: 768,
            viewportHeight: 800
        }),
        // Desktop: use default browser user agent
        ...(device === "desktop" && {
            userAgent: "googlebot",
            viewportWidth: 1440,
            viewportHeight: 900
        })
    }
};

function runCypress() {
    // Use --open to open the Cypress UI instead of running
    // the tests in headless mode from the command line
    if (program.open) {
        return cypress.open(cypressOptions);
    }
    return cypress.run(cypressOptions);
}
runCypress()
    .then(results => {
        if (results.totalFailed > 0 || results.failures > 0) {
            // Make sure to exit with an error code if tests failed
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err.stack || err);
        process.exit(1);
    });