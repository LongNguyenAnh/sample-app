const cypressOptions = {
    // Expose the device type as Cypress environment variables
    env: {
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop"
    },
    config: {
    baseUrl: ``,
        // Mobile: emulate iPhone 5
        ...(device === "mobile" && {
            userAgent: "Mozilla/5.0 googlebot (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
            viewportWidth: 320,
            viewportHeight: 568
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

