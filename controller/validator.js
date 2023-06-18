'use strict';

const { body, validationResult } = require('express-validator');

function showErrorMessageIfAvailable(page) {
    return function (req, res, next) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors = errors.array();

            let message = '';
            for (const element of errors) {
                message += element.msg + "<br/>";
            }

            return res.send(message);
        }

        next();
    }
}

module.exports = { body, showErrorMessageIfAvailable }