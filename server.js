/*
 * Author: Carlos Field-Sierra
 * Description: This acts as the sevrver for the osaka 
 * website, it post things onto the database from index.html
 * page, and then gets request from the database from the url
 * path commands
 * 
 */
// Imports
const express = require("express")
const readline = require('readline');
const mongoose = require("mongoose");
const fs = require("fs") // read file
const parser = require("body-parser");

// Instances
const app = express()
app.use(parser.json() );
app.use(parser.urlencoded({ extended: true }));
const port = 3000
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaa';


// Setup schema
var Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;

var ItemsSchema = new Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String 
});
var UserSchema = new Schema({
    username: String,
    password: String,
    listings:[{ type : ObjectId, ref: 'Items' }],
    purchases:[{ type : ObjectId, ref: 'Items' }],
}) 
var Item = mongoose.model('Items', ItemsSchema );
var User = mongoose.model("User",UserSchema);




// Set up mongoose connection
mongoose.connect(mongoDBURL,{useNewUrlParser:true});
db.on('error',console.error.bind(console,"MongoDB connection error"));

// Server logic
app.use(express.static("public_html")) // <--when ever a path matches a file in that folder send it 



//  (GET) Should return a JSON array containing the information 
//  for every user in the database.
app.get('/get/users/',(req,res)=>{
    User.find({
    }).exec(function(error,results){
        res.send(JSON.stringify(results, null, 10));
    })
    
});

// (GET) Should return a JSON array containing 
// the information for every item in the database.
app.get('/get/items/',(req,res)=>{
    Item.find({
    }).exec(function(error,results){
        res.send(JSON.stringify(results, null, 10));
    })
});

// (GET) Should return a JSON array containing every 
// listing (item)for the user USERNAME
app.get('/get/listings/:USERNAME',async (req,res)=>{
    const USERNAME = req.params.USERNAME;
    await User.findOne({username:`${USERNAME}`}, async function(err,obj) {
        const resLst = [];

        if (obj===null){
            res.send(JSON.stringify(resLst, null, 10))
            return;
        }
        const itemIds = obj["listings"];
        for (var i in itemIds){
            const id = itemIds[i];
            await Item.findOne({_id:id},function(err,obj) 
            {
                resLst.push(obj)

            });
        }

        res.send(JSON.stringify(resLst, null, 10))
      
     });
    
});

// (GET) Should return a JSON array containing every 
// purchase (item) for the user USERNAME.
app.get('/get/purchases/:USERNAME',async (req,res)=>{
    const USERNAME = req.params.USERNAME;
    await User.findOne({username:`${USERNAME}`}, async function(err,obj) {
        const resLst = [];

        if (obj===null){
            res.send(JSON.stringify(resLst, null, 10))
            return;
        }
        const itemIds = obj["purchases"];
        for (var i in itemIds){
            const id = itemIds[i];
            await Item.findOne({_id:id},function(err,obj) 
            {
                resLst.push(obj)

            });
        }

        res.send(JSON.stringify(resLst, null, 10))
      
     });

});


// (GET) Should return a JSON list of every user whose
// username has the substring KEYWORD.
app.get('/search/users/:KEYWORD',(req,res)=>{
    const KEYWORD = req.params.KEYWORD;
    User.aggregate(
        [
            // Match first to reduce documents to those where the array contains the match
            { "$match": {
                "username": { "$regex": `${KEYWORD}`, "$options": 'i' }
            }},
    
        ],
        function(err,results) {
            if (results===null){
                res.send(JSON.stringify([], null, 10))
                return;
            }
            res.send(JSON.stringify(results, null, 10))
        }
    )
});

//  (GET) Should return a JSON list of every item whose 
// description has the substring KEYWORD.
app.get('/search/items/:KEYWORD',(req,res)=>{
    const KEYWORD = req.params.KEYWORD;
    Item.aggregate(
        [
            // Match first to reduce documents to those where the array contains the match
            { "$match": {
                "description": { "$regex": `${KEYWORD}`, "$options": 'i' }
            }},
    
        ],
        function(err,results) {
            if (results===null){
                res.send(JSON.stringify([], null, 10))
                return;
            }
            res.send(JSON.stringify(results, null, 10))
        }
    )
});


// (POST) Should add a user to the database. The username and password 
// should be sent as POST parameter(s).
app.post('/add/user/', (req, res) => {
    const msg =  JSON.parse(req.body.user);
    var data =  new User({
        username: msg.username,
        password: msg.password,
        listings: msg.listings,
        purchases: msg.purchases,
    })
    data.save(function (err){
        if (err){
            console.log("error")
        } 
    })
});


// (POST) Should add an item to the database. The items information (title, description, image, price, status) should be included as POST parameters. 
// The item should be added the USERNAMEs list of listings.
app.post('/add/item/USERNAME', (req, res) => {
    const msg =  JSON.parse(req.body.item);
    var data =  new Item({
        title: msg.title,
        description: msg.description,
        image: msg.image,
        price: msg.price,
        stat: msg.stat,
    })
    data.save(function (err){
        if (err){
            console.log("error")
        } 
    })

    if (msg.stat=="SALE"){
            User.update(
                {username:`${msg.username}`},
                {$push:{
                    listings:`${data._id}`
                }}
            ).exec();
        
    }
    if (msg.stat=="SOLD"){

    }
});


// Listen for port
app.listen(port,()=>
console.log(`Example app listening at http://localhost:${port}`)
)