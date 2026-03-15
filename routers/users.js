let express = require('express')
let router = express.Router()
let { genID } = require('../utils/id_handlers')
let { dataUsers, dataRoles } = require('../data')

function findRoleById(id) {
    let result = dataRoles.filter(function (e) {
        return !e.isDeleted && e.id == id
    })
    if (result.length > 0) {
        return result[0]
    }
}

// GET all users
router.get('/api/v1/users', (req, res) => {
    let result = dataUsers.filter(function (e) {
        return !e.isDeleted
    })
    res.send(result)
})

// GET user by ID
router.get('/api/v1/users/:id', (req, res) => {
    let id = req.params.id
    let result = dataUsers.filter(function (e) {
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

// POST - Create new user
router.post('/api/v1/users', (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let role = req.body.role

    if (!username || !password || !email) {
        return res.status(400).send({ message: "username, password, email are required" })
    }
    if (!role) {
        return res.status(400).send({ message: "role is required" })
    }
    if (!findRoleById(role)) {
        return res.status(400).send({ message: "role not found" })
    }

    let usernameExists = dataUsers.some(function (e) {
        return !e.isDeleted && e.username === username
    })
    if (usernameExists) {
        return res.status(400).send({ message: "username must be unique" })
    }

    let emailExists = dataUsers.some(function (e) {
        return !e.isDeleted && e.email === email
    })
    if (emailExists) {
        return res.status(400).send({ message: "email must be unique" })
    }

    let loginCount = req.body.loginCount !== undefined ? Number.parseInt(req.body.loginCount) : 0
    if (Number.isNaN(loginCount) || loginCount < 0) {
        loginCount = 0
    }

    let newItem = {
        id: genID(dataUsers),
        username: username,
        password: password,
        email: email,
        fullName: req.body.fullName ? req.body.fullName : "",
        avatarUrl: req.body.avatarUrl ? req.body.avatarUrl : "https://i.sstatic.net/l60Hf.png",
        status: req.body.status === true,
        role: role,
        loginCount: loginCount,
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    }
    dataUsers.push(newItem)
    res.send(newItem)
})

// PUT - Update user
router.put('/api/v1/users/:id', (req, res) => {
    let id = req.params.id
    let getUser = dataUsers.filter(function (e) {
        return e.id == id && !e.isDeleted
    })
    if (getUser.length > 0) {
        getUser = getUser[0]

        if (req.body.username && req.body.username !== getUser.username) {
            let usernameExists = dataUsers.some(function (e) {
                return !e.isDeleted && e.username === req.body.username
            })
            if (usernameExists) {
                return res.status(400).send({ message: "username must be unique" })
            }
        }

        if (req.body.email && req.body.email !== getUser.email) {
            let emailExists = dataUsers.some(function (e) {
                return !e.isDeleted && e.email === req.body.email
            })
            if (emailExists) {
                return res.status(400).send({ message: "email must be unique" })
            }
        }

        if (req.body.role && !findRoleById(req.body.role)) {
            return res.status(400).send({ message: "role not found" })
        }

        let keys = Object.keys(req.body)
        for (const key of keys) {
            if (key !== 'id' && key !== 'creationAt' && getUser[key] !== undefined) {
                if (key === 'loginCount') {
                    let v = Number.parseInt(req.body.loginCount)
                    if (!Number.isNaN(v) && v >= 0) {
                        getUser[key] = v
                    }
                } else {
                    getUser[key] = req.body[key]
                }
            }
        }
        getUser.updatedAt = new Date(Date.now())
        res.send(getUser)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

// DELETE - Soft delete user
router.delete('/api/v1/users/:id', (req, res) => {
    let id = req.params.id
    let getUser = dataUsers.filter(function (e) {
        return e.id == id && !e.isDeleted
    })
    if (getUser.length > 0) {
        getUser = getUser[0]
        getUser.isDeleted = true
        getUser.updatedAt = new Date(Date.now())
        res.send(getUser)
    } else {
        res.status(404).send({
            message: "ID not found"
        })
    }
})

// POST - Enable user by email + username
router.post('/api/v1/enable', (req, res) => {
    let email = req.body.email
    let username = req.body.username
    if (!email || !username) {
        return res.status(400).send({ message: "email and username are required" })
    }
    let getUser = dataUsers.filter(function (e) {
        return !e.isDeleted && e.email === email && e.username === username
    })
    if (getUser.length > 0) {
        getUser = getUser[0]
        getUser.status = true
        getUser.updatedAt = new Date(Date.now())
        res.send(getUser)
    } else {
        res.status(404).send({ message: "user not found" })
    }
})

// POST - Disable user by email + username
router.post('/api/v1/disable', (req, res) => {
    let email = req.body.email
    let username = req.body.username
    if (!email || !username) {
        return res.status(400).send({ message: "email and username are required" })
    }
    let getUser = dataUsers.filter(function (e) {
        return !e.isDeleted && e.email === email && e.username === username
    })
    if (getUser.length > 0) {
        getUser = getUser[0]
        getUser.status = false
        getUser.updatedAt = new Date(Date.now())
        res.send(getUser)
    } else {
        res.status(404).send({ message: "user not found" })
    }
})

module.exports = router
