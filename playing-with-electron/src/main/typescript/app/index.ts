import {app, BrowserWindow, ipcMain, Menu} from "electron";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

let mainWindow: any = null;
let settingsWindow: any = null;
let aboutWindow: any = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        title: "S3Browser",
    });

    mainWindow.loadURL(`file://${__dirname}/../index.html`);

    const menu = Menu.buildFromTemplate(menuConfiguration);
    Menu.setApplicationMenu(menu);
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        parent: mainWindow,
        width: 600,
        height: 480,
        frame: false,
        modal: true,
        show: false,
    });

    settingsWindow.loadURL(`file://${__dirname}/../settings.html`);
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        parent: mainWindow,
        width: 600,
        height: 600,
        frame: false,
        alwaysOnTop: true,
        center: true,
        hasShadow: true,
        thickFrame: true,
        movable: false,
        modal: true,
        show: false,
    });

    aboutWindow.loadURL(`file://${__dirname}/../about.html`);
}

ipcMain.on("close-main-window", () => {
    app.quit();
});

ipcMain.on("open-settings-window", () => {
    settingsWindow.show();
});

ipcMain.on("close-settings-window", () => {
    settingsWindow.hide();
});

ipcMain.on("close-about-window", () => {
    aboutWindow.hide();
});

app.on("ready", () => {
    createMainWindow();
    createSettingsWindow();
    createAboutWindow();
});

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }

    if (settingsWindow === null) {
        createSettingsWindow();
    }

    if (aboutWindow === null) {
        createAboutWindow();
    }
});

const menuConfiguration: MenuItemConstructorOptions[] = [{
    label: "Edit",
    role: "window",
    submenu: [{
        click: () => {
                settingsWindow.show();
            }, label: "Settings",
        },
        {
            label: "Developer Tools",
            accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
            click(item, focusedWindow) {
                if (focusedWindow) { focusedWindow.webContents.toggleDevTools(); }
            },
        },
    ],
}];

if (process.platform === "darwin") {

    menuConfiguration.unshift({
        label: app.getName(),
        role: "window",
        submenu: [
            {
                label: "About", click: () => {
                    aboutWindow.show();
                },
            },
            {type: "separator"},
            {role: "hide"},
            {role: "hideothers"},
            {role: "unhide"},
            {type: "separator"},
            {role: "quit"},
        ],
    });
}
