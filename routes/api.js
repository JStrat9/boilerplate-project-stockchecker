"use strict";
const StockModel = require("../models").Stock;
const helmet = require("helmet");

async function createStock(stock, like, ip) {
    const newStock = new StockModel({
        symbol: stock,
        likes: like ? [ip] : [],
    });
    return await newStock.save();
}

async function findStock(stock) {
    return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
    const foundStock = await findStock(stock);
    if (!foundStock) {
        return await createStock(stock, like, ip);
    } else {
        if (like && !foundStock.likes.includes(ip)) {
            foundStock.likes.push(ip);
        }
        return await foundStock.save();
    }
}

async function getStock(stock) {
    const fetch = (await import("node-fetch")).default;
    try {
        const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
        );
        const data = await response.json();
        if (!data.symbol || !data.latestPrice) {
            throw new Error("Invalid stock data");
        }
        return { symbol: data.symbol, latestPrice: data.latestPrice };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw new Error("Unable to fetch stock data");
    }
}

module.exports = function (app) {
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
            },
        })
    );

    app.route("/api/stock-prices").get(async function (req, res) {
        const { stock, like } = req.query;
        const ip = req.ip;
        let stockData = [];

        if (Array.isArray(stock)) {
            try {
                const stock1 = await getStock(stock[0]);
                const stock2 = await getStock(stock[1]);

                const savedStock1 = await saveStock(stock1.symbol, like, ip);
                const savedStock2 = await saveStock(stock2.symbol, like, ip);

                stockData = [
                    {
                        stock: stock1.symbol,
                        price: stock1.latestPrice,
                        rel_likes:
                            savedStock1.likes.length - savedStock2.likes.length,
                    },
                    {
                        stock: stock2.symbol,
                        price: stock2.latestPrice,
                        rel_likes:
                            savedStock2.likes.length - savedStock1.likes.length,
                    },
                ];

                res.json({ stockData });
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({
                    error: "An error occurred while processing your request.",
                });
            }
        } else {
            try {
                const stockInfo = await getStock(stock);
                const savedStock = await saveStock(stockInfo.symbol, like, ip);

                stockData = {
                    stock: stockInfo.symbol,
                    price: stockInfo.latestPrice,
                    likes: savedStock.likes.length,
                };

                res.json({ stockData });
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({
                    error: "An error occurred while processing your request.",
                });
            }
        }
    });
};
