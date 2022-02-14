export function requireWithNoCache(moduleName: string): NodeRequire {
    delete require.cache[moduleName];

    return require(moduleName);
};
