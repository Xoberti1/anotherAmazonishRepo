var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "LocalHost",
    port: 3306,

    user: 'root',

    password: 'root',
    database: 'bamazonDB'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id" + connection.threadId);
    options();
});

function options() {
    inquirer.prompt({
        type: "rawlist",
        name: "options",
        message: "Task Options",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Logout"]
    }).then(function (values) {
        if (values.options === "View Products for Sale") {
            forSale();
        } else if (values.options === "View Low Inventory") {
            lowInventory();
        } else if (values.options === "Add to Inventory") {
            addInventory();
        } else if (values.options === "Add New Product") {
            newProduct();
        } else if (values.options === "Logout") {
            connection.end();
        }
    })
}

function forSale() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(
                "\nitem ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: $" + res[i].price + "\nLeft in Stock: " + res[i].stock_quantity
            );
        }
        console.log("Would you like to do anything else?");
        options();
    })
}

function lowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {
                console.log(
                    "\nitem ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: $" + res[i].price + "\nLeft in Stock: " + res[i].stock_quantity
                );
            } else {
                console.log(res[i].product_name + " stocks are adequate.")
            }
        }
        console.log("Would you like to do anything else?");
        options();
    })

}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([{
            type: "rawlist",
            name: "item",
            message: "Which product would you like to add inventory to",
            choices: function () {
                var choicesArray = [];
                for (var i = 0; i < res.length; i++) {
                    choicesArray.push(res[i].product_name);
                }
                return choicesArray;
            }
        }, {
            type: "input",
            name: "addAmount",
            message: "How many would you like to add?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true
                } else {
                    return false
                }
            }
        }]).then(function (values) {
            var chosenItem;
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name === values.item) {
                    chosenItem = res[i];
                }
            }
            console.log(chosenItem);
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: chosenItem.stock_quantity + parseInt(values.addAmount)
            }, {
                item_id: chosenItem.item_id
            }], function (err, res) {
                if (err) throw err;
                console.log("The inventory's been updated!")
            })
            console.log("\nWould you like to do anything else?\n");
            options();    
        })
    })
}

function newProduct() {
    inquirer.prompt([{
        type: "input",
        name: "product",
        message: "What product would you like sell?"
    }, {
        type: "list",
        name: "department",
        message: "What department should that be in?",
        choices: ["phones", "tablets", "computers", "gaming", "fitness", "footwear", "furniture", "books"]
    }, {
        type: "input",
        name: "price",
        message: "What price should be listed",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true
            } else {
                return false
            }
        }
    }, {
        type: "input",
        name: "stock",
        message: "How many do you have to sell?",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true
            } else {
                return false
            }
        }
    }]).then(function (values) {
        connection.query("INSERT INTO products SET ?", {
            product_name: values.product,
            department_name: values.department,
            price: values.price,
            stock_quantity: values.stock
        }, function (err, res) {
            if (err) throw err;
            console.log("You've added a product to the site!")
            console.log("\nWould you like to do anything else?\n");
            options();
        })
    })
}