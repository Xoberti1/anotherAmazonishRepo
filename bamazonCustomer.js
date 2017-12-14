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
    itemsForSale();
});

function itemsForSale() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(
                "\nitem ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: $" + res[i].price + "\nLeft in Stock: " + res[i].stock_quantity
            );
        }
        inquirer.prompt({
            type: "rawlist",
            name: "item_ID",
            message: "Which item would you like to buy?",
            choices: function () {
                var choicesArray = [];
                for (var i = 0; i < res.length; i++) {
                    choicesArray.push(res[i].product_name)
                }
                return choicesArray;
            }
        }).then(function (answer) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name == answer.item_ID) {
                    var chosenItem = res[i];
                    inquirer.prompt({
                        type: "input",
                        name: "quantity",
                        message: "How many would you like?",
                        validate: function (value) {
                            if (isNaN(value) == false) {
                                return true
                            } else {
                                return false
                            }
                        }
                    }).then(function (answer) {
                        connection.query("SELECT 'answer.quantity' FROM products WHERE 'answer.item_ID'", function (err, res) {
                            if (err) throw err;
                            if (answer.quantity > chosenItem.stock_quantity) {
                                console.log("Sorry, stock is too low.")
                            } else {
                                connection.query("UPDATE products SET ? WHERE?",[
                                {
                                    stock_quantity: chosenItem.stock_quantity - answer.quantity
                                },
                                {
                                    item_id: chosenItem.item_id
                                }], function(err, res){
                                    if(err) throw err;
                                    console.log("your order is on its way.")
                                    console.log(chosenItem.stock_quantity + " left in stock.")
                                })
                            }
                            connection.end();
                        })
                    })

                }
            }
        })
    })
}