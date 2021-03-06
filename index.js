require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('data', function getData (request) {
    return JSON.stringify(request.body)
})

const app = express()
const logger = morgan(':method :url :status :res[content-length] - :response-time ms :data')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(logger)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

let length = 0

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        length = persons.length
        const date = new Date()
        response.send(`
        <p>Phonebook has info for ${length} people</p>
        <p>${date}</p>
        `)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(() => {
        response.status(204).end()
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true }).then(updatedPerson => {
        response.json(updatedPerson)
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})