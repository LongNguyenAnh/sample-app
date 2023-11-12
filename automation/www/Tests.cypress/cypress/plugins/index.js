module.exports = (on, config) => {
  console.log(`Integration Folder: ${config.integrationFolder}`);
  console.log(`Test Files: ${config.testFiles}`);

    // add --disable-dev-shm-usage chrome flag
    on('before:browser:launch', (browser, launchOptions) => {
      if (browser.family === 'chromium') {
        console.log('Adding Chrome flag: --disable-dev-shm-usage');
        launchOptions.args.push('--disable-dev-shm-usage');
      }
      if (browser.name === 'chrome' && browser.isHeadless) {
        launchOptions.args.push('--disable-gpu');
        return launchOptions
      }
      return launchOptions;
    });

    return config;
};
