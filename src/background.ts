import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';
let window: BrowserWindow | null;
// scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
    window = new BrowserWindow({
        x: 0,
        y: 0,
        width: 800,
        height: 850,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        maximizable: false,
        minimizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    window.setIgnoreMouseEvents(true, { forward: true });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    }
    else {
        createProtocol('app');
        window.loadURL('app://./index.html');
    }

    window.on('closed', () => window = null);
}

app.on('window-all-closed', () => {
    // on macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // on macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === null) {
        createWindow();
    }
});

app.on('ready', async () => createWindow());

if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        })
    }
    else {
        process.on('SIGTERM', () => {
            app.quit();
        })
    }
}
