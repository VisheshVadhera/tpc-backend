module.exports = function (res, err) {

    if (err) {
        res.status(500).json(err);
    }


}