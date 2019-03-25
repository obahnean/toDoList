//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ovi:Test123@cluster0-agbfw.mongodb.net/todolistDB",{useNewUrlParser:true});

const ItemsSchema = {
  name: String
};

const Item = mongoose.model("Item", ItemsSchema);

const item1 = new Item({
  name: "Welcome to todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [ItemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0 ) {
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("Success!!! adding the items");
        }
        res.redirect("/");
      });
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });


  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
    console.log(err);
  } else {
    console.log("The item has been successfully removed");
    res.redirect("/");
  }
  });
} else{
  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});


app.get("/:cusomListName", function(req,res){
  const customlist = _.capitalize(req.params.cusomListName);
  List.findOne({name:customlist}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customlist,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customlist);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  })


});

let port = process.env.PORT;
if (port == null || port == ""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
