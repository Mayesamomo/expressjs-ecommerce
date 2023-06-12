const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || "8888";
const dbUrl = "mongodb://127.0.0.1:27017/coffeedb";
const client = new MongoClient(dbUrl);

// Set the views directory and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle GET request for the home page
app.get("/", async (request, response) => {
  const menu = await getMenu();
  response.render("index", { title: "Home", menu: menu });
});

// Handle GET request for adding a menu item
app.get("/menu/add", (request, response) => {
  response.render("menu-add", { title: "Add Coffee Menu" });
});

// Handle POST request for adding a menu item
app.post("/menu/add", async (request, response) => {
  const { name, description, price, image } = request.body;
  const newMenuItem = {
    name: name,
    description: description,
    price: parseFloat(price),
    image: image
  };
  await addMenuItem(newMenuItem);
  response.redirect("/");
});

// Handle GET request for editing a menu item
app.get("/menu/edit/:id", async (request, response) => {
  const menuItemId = request.params.id;
  const menuItem = await getMenuItemById(menuItemId);
  response.render("menu-edit", { title: "Edit Coffee Menu", menuItem: menuItem });
});

// Handle POST request for editing a menu item
app.post("/menu/edit/:id", async (request, response) => {
  const menuItemId = request.params.id;
  const { name, description, price, image } = request.body;
  const updatedMenuItem = {
    name: name,
    description: description,
    price: parseFloat(price),
    image: image
  };
  await updateMenuItem(menuItemId, updatedMenuItem);
  response.redirect("/");
});

// Handle GET request for deleting a menu item
app.get("/menu/delete/:id", async (request, response) => {
  const menuItemId = request.params.id;
  await deleteMenuItem(menuItemId);
  response.redirect("/");
});

// Handle GET request for retrieving a single menu item by ID
app.get("/menu/:id", async (request, response) => {
  const menuItemId = request.params.id;
  const menuItem = await getMenuItemById(menuItemId);
  response.render("menu-item", { title: "Coffee Menu Item", menuItem: menuItem });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// Establish a connection to the MongoDB database
async function connection() {
  const db = client.db("coffeedb");
  return db;
}

// Retrieve the coffee menu from the database
async function getMenu() {
  const db = await connection();
  const results = db.collection("menu").find({});
  const menu = await results.toArray();
  return menu;
}

// Add a new menu item to the database
async function addMenuItem(newMenuItem) {
  const db = await connection();
  await db.collection("menu").insertOne(newMenuItem);
  console.log("Menu item added");
}

// Retrieve a menu item by its ID from the database
async function getMenuItemById(menuId) {
  const db = await connection();
  const filter = { _id: new ObjectId(menuId) };
  const menuItem = await db.collection("menu").findOne(filter);
  return menuItem;
}

// Update a menu item in the database
async function updateMenuItem(menuItemId, updatedMenuItem) {
  const db = await connection();
  const filter = { _id: new ObjectId(menuItemId) };
  await db.collection("menu").updateOne(filter, { $set: updatedMenuItem });
  console.log("Menu item updated");
}

// Delete a menu item from the database
async function deleteMenuItem(menuItemId) {
  const db = await connection();
  const deleteFilter = { _id: new ObjectId(menuItemId) };
  const result = await db.collection("menu").deleteOne(deleteFilter);
  if (result.deletedCount == 1) {
    console.log("Delete successful");
  }
}
