const {sql, sqlConfig} = require('./database/sql');
const app = require('./app');
const checkAndBuildTables = require('./database/tables');

sql.connect(sqlConfig, (err)=>{
    if(err) {
        return console.log(err);
    }
    console.log('SQL database connected, checking and building tables...');
    checkAndBuildTables()
    .then(res=>{
        console.log("Done! Running app...")
        const server = app.listen(process.env.PORT,()=>{
            console.log(`App listening on port ${process.env.PORT}`);
        })
        server.on('close',sql.close.bind(sql));
    })
    .catch(err=>{
        console.log(err);
    })
})

