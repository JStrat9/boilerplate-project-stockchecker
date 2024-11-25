const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
    suite("GET /api/stock-prices => stockData object", function () {
        test("Viewing one stock", function (done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({ stock: "GOOG" })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    done();
                });
        });

        test("Viewing one stock and liking it", function (done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({ stock: "GOOG", like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    assert.isAbove(res.body.stockData.likes, 0);
                    done();
                });
        });

        test("Viewing the same stock and liking it again", function (done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({ stock: "GOOG", like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    const likesAfterSecondLike = res.body.stockData.likes;
                    assert.isAbove(likesAfterSecondLike, 0);

                    chai.request(server)
                        .get("/api/stock-prices")
                        .query({ stock: "GOOG", like: true })
                        .end(function (err2, res2) {
                            assert.equal(res2.status, 200);
                            assert.equal(
                                res2.body.stockData.likes,
                                likesAfterSecondLike,
                                "Likes should not increase after liking the same stock again"
                            );
                            done();
                        });
                });
        });

        test("Viewing two stocks", function (done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({ stock: ["GOOG", "MSFT"] })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.lengthOf(res.body.stockData, 2);
                    assert.property(res.body.stockData[0], "stock");
                    assert.property(res.body.stockData[0], "price");
                    assert.property(res.body.stockData[0], "rel_likes");
                    assert.property(res.body.stockData[1], "stock");
                    assert.property(res.body.stockData[1], "price");
                    assert.property(res.body.stockData[1], "rel_likes");
                    done();
                });
        });

        test("Viewing two stocks and liking them", function (done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({ stock: ["GOOG", "MSFT"], like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.lengthOf(res.body.stockData, 2);
                    assert.property(res.body.stockData[0], "stock");
                    assert.property(res.body.stockData[0], "price");
                    assert.property(res.body.stockData[0], "rel_likes");
                    assert.property(res.body.stockData[1], "stock");
                    assert.property(res.body.stockData[1], "price");
                    assert.property(res.body.stockData[1], "rel_likes");
                    done();
                });
        });
    });
});
