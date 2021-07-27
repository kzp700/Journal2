const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kzp700:MOgr33ng3cko!@cluster0.zias4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

//Generate todays date in mm/dd/yyyy format
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

fullDate = mm + '/' + dd + '/' + yyyy;

// Mongoose "item" schema

const itemsSchema = {
    date: String,
    name: String
  };

const Item = mongoose.model("Item", itemsSchema);

//Default items which load if no data present

const item1 = new Item({
    date: "07/21/2021",
    name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan tortor posuere ac ut consequat semper viverra. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Ac felis donec et odio. Pellentesque id nibh tortor id aliquet lectus proin nibh."
  });
  
  const item2 = new Item({
    date: "07/22/2021",
    name: "Nunc id cursus metus aliquam. Et malesuada fames ac turpis egestas maecenas. Euismod lacinia at quis risus. Dolor morbi non arcu risus quis varius quam quisque id. Tortor id aliquet lectus proin nibh nisl. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus. Feugiat vivamus at augue eget arcu dictum varius duis at. In nisl nisi scelerisque eu ultrices vitae auctor."
  });
  
  const item3 = new Item({
    date: "07/24/2021",
    name: "Nec ullamcorper sit amet risus nullam eget felis. Consequat nisl vel pretium lectus. Consequat nisl vel pretium lectus quam. Et netus et malesuada fames ac turpis. Egestas congue quisque egestas diam in. Sed arcu non odio euismod lacinia at. Quis blandit turpis cursus in hac habitasse. Varius sit amet mattis vulputate. Ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla."
  });

  const item4 = new Item({
    date: "07/24/2021",
    name: "Sem fringilla ut morbi tincidunt augue interdum velit. Cursus vitae congue mauris rhoncus aenean vel elit. Eu turpis egestas pretium aenean pharetra. Leo integer malesuada nunc vel risus. Massa massa ultricies mi quis hendrerit. Vitae tortor condimentum lacinia quis vel. Amet mauris commodo quis imperdiet massa tincidunt. Ac turpis egestas maecenas pharetra convallis posuere morbi leo. Convallis posuere morbi leo urna molestie. A pellentesque sit amet porttitor eget dolor morbi non. Et odio pellentesque diam volutpat commodo sed egestas. Lacinia at quis risus sed vulputate odio. Faucibus ornare suspendisse sed nisi lacus sed viverra tellus. Egestas pretium aenean pharetra magna ac."
  });

  const item5 = new Item({
    date: "07/25/2021",
    name: "Nibh cras pulvinar mattis nunc sed blandit. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Non arcu risus quis varius. Pulvinar sapien et ligula ullamcorper malesuada. Morbi tristique senectus et netus et. Id velit ut tortor pretium viverra. Id nibh tortor id aliquet."
  });
  
  const defaultItems = [item1, item2, item3, item4, item5];

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
        res.render("list", {listTitle: "Journal", newListItems: foundItems});
      }
    });

    app.post("/", function(req, res){

        const itemName = req.body.newItem;
        const listName = req.body.list;
        const itemDate = fullDate;
      
        const item = new Item({
            date: itemDate,
            name: itemName
        });
      
        if (listName ==="Journal"){
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
        const checkedItemId = req.body.listId;
        const listName = req.body.listName;
      
        if (listName === "Journal") {
          Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
              console.log("Successfully deleted item.");
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

    //   app.get("/:customListName", function(req, res){
    //     const customListName = _.capitalize(req.params.customListName);
      
    //     List.findOne({name: customListName}, function(err, foundList){
    //       if (!err){
    //         if (!foundList){
    //           //Create a new list
    //           const list = new List({
    //             name: customListName,
    //             items: defaultItems
    //           });
    //           list.save();
    //           res.redirect("/" + customListName);
    //         } else {
    //           //Show an existing list
      
    //           res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    //         }
    //       }
    //     });
    //   });
  
    app.get("/posts/:postId", function(req, res){

        const requestedPostId = req.params.postId;
        
          Post.findOne({_id: requestedPostId}, function(err, post){
            res.render("post", {
              title: post.title,
              content: post.content
            });
          });
        
        });
        
//Server listen for request

  });
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });