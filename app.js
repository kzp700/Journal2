const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kzp700:MOgr33ng3cko!@cluster0.zias4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

//Generate today's date in mm/dd/yyyy format
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

fullDate = mm + '/' + dd + '/' + yyyy;

// Mongoose "item" schema

const entrySchema = {
    date: String,
    entry: String
  };

const Entry = mongoose.model("Entry", entrySchema);

//Default items which load if no data present

const entry1 = new Entry({
  date: "07/21/2021",
  entry: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan tortor posuere ac ut consequat semper viverra. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Ac felis donec et odio. Pellentesque id nibh tortor id aliquet lectus proin nibh."
});
  
const entry2 = new Entry({
  date: "07/22/2021",
  entry: "Nunc id cursus metus aliquam. Et malesuada fames ac turpis egestas maecenas. Euismod lacinia at quis risus. Dolor morbi non arcu risus quis varius quam quisque id. Tortor id aliquet lectus proin nibh nisl. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus. Feugiat vivamus at augue eget arcu dictum varius duis at. In nisl nisi scelerisque eu ultrices vitae auctor."
});
  
const entry3 = new Entry({
  date: "07/24/2021",
  entry: "Nec ullamcorper sit amet risus nullam eget felis. Consequat nisl vel pretium lectus. Consequat nisl vel pretium lectus quam. Et netus et malesuada fames ac turpis. Egestas congue quisque egestas diam in. Sed arcu non odio euismod lacinia at. Quis blandit turpis cursus in hac habitasse. Varius sit amet mattis vulputate. Ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla."
});

const entry4 = new Entry({
  date: "07/24/2021",
  entry: "Sem fringilla ut morbi tincidunt augue interdum velit. Cursus vitae congue mauris rhoncus aenean vel elit. Eu turpis egestas pretium aenean pharetra. Leo integer malesuada nunc vel risus. Massa massa ultricies mi quis hendrerit. Vitae tortor condimentum lacinia quis vel. Amet mauris commodo quis imperdiet massa tincidunt. Ac turpis egestas maecenas pharetra convallis posuere morbi leo. Convallis posuere morbi leo urna molestie. A pellentesque sit amet porttitor eget dolor morbi non. Et odio pellentesque diam volutpat commodo sed egestas. Lacinia at quis risus sed vulputate odio. Faucibus ornare suspendisse sed nisi lacus sed viverra tellus. Egestas pretium aenean pharetra magna ac."
});

const entry5 = new Entry({
  date: "07/25/2021",
  entry: "Nibh cras pulvinar mattis nunc sed blandit. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Non arcu risus quis varius. Pulvinar sapien et ligula ullamcorper malesuada. Morbi tristique senectus et netus et. Id velit ut tortor pretium viverra. Id nibh tortor id aliquet."
});
  
const defaultEntries = [entry1, entry2, entry3, entry4, entry5];

app.get("/", function(req, res) {

  Entry.find({}, function(err, foundEntries){
  
    if (foundEntries.length === 0) {
      Entry.insertMany(defaultEntries, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default entries to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {foundEntries: foundEntries});
    } 
  });
});

app.post("/", function(req, res){

  const newEntry = req.body.newEntry;
  const entryDate = fullDate;
      
  const entry = new Entry({
    date: entryDate,
    entry: newEntry
  });

  entry.save();
  res.redirect("/#entryBox");
});
      
app.post("/delete", function(req, res){
  const deleteEntryId = req.body.entryId;

  Entry.findByIdAndRemove(deleteEntryId, function(err){
    if (!err) {
      console.log("Successfully deleted entry.");
      res.redirect("/");
    } else if (err) {
        console.log(err)
    }
  });
});

app.post("/update", function(req, res){
  const updateEntryId = req.body.entryId;
  const updatedEntry = req.body.updatedEntry;
  const entryDate = req.body.entryDate;
      
  const entry = new Entry({
      date: entryDate,
      entry: updatedEntry
  });

  Entry.findByIdAndUpdate(updateEntryId, {entry: updatedEntry}, function(err){
    if (!err) {
      console.log("Entry updated.");
    } else if (err) {
      console.log(err);
    }
  });
      
 
  res.redirect("/");
});

 
  
app.get("/entry/:entryId", function(req, res){

  const requestedEntryId = req.params.entryId;
        
  Entry.findOne({_id: requestedEntryId}, function(err, entry){
    res.render("entry", {
      entry: entry
    });
  });   
});

//Heroku settings

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

//local host settings

app.listen(3000, function() {
  console.log("Server started on port 3000");
});