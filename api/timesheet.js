const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = $employeeId`, {$employeeId: req.params.employeeId}, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({timesheets: rows});
        }
    });
});

timesheetRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.timesheet = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    if(!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        return res.status(400).send();
    }
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`, {
        $hours: req.body.timesheet.hours,
        $rate: req.body.timesheet.rate,
        $date: req.body.timesheet.date,
        $employeeId: req.employee.id
    }, function(err) {
       if(err) {
           next(err);
       } else {
           db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
               res.status(201).send({timesheet: row});    
           });
       }
   });
});


timesheetRouter.put('/:timesheetId', (req, res, next) => {
    if(!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        return res.status(400).send();
    }
    db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id`, {
        $hours: req.body.timesheet.hours,
        $rate: req.body.timesheet.rate,
        $date: req.body.timesheet.date,
        $employeeId: req.employee.id,
        $id: req.timesheet.id
    }, function(err) {
    if(err) {
        next(err);
    } else {
        db.get(`SELECT * FROM Timesheet WHERE id = $id`, {$id: req.timesheet.id}, (err, row) => {
            res.status(200).send({timesheet: row});
        });
    }
    });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.timesheet.id}`, function(err) {
        if(err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = timesheetRouter;