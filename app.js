const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kzp700:MOgr33ng3cko!@cluster0.zias4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

// Mongoose "item" schema

const itemsSchema = {
    name: String
  };

const Item = mongoose.model("Item", itemsSchema);

//Default items which load if no data present

const item1 = new Item({
    name: "Test 1."
  });
  
  const item2 = new Item({
    name: "Test 2."
  });
  
  const item3 = new Item({
    name: "Test 3."
  });
  
  const defaultItems = [item1, item2, item3];

  //Mongoose "list" schema

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);

  //Root request. If no data to display it loads default values then refreshes.
  //If data is present it displays the data.

  app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems){
  
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully saved default items to DB.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "To Do List", newListItems: foundItems});
      }
    });

    app.post("/", function(req, res){

        const itemName = req.body.newItem;
        const listName = req.body.list;
      
        const item = new Item({
          name: itemName
        });
      
        if (listName ==="To Do List"){
          item.save();
          res.redirect("/");
        } else {
          List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
          });
        }
      });
      
      app.post("/delete", function(req, res){
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;
      
        if (listName === "To Do List") {
          Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
              res.redirect("/");
            }
          });
        } else {
          List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err){
              res.redirect("/" + listName);
            }
          });
        }
      
      
      });

      app.get("/:customListName", function(req, res){
        const customListName = _.capitalize(req.params.customListName);
      
        List.findOne({name: customListName}, function(err, foundList){
          if (!err){
            if (!foundList){
              //Create a new list
              const list = new List({
                name: customListName,
                items: defaultItems
              });
              list.save();
              res.redirect("/" + customListName);
            } else {
              //Show an existing list
      
              res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
          }
        });
      
      
      
      });
  
//Server listen for request

  });
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });