const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = $menuId`, {$menuId: req.params.menuId}, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({menuItems: rows});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    if(!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price) {
        return res.status(400).send();
    }
    db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`, {
        $name: req.body.menuItem.name,
        $description: req.body.menuItem.description,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $menuId: req.menu.id
    }, function(err) {
       if(err) {
           next(err);
       } else {
           db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
               res.status(201).send({menuItem: row});    
           });
       }
   });
});

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.menuItem = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    if(!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price) {
        return res.status(400).send();
    }
    db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id`, {
        $name: req.body.menuItem.name,
        $description: req.body.menuItem.description,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $menuId: req.menu.id,
        $id: req.menuItem.id
    }, function(err) {
    if(err) {
        next(err);
    } else {
        db.get(`SELECT * FROM MenuItem WHERE id = $id`, {$id: req.menuItem.id}, (err, row) => {
            res.status(200).send({menuItem: row});
        });
    }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.menuItem.id}`, function(err) {
        if(err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = menuItemsRouter;