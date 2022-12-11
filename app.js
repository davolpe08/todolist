//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const app = require('./app')

const port = process.env.PORT || 3000

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-ashu:admin123@cluster0.oa2miac.mongodb.net/todolistDB",{useNewURLParser:true});
console.log("hello");
const itemsSchema = {
  name:String
};

const Item = mongoose.model(
  "Item", itemsSchema
);

const item1 = new Item ({
  name:"Welcome to your todolist!"
});

const item2 = new Item ({
  name:"Hit the + button to add a new item."
});

const item3 = new Item ({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved default items to DB!");
        }
      });
      res.redirect("/");
    }
    else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName},function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete", function (req,res) {
  const checkItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkItemID,function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Successfully removed Item!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkItemID}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName",function (req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function (err,foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });


})

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
