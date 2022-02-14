interface BrowserConfig {
    parallelLimit: number;
    sessionUseLimit: number;
}

export interface Config {
    forBrowser(id: string): BrowserConfig;
    getBrowserIds(): Array<string>;
    system: {
        parallelLimit: number;
    };
}
