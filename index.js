//https://stackoverflow.com/questions/9177049/express-js-req-body-undefined

var express = require("express");
var bodyParser = require('body-parser');
var sha256 = require('js-sha256');
var jwt = require('jsonwebtoken');
var mysql      = require('mysql');
var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
var surrogateKey = 1;
var app = express();

var tasks = []


//conectar base de datos 
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ricardo16500",
    port: 3333,
    database: "tasks_db"
  });

  conn.connect(
    function (err) { // en err llega errores de conexion
        if (err) {
            console.log("********** ERROR ********", err);
            throw err;
        }
        // Si no existen errores de conexion
        console.log("Connected!");
    }
);

app.get("/", (req, res, next) => {
    res.json("{ 'message': 'Tasks server online'}");
});

app.post("/tasks", jsonParser, (req, res, next) => {
    req.body.id = surrogateKey++;
    tasks.push(req.body);
    res.send("OK!");
});
app.post("/user",jsonParser,(req,res,next)=>{
    const appData = req.body;
    const pwdHash = hashPassword(appData.password);
    const sql = "INSERT INTO tk_user VALUES (null,'"+appData.user+"','"+pwdHash+"')";
    conn.query( sql, 
        function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
            if (err) throw err; // Si existe error se para la ejecucion con throe
            // Si no existe error imprimimos en consola 
            console.log("Result: " + result);
            // Retornamos el contendio
            res.json(result);
        }
    );
});
app.post("/auth",jsonParser, (req,res,next)=> {
    const appData = req.body;
    const pwdHash = hashPassword(appData.password);
    const SQL = "SELECT user_id,username FROM tk_user WHERE (username = '"+appData.user+ "' and  user_password = '"+pwdHash+"') ";
    let respuesta;
    conn.query(SQL,
        function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
            if (err) throw err; // Si existe error se para la ejecucion con throe
            // Si no existe error imprimimos en consola 
            
            if(result.length == 1) {
                const token = buildToken(result[0].user_id, result[0].username);
                // Retornamos el contendio
                res.json({ token: token });
            } else {
                res.status(401).send();
            }
        }
        );

});
function hashPassword(pwd){
    return(sha256.sha256(sha256.sha256(pwd+"trabajo1ingenieriasoftware")+"fabio_vaquera"));
}
function buildToken(userId,username){
    const payload = {
        sub: userId,
        username: username,
        exp: Math.floor(Date.now()/1000)+(60*2)
    };
    return jwt.sign(payload,"16052000123456789");
}
//update values, completed tasks, pending tasks
app.put("/tasks/:taskId", jsonParser, (req, res, next) => {
    var status =req.query.state;
    var llegada = true;
    console.log(status  );
    if ( status == "completed" || status=="pending"){
        llegada = false;
        console.log("si esta aqui");
    }
    if (llegada){
        console.log("bueno no habia nada");
    if(tasks.length>0){
        for (var i=0; i<tasks.length; i++){
                if(tasks[i].id == req.params.taskId ){
                    tasks[i].title = req.body.title;
                    tasks[i].detail = req.body.detail;
                    res.send("UPDATE!!!");
                    break;
                }
        }
    }
    else{
        res.send("Array empty");
    }
}
else{
    if (status =="completed"){
        for(var i=0; i<tasks.length; i++){
            if(tasks[i].id == req.params.taskId ){
                tasks[i].state = status;
                res.send("tasks completed!");
            }
        }
    }
    else{
        for(var i=0; i<tasks.length; i++){
            if(tasks[i].id == req.params.taskId){
                tasks[i].state = status;
                res.send("tasks pending!");
            }
        }
    }
    
}
    
});

app.get("/tasks", (req, res, next) => {
    res.json(tasks);
});

app.get("/tasks/:taskId", (req, res) => {
    res.send("TaskId is sent to "+ req.params.taskId)
});

app.listen(3000, () => {
    console.log("Servidor HTTP funcionando");
});

//delete element 
app.delete("/tasks/:taskId", jsonParser, (req, res, next) => {
    if(tasks.length>0){
        for (var i=0; i<tasks.length; i++){
                if(tasks[i].id == req.params.taskId ){
                    tasks.splice(i,1);
                    res.send("DELETE :(");
                    break;
                }
        }
    }
    else{
        res.send("Array empty");
    }
    
    
});