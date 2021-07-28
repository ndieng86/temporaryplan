module.exports = function (app) {

    //a route which renders the create a sales reciept form
    app.get('/createSalesReceiptForm', function (req, res) {
        function renderPage() {
            res.render('createSalesReceiptForm.html', { customers: [{'customerID':1010, 'custormerName':'jhonny'}], items: [{"name":"Calfeutrage", "id":1}] });
        }
        //Add a timeout of 2000 in order to allow the customers and items response to complete before rendering the page
        setTimeout(renderPage, 2000);
    })


    //a route which calls CreateSalesReciept
    app.get('/createSalesReceipt', function (req, res) {
        //Check to make sure the front end is sending an item selected, if it is null, render the error page
        if (!req.query.itemSelect) {
            res.render('errorPage.html', { locals: { errorMessage: { Message: 'No Item Selected', Detail: 'You Must Select an Item' } } })
        }
        else {
            // [0]is the item name, [1]is the item id, [2] is the item unit price
            var ItemRef = req.query.itemSelect.split('; ');
            qbdata = {
                "Line": [
                    {
                        "Id": "1",
                        "LineNum": 1,
                        "Description": req.query.Description,
                        "Amount": ItemRef[2] * req.query.Qty,
                        "DetailType": "SalesItemLineDetail",
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": ItemRef[1],
                                "name": ItemRef[0]
                            },
                            "UnitPrice": ItemRef[2],
                            "Qty": req.query.Qty,
                            "TaxCodeRef": {
                                "value": "NON"
                            }
                        }
                    }
                ],
                "CustomerRef": {
                    "value": req.query.CustomerId
                }
            }
        }
    })

}