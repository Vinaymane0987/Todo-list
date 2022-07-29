//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//connecting mongoose to the monogdb server using url
mongoose.connect("mongodb+srv://test:test@vinsclub.ukeqm.mongodb.net/todolistDB",{useNewUrlParser:true});
//creating an schema
const itemsSchema = {
name:String
};
//creting model using mongoose
const Item = mongoose.model("Item",itemsSchema);
// using Item datase creating items
const item1 = new Item({
  name:"welcome to Your todolist"
});
const item2 = new Item({
  name:"hit the button to add new item"
});
const item3 = new Item({
  name:"hit this to delete an item"
});

//creating an array of items
const defaultItems = [item1 , item2 ,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);





app.get("/", function(req, res) {

  Item.find({},(err , foundItems)=>{
    if(foundItems.length === 0)
    {
      // insert many function use to insert the items inside the database
      Item.insertMany(defaultItems,(err)=>{
        if(err)
        {
          console.log("err");
        }
        else
        {
          console.log("successfully saved defaultItems to database");
        }
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName",(req , res)=>{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err ,foundList)=>{
    if(!err)
    {
      if(!foundList){
      // here we have to create a new list
      const list  = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      }else{
    // here we have to show an existing list
       res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item  = new Item({
    name:itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},(err ,foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

app.post("/delete",(req ,res)=>{
  const checkeditem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkeditem,(err)=>{
       if(!err)
       {
         console.log("successfully deleted from the list");
         res.redirect("/");
       }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditem}}},(err , foundList)=>{
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});




// https://sleepy-island-10917.herokuapp.com/
