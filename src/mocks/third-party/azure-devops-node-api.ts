export const getPersonalAccessTokenHandler = () => {};

export const webApiStubInstance = {
    async getBuildApi(): Promise<any> { },
    async getReleaseApi(): Promise<any> { }
};

export const WebApi = function WebApi() { return webApiStubInstance; };
