const express = require('express');
const employeeRouter = express.Router();

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({employees: rows});
        }
    });
});

employeeRouter.post('/', (req, res, next) => {
    if(!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
        return res.status(400).send();
    }
    req.body.employee.isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`, {
        $name: req.body.employee.name,
        $position: req.body.employee.position,
        $wage: req.body.employee.wage,
        $isCurrentEmployee: req.body.employee.isCurrentEmployee
     }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).send({employee: row});    
            });
        }
    });
});

employeeRouter.param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.employee = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({employee: req.employee});
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    if(!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
        return res.status(400).send();
    }
    req.body.employee.isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id", {
        $name: req.body.employee.name,
        $position: req.body.employee.position,
        $wage: req.body.employee.wage,
        $isCurrentEmployee: req.body.employee.isCurrentEmployee,
        $id: req.employee.id
    }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`, (err, row) => {
                res.status(200).send({employee: row});    
            });
        }
    })
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.employee.id}`, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`, (err, row) => {
                res.status(200).send({employee: row});   
            });
        }
    });
});

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

module.exports = employeeRouter;