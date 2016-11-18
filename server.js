let bodyParser = require('body-parser')
let express = require('express')
let mysql = require('mysql')
let restResponse = require('express-rest-response')
let login = require('./login.js')
let expressValidator = require('express-validator')
fs = require('fs');


let app = express()


function connect_db() {
  let connection = mysql.createConnection({
    host     : 'it2810-07.idi.ntnu.no',
    user     : login.uname,
    password : login.pass,
    database : 'book_db'
  })
  connection.connect((err) => {
    if (err) {
      console.log(err)
      return
    }
  })
  return connection
}


let allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '/api')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
}

const options = {
  showStatusCode: true,
  showDefaultMessage: true
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressValidator())
app.use(restResponse(options))
app.use(allowCrossDomain)

let port = process.env.PORT || 8081
let router = express.Router()


router.get('/', (req, res) => {
  fs.readFile('doc.json', 'utf8', (err,data) => {
  res.type('application/json');
  res.send(JSON.parse(data));
  });
})

router.route('/owners')
  .get((req, res) => {
    const connection = connect_db()
    const sql = 'SELECT * FROM owners'
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.success(rows)
      }
    })
    connection.end()
  })
  .post((req, res) => {
    req.checkBody('fname', 'Invalid postparam').notEmpty().isAlpha()
    req.checkBody('lname', 'Invalid postparam').notEmpty().isAlpha()
    req.checkBody('phone', 'Invalid postparam').notEmpty().isInt()
    if (req.validationErrors()) {
      res.rest.badRequest('Missing or malformed post parameter(s)')
      return
    }
    const connection = connect_db()
    let sql = 'INSERT INTO owners (first_name, last_name, phone) VALUES (?, ?, ?)'
    const inserts = [req.body.fname, req.body.lname, req.body.phone]
    sql = mysql.format(sql, inserts)
    console.log(sql);
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.created('Insert Successful')
      }
    })
    connection.end()
  })

router.route('/owners/:id')
  .get((req, res) => {
    const connection = connect_db()
    let sql = 'SELECT * FROM owners WHERE id=?'
    sql = mysql.format(sql, [req.params.id])
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        if (rows.length > 0) {
          res.rest.success(rows)
        } else {
          res.rest.noContent()
        }
      }
    })
    connection.end()
  })
  .delete((req, res) => {
    const connection = connect_db()
    let sql = 'DELETE FROM owners WHERE id=?'
    sql = mysql.format(sql, [req.params.id])
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.success("Delete Successful")
      }
    })
    connection.end()
  })
  .put((req, res) => {
    req.checkBody('fname', 'Invalid postparam').notEmpty().isAlpha()
    req.checkBody('lname', 'Invalid postparam').notEmpty().isAlpha()
    req.checkBody('phone', 'Invalid postparam').notEmpty().isInt()
    if (req.validationErrors()) {
      res.rest.badRequest('Missing or malformed post parameter(s)')
      return
    }
    const connection = connect_db()
    let sql = 'UPDATE owners SET first_name=?, last_name=?, phone=?  WHERE id=?'
    sql = mysql.format(sql, [req.body.fname, req.body.lname, req.body.phone, req.params.id])
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.success()
      }
    })
    connection.end()
  })


router.route('/properties')
  .get((req, res) => {
    const connection = connect_db()
    const sql = 'SELECT * FROM properties'
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.success(rows)
      }
    })
  })
  .post((req, res) => {
    req.checkBody('adress', 'Invalid postparam').notEmpty()
    req.checkBody('value', 'Invalid postparam').notEmpty().isInt()
    req.checkBody('size', 'Invalid postparam').notEmpty().isInt()
    req.checkBody('owner', 'Invalid postparam').notEmpty().isInt()
    if (req.validationErrors()) {
      res.rest.badRequest('Missing or malformed post parameter(s)')
      return
    }
    const connection = connect_db()
    let sql = 'INSERT INTO properties (adress, value, size, owner) VALUES (?, ?, ?, ?)'
    const inserts = [req.body.adress, req.body.value, req.body.size, req.body.owner]
    sql = mysql.format(sql, inserts)
    console.log(sql);
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        res.rest.created('Insert Successful')
      }
    })
    connection.end()
  })

router.route('/properties/owners/:id')
  .get((req, res) => {
    const connection = connect_db()
    let sql = 'SELECT * FROM properties WHERE owner=?'
    sql = mysql.format(sql, [req.params.id])
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        res.rest.serverError('Database Error')
      } else {
        if (rows.length > 0) {
          res.rest.success(rows)
        } else {
          res.rest.noContent()
        }
      }
    })
    connection.end()
  })



app.use('/api', router)
app.listen(port)
console.log('Magic happens on port ' + port)
