const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('qs');

let handlers = {};
let getTemplate = (req, res, path) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        }
    });
}
let caculator = (dataNumber) => {
    
    let select = dataNumber.select;
    let number1 = +dataNumber.number1;
    let number2 = +dataNumber.number2;
    let result = 0;
    switch (select) {
        case 'cong':
            result = number1 + number2;
            break;
        case 'tru':
            result = number1 - number2;
            break;
        case 'nhan':
            result = number1 * number2;
            break;
        case 'chia':
            result = number1 / number2;
            break;
    }
    return result;
}
handlers.caculator = (req, res) => {
    if (req.method === 'GET') {
        getTemplate(req, res, 'views/caculator.html');
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            const dataNumber = qs.parse(data);
            const result=caculator(dataNumber);
            fs.readFile('views/result.html', 'utf-8', (err, datahtml) => {
                if (err) {
                    console.log(err);
                } else {
                    datahtml = datahtml.replace('{result}', result)
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(datahtml);
                    return res.end();
                }
            })
        })
    }

}
handlers.notFound = (req, res) => {
    getTemplate(req, res, 'views/not-found.html')
}
handlers.result = (req, res) => {
    getTemplate(req, res, 'views/result.html')

}
let router = {
    '': handlers.caculator,
    'caculator': handlers.caculator,
    'result': handlers.result,
}
http.createServer((req, res) => {
    let urlParse = url.parse(req.url, true);
    let path = urlParse.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');

    let chosenHandler;

    if (typeof router[trimPath] === 'undefined') {
        chosenHandler = handlers.notFound;
    } else {
        chosenHandler = router[trimPath];
    }
    chosenHandler(req, res);
}).listen(8080, () => {
    console.log('localhost8080');
})