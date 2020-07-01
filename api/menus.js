const express = require('express');
const menusRouter = express.Router();

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({menus: rows});
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    if(!req.body.menu.title) {
        return res.status(400).send();
    }
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, {$title: req.body.menu.title}, function(err) {
       if(err) {
           next(err);
       } else {
           db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
               res.status(201).send({menu: row});    
           });
       }
   });
});

menusRouter.param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.menu = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).send({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
    if(!req.body.menu.title) {
        return res.status(400).send();
    }
    db.run(`UPDATE Menu SET title = $title WHERE id = $id`, {
        $title: req.body.menu.title,
        $id: req.menu.id
    }, function(err) {
    if(err) {
        next(err);
    } else {
        db.get(`SELECT * FROM Menu WHERE id = $id`, {$id: req.menu.id}, (err, row) => {
            res.status(200).send({menu: row});
        });
    }
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = $id`, {$id: req.menu.id}, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Menu WHERE id = $id`, {$id: req.menu.id}, function(err) {
                if(err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            });
        }
    })
});

const menuItemsRouter = require('./menuItems');
menusRouter.use('/:menuId/menu-items', menuItemsRouter)

module.exports = menusRouter;