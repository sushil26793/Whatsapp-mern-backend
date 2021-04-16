// importing 
const mongoose = require('mongoose');
const express = require ('express');
const Messages = require('./dbMessages')
const Pusher=require('pusher')
const cors = require('cors');

// config
const app=express();
const PORT= process.env.PORT|| 8000;


 // middleware
 app.use(express.json());
 app.use(cors())
 


 //db config
 const db_url='mongodb+srv://sushil_singh:9696300910@cluster0.joogi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
 mongoose.connect(db_url, {
     useCreateIndex:true,
     useNewUrlParser:true,
     useUnifiedTopology:true
 })
 const pusher = new Pusher({
    appId: "1186955",
    key: "f60ca51060b31bc3b722",
    secret: "8ce89aafb181e52cbe6f",
    cluster: "ap2",
    useTLS: true
  });


 //??
 const db=mongoose.connection
 db.once('open',()=>{
     console.log('db is connected')
     const msgCollection= db.collection('messagecontents')
     const changeStream= msgCollection.watch();
     changeStream.on('change', (change)=>{
         console.log(change)
         if(change.operationType=== 'insert'){
             const messageDetails=change.fullDocument;
             pusher.trigger('message', 'inserted',{
                 name:messageDetails.name,
                 message:messageDetails.message,
                 timestamp:messageDetails.timestamp, 
                 received:messageDetails.received
             })
         }
         else{
             console.log('Error trigerring pusher')
         }

     })

 })
 


 //api routes
 app.get('/',(req,res)=>{
     res.status(200).send('Hello world')
 });
 app.get('/messages/sync', (req, res)=>{
     
     Messages.find(((err,data)=>{
         if(err){
             res.status(500).send(err)
         }
         else{
             res.send(data)
         }
     }))

 })
 app.post('/messages/new', (req,res)=>{
     const dbMessage=req.body
     Messages.create(dbMessage,(err,data)=>{
         if(err){
             res.status(500).send(err)
         } 
         else{
             res.status(200).send(`New messages are created ${data}`)
         }
     })
 })


 // listen 
app.listen(PORT,()=>{
    console.log(`Application is up and running on localhost:${PORT}`)
})



 