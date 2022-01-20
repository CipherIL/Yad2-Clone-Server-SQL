const app = require('./app');
const {sql, sqlConfig} = require('./database/sql');

sql.connect(sqlConfig, (err)=>{
    if(err) {
        return console.log(err);
    }
    console.log('SQL database connected, starting app');
    const sever = app.listen(3000,()=>{
        console.log('App listening on port 3000');
    })
    sever.on('close',sql.close.bind(sql));
})

