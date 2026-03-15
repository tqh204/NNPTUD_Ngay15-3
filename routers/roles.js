let express = require('express')
let router = express.Router()
let { genID } = require('../utils/id_handlers')
let { dataRoles, dataUsers } = require('../data')

// GET all roles
router.get('/api/v1/roles', (req, res) => {
    let result = dataRoles.filter(function (e) {
        return !e.isDeleted
    })
    res.send(result)
})

// GET role by ID
router.get('/api/v1/roles/:id', (req, res) => {
    let id = req.params.id
    let result = dataRoles.filter(function (e) {
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

// GET users by role ID
router.get('/api/v1/roles/:id/users', (req, res) => {
    let id = req.params.id
    let getRole = dataRoles.filter(function (e) {
        return !e.isDeleted && e.id == id
    })
    if (getRole.length > 0) {
        let result = dataUsers.filter(function (u) {
            return !u.isDeleted && u.role == id
        })
        res.send(result)
    } else {
        res.status(404).send({
            message: "Role ID not found"
        })
    }
})

// POST - Create new role
router.post('/api/v1/roles', (req, res) => {
    let name = req.body.name
    if (!name) {
        return res.status(400).send({ message: "name is required" })
    }
    let exists = dataRoles.some(function (e) {
        return !e.isDeleted && e.name === name
    })
    if (exists) {
        return res.status(400).send({ message: "name must be unique" })
    }
    let newItem = {
        id: genID(dataRoles),
        name: name,
        description: req.body.description ? req.body.description : "",
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    }
    dataRoles.push(newItem)
    res.send(newItem)
})

// PUT - Update role
router.put('/api/v1/roles/:id', (req, res) => {
    let id = req.params.id
    let getRole = dataRoles.filter(function (e) {
        return e.id == id && !e.isDeleted
    })
    if (getRole.length > 0) {
        getRole = getRole[0]
        if (req.body.name && req.body.name !== getRole.name) {
            let exists = dataRoles.some(function (e) {
                return !e.isDeleted && e.name === req.body.name
            })
            if (exists) {
                return res.status(400).send({ message: "name must be unique" })
            }
        }
        let keys = Object.keys(req.body)
        for (const key of keys) {
            if (key !== 'id' && key !== 'creationAt' && getRole[key] !== undefined) {
                getRole[key] = req.body[key]
            }
        }
        getRole.updatedAt = new Date(Date.now())
        res.send(getRole)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

// DELETE - Soft delete role
router.delete('/api/v1/roles/:id', (req, res) => {
    let id = req.params.id
    let getRole = dataRoles.filter(function (e) {
        return e.id == id && !e.isDeleted
    })
    if (getRole.length > 0) {
        getRole = getRole[0]
        getRole.isDeleted = true
        getRole.updatedAt = new Date(Date.now())
        res.send(getRole)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

module.exports = router
