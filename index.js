//https://stackoverflow.com/questions/9177049/express-js-req-body-undefined

var express = require("express");
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
var surrogateKey = 1;
var app = express();

var tasks = []

app.get("/", (req, res, next) => {
    res.json("{ 'message': 'Tasks server online'}");
});

app.post("/tasks", jsonParser, (req, res, next) => {
    req.body.id = surrogateKey++;
    tasks.push(req.body);
    res.send("OK!");
});

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