Documentation
==============

Purpose
---------------------
This is a trading simulation where traders trade a single stock CRL for two 'years.' Each trader starts with 400 shares and 10,000 dollars at the start of Year 1. The goal is for each trader to maximize their porfolio. 

Mechanics
------------------
This web app follows the client-server model. However, it does not implement this in a RESTful way, i.e. both client and server can initiate contact with the other. There is a single server whose primary duty is to maintain the order book, fulfill orders, and keep the communication channels open between itself and the different clients. There are two types of clients: admin (facilitator) and trader. There is a single admin who controls the parameters of the simulation, such as duration, market environment, etc. 

Clients and servers communicate by passing JSONs back and forth. There are two types of communication channels. The first is between admin and the server. The second is between each trader and the server. The messages that the admin passes to the server are redirected to the traders via the server. The clients send orders to the server, and the server sends updates which consist of sales and quotes to the clients. 

The server is in charge of order fulfillment. Each time an order is sent to the server, the server checks if this new order fulfills or can be fulfilled by any of the orders that are in the order book. If so, it fullfills the orders, records the sale, updates the quote information, and sends the sale log and quote information to the clients for them to update their views. If not, the server updates the quote information (in the case of a competitive limit order). 

When the client recieves updates from the server concerning sales and quote information, it updates the table at the bottom to reflect the updated quote. The client goes through the sale logs, checking the order id, which is the time in millisecond that the order was made, to see if any of the current orders of this client match. If they match, the client updates the matching order by either getting rid of it or decreasing the amount of that order. Also, the stock and cash amounts for that user are reevaluated. If the user has no sales that match, the stock value is still updated in accordance with the new price. Either way, the price and volume graphs are updated.

Flow of the simulation
---------------------
1. Admin logs on (password: password)
2. Traders log on 
3. Admin picks options for simulation and starts Year 1
4. Trading panel is enabled for traders to trade
5. When Year 1 end, admin can start Year 2

Next Steps: 
-------------------
1. Test leverage and short selling constraint method (commented out regions in the enableTradingPanel method)
2. Implement dividends
3. Export results of the simulation in terms of individual traders and as the 'market' as a whole.
4. Make sure that the emails are in the correct format and are unique
5. Update view to show the leverage ratio and if short selling was enabled

Technologies used
-------------------
- Node.js (Javascript server)
- Express (Application framework, Routing)
- Socket.io (Server client communication, Message passing)
- Handlebars.js (Templating)
- jQuery (DOM manipulation)
- Twitter Bootstrap (CSS)
- Flot (Graphs)
