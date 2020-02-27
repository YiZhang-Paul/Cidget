export default (): any => ({
    abbreviations: {
        language: {
            TS: ["typescript", "tscript", "tsx"],
            JS: ["javascript", "jscript", "jsx"],
            "C#": ["csharp", "c sharp"]
        },
        license: {
            MIT: ["the mit license", "mit license"]
        }
    },
    "cidget.server": {
        host: "test_cidget_server",
        port: 111111
    },
    "mail.outlook": {
        localPort: 111111,
        clientId: "test_outlook_client_id",
        secret: "test_outlook_secret",
        callback: "test_outlook_callback",
        scope: "openid profile offline_access User.Read Mail.Read",
        tokenHost: "https://login.microsoftonline.com",
        authorizePath: "common/oauth2/v2.0/authorize",
        tokenPath: "common/oauth2/v2.0/token"
    },
    "mail.outlook.token": {
        token_type: "Bearer",
        scope: "Mail.Read openid profile User.Read email",
        expires_in: 3599999999,
        ext_expires_in: 3599999999,
        access_token: "test_outlook_access_token",
        refresh_token: "test_outlook_refresh_token",
        id_token: "test_outlook_id_token",
        created: "2020-02-17T05:02:23.288Z"
    },
    "mail.outlook.webhooks": [
        {
            id: "test_outlook_webhook_id",
            name: "12345",
            url: "https://graph.microsoft.com/v1.0/subscriptions",
            callback: "test_outlook_webhook_callback",
            events: ["created"],
            createdOn: "2020-02-12T04:12:27.137Z",
            isActive: true
        }
    ],
    "cicd.azureDevops": {
        url: "https://dev.azure.com/test_azure_organization",
        token: "test_azure_token"
    },
    "repository.github": {
        url: "https://api.github.com",
        token: "test_github_token",
        user: "test_github_user"
    }
});
