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
app.get("/tasks", (req, res, next) => {
    const token = req.headers.authorization;
    const tknValidate =  validateToken(token);
    console.log(tknValidate);
    var userId = null;
    if(tknValidate){
        console.log("Authorization correct",tknValidate);
        userId = tknValidate.sub;

    }else{
        res.sendStatus(403);
        return;
    }
    const sql = "SELECT username, task_id, title,title,detail,task_status,status "+
    "FROM task , tk_user  WHERE tk_user.user_id = '"+userId+"' AND  tk_user.user_id = task.user_id AND status = 1";
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
app.post("/tasks", jsonParser, (req, res, next) => {
    //req.body.id = surrogateKey++;
    //tasks.push(req.body);
    //res.send("OK!");
    console.log("AGREGAR NUEVA TAREA");
    const appData = req.body;
    console.log(appData);
   
    const token = req.headers.authorization;
    const tknValidate =  validateToken(token);
    var userId = null;
    if(tknValidate){
        console.log("Authorization correct",tknValidate);
        userId = tknValidate.sub;

    }else{
        res.sendStatus(403);
        return;
    }

    const sql= "INSERT INTO task VALUES (null,'"+appData.title+"','"+appData.detail+"','PENDING','1','"+userId+"' )";
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
//delete element 
app.delete("/tasks/:taskId", jsonParser, (req, res, next) => {
    
    const params = req.params.taskId;

    const token = req.headers.authorization;
    console.log("DELETE");
    console.log(token);
    const tknValidate =  validateToken(token);
    var userId = null;
    if(tknValidate){
        console.log("Authorization correct",tknValidate);
        userId = tknValidate.sub;
        const sql = "UPDATE  task set status = 0 WHERE task_id =  '"+params+"'  ";
        conn.query( sql, 
            function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
                if (err) throw err; // Si existe error se para la ejecucion con throe
                // Si no existe error imprimimos en consola 
                console.log("Result: " + result);
                // Retornamos el contendio
                res.json(result);
            }
        );   
    }
    else{
        res.sendStatus(403);
        return;
    }
   
    
});
app.put("/tasks/:taskId", jsonParser, (req, res, next) => {
    const token = req.headers.authorization;
    console.log("ACTUALIZAR, COMPLETED, PENDING");

    
    const params = req.params.taskId;
    const tknValidate =  validateToken(token)
    console.log (tknValidate);
    var status =req.query.task_status;
    var llegada = true;
    console.log(status );
    console.log(params);
    var userId = null;
    
    if ( status == 'COMPLETED' || status=='PENDING'){
        llegada = false;
        console.log("si esta aqui");
    }
    if (llegada){
        const appData = req.body;
    console.log(appData);
        console.log("bueno no habia nada");
        if(tknValidate){
            console.log("Authorization correct",tknValidate);
            userId = tknValidate.sub;
    
        }else{
            res.sendStatus(403);
            return;
        }
        const sql = "UPDATE  task set title = '" +appData.title + "',detail = '"+ appData.detail+"' WHERE task_id =  '"+params+"' ";
    conn.query( sql, 
        function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
            if (err) throw err; // Si existe error se para la ejecucion con throe
            // Si no existe error imprimimos en consola 
            console.log("Result: " + result);
            // Retornamos el contendio
            res.json(result);
        }
    );
   
}
else{
    if (status =='COMPLETED'){
    
        if(tknValidate){
            console.log("Authorization correct",tknValidate);
            userId = tknValidate.sub;
    
        }else{
            res.sendStatus(403);
            return;
        }
        const sql = "UPDATE task set task_status = 'COMPLETED'  WHERE task_id =  '"+params+"'  ";
    conn.query( sql, 
        function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
            if (err) throw err; // Si existe error se para la ejecucion con throe
            // Si no existe error imprimimos en consola 
            console.log("Result: " + result);
            // Retornamos el contendio
            res.json(result);
        }
    );
    }
    else{
        /*for(var i=0; i<tasks.length; i++){
            if(tasks[i].id == req.params.taskId){
                tasks[i].state = status;
                res.send("tasks pending!");
            }
        }*/
        if(tknValidate){
            console.log("Authorization correct",tknValidate);
            userId = tknValidate.sub;
    
        }else{
            res.sendStatus(403);
            return;
        }
        const sql = "UPDATE  task set task_status = 'PENDING'  WHERE task_id =  '"+params+"'  ";
    conn.query( sql, 
        function (err, result) { // CALLBACK HELL -> PROMISES CASCADE HELL -> ASYNC AWAIT
            if (err) throw err; // Si existe error se para la ejecucion con throe
            // Si no existe error imprimimos en consola 
            console.log("Result: " + result);
            // Retornamos el contendio
            res.json(result);
        }
    );
    }
    
}
    
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
function validateToken(token){
    console.log("estamos viendo si el token es valido");
    try {
        const jwtValidate = jwt.verify(token,"16052000");
        return jwtValidate;
    } catch (error) {
        return null;
    }
}
function buildToken(userId,username){
    const payload = {
        sub: userId,
        username: username,
        exp: Math.floor(Date.now()/1000)+(60*2)
    };
    return jwt.sign(payload,"16052000");
}
//update values, completed tasks, pending tasks




app.get("/tasks/:taskId", (req, res) => {
    res.send("TaskId is sent to "+ req.params.taskId)
});

app.listen(3000, () => {
    console.log("Servidor HTTP funcionando");
});

