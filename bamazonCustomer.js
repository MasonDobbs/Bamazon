var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
});

function readProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].product_name)
                        }
                        return choiceArray;
                    },
                    message: "Welcome to Bamazon \nWhat item would you like to purchase?"
                },
                {
                    name: "stock",
                    type: "input",
                    message: "How many would you like to purchase"

                }
            ]).then(function (answer) {

                var chosenItem;
                for (i = 0; i < res.length; i++) {
                    if (res[i].product_name === answer.choice) {
                        chosenItem = res[i];
                        var stock = chosenItem.stock_quantity;
                        console.log(stock);
                        stock -= parseInt(answer.stock);
                        console.log(stock);
                        if (answer.stock <= stock) {
                            connection.query("UPDATE products SET ? WHERE ?", [
                                {
                                    stock_quantity: stock
                                },
                                {
                                    item_id: chosenItem.item_id
                                }
                            ], function (err, res) {
                                if (err) throw err;

                                console.log('Your order has been placed! Your total is $' + chosenItem.price * answer.stock);
                                console.log('Thank you for shopping with us!');

                            });
                        } else {
                            console.log("Sorry we are currently out of what you are trying to purchase");
                            readProducts();
                        }

                    }


                }

                connection.end();

            });

    });
};