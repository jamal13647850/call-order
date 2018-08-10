const { app, BrowserWindow,Menu,MenuItem, ipcMain } = require("electron")

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./ordersdb.db"
    },
    useNullAsDefault: true,
    debug: true
});



//require('electron-reload')(__dirname);

let path = require('path');





let menu = new Menu();
let menuitem1 = new MenuItem(
    {
        label : 'فایل',
        submenu : [
            {
                label : 'ثبت سفارش',
                click(menuItem , browserWindow , event) {
                    browserWindow.webContents.send('menu' , 'REGISTER_ORDERS')
                },
                accelerator : 'CmdOrCtrl+Shift+r',
            },
            {
                label : 'خروج',
                click(){
                    app.quit();
                },
                accelerator : 'CmdOrCtrl+q'
            }

        ]
    }
);
let menuitem2 = new MenuItem(

    {
        label : 'نمایش',
        submenu : [
            { role : 'reload'},
            { role : 'toggledevtools'},
            {
                label : 'نمایش لیست محصولات',
                click(menuItem , browserWindow , event) {
                    browserWindow.webContents.send('menu' , 'VIEW_ORDERS')
                },
                accelerator : 'CmdOrCtrl+Shift+s',
            }
        ]
    }
);

menu.append(menuitem1)  ;
menu.append(menuitem2)  ;



app.on("ready", () => {
    //require('devtron').install();

    let mainWindow = new BrowserWindow(
        {
            height: 500,
            width: 1200,
            show: false,
            icon: path.join(__dirname, 'assets/favicon-1.ico')
        }
            );
    mainWindow.loadURL(`file://${__dirname}/template/main.html`);




    let splashScreen = new BrowserWindow({
        width:430,
        height:250,
        /*backgroundColor : '#d35400',*/
        //parent: mainWin,
        //transparent:true,
        frame: false,
        icon: path.join(__dirname, 'assets/favicon-1.ico')
    });
    splashScreen.loadURL(`file://${__dirname}/template/splashScreen.html`);
    mainWindow.on('closed',()=>{
        app.quit();
        mainWindow =null;

    });
    mainWindow.on('closed',()=>{
        splashScreen = null;
    });


    mainWindow.once('ready-to-show',()=>{
        mainWindow.show();
        splashScreen.close();
    });




    ipcMain.on("listWindowLoaded", function (event,limit) {
        let result = knex.select().from("orders").orderBy('id', 'desc').limit(limit);
        result.then(function(rows){
            mainWindow.webContents.send("resultSent", rows);
        });





    });

    Menu.setApplicationMenu(menu);
});



app.on("window-all-closed", () => { app.quit() });