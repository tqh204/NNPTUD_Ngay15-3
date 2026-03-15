let express = require('express')
let router = express.Router()
let slugify = require('slugify')
let { genID } = require('../utils/id_handlers')
let { dataCategories, dataProducts } = require('../data')

// GET all categories
router.get('/api/v1/categories', (req, res) => {
    let result = dataCategories.filter(function (e) {
        return !e.isDeleted
    })
    res.send(result)
})

// GET category by ID
router.get('/api/v1/categories/:id', (req, res) => {
    let id = req.params.id;
    let result = dataCategories.filter(function (e) {
        return !e.isDeleted && e.id == id
    })
    if (result.length > 0) {
        res.send(result[0])
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        })
    }
})

// GET products by category ID
router.get('/api/v1/categories/:id/products', (req, res) => {
    let id = req.params.id;
    let getCategory = dataCategories.filter(
        function (e) {
            return e.id == id && !e.isDeleted
        }
    )
    if (getCategory.length > 0) {
        let result = dataProducts.filter(
            function (e) {
                return !e.isDeleted && e.category.id == id
            }
        )
        res.send(result);
    } else {
        res.status(404).send({
            message: "Category ID not found"
        })
    }
})

// POST - Create new category
router.post('/api/v1/categories', (req, res) => {
    let newItem = {
        id: genID(dataCategories),
        name: req.body.name,
        slug: slugify(req.body.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
        }),
        image: req.body.image,
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    }
    dataCategories.push(newItem);
    res.send(newItem)
})

// PUT - Update category
router.put('/api/v1/categories/:id', (req, res) => {
    let id = req.params.id;
    let getCategory = dataCategories.filter(
        function (e) {
            return e.id == id && !e.isDeleted
        }
    )
    if (getCategory.length > 0) {
        getCategory = getCategory[0]
        let keys = Object.keys(req.body);
        for (const key of keys) {
            if (key !== 'id' && key !== 'creationAt' && getCategory[key]) {
                if (key === 'name') {
                    getCategory.slug = slugify(req.body.name, {
                        replacement: '-',
                        remove: undefined,
                        lower: true,
                    })
                }
                getCategory[key] = req.body[key]
            }
        }
        getCategory.updatedAt = new Date(Date.now())
        res.send(getCategory)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

// DELETE - Soft delete category
router.delete('/api/v1/categories/:id', (req, res) => {
    let id = req.params.id;
    let getCategory = dataCategories.filter(
        function (e) {
            return e.id == id && !e.isDeleted
        }
    )
    if (getCategory.length > 0) {
        getCategory = getCategory[0]
        getCategory.isDeleted = true;
        getCategory.updatedAt = new Date(Date.now())
        res.send(getCategory)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

module.exports = router;
