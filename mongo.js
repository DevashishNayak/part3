const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://dn:${password}@cluster0-ajyvf.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    })
    
    person.save().then(result => {
      console.log(`added ${person.name} ${person.number} to phonebook`)
      mongoose.connection.close()
    })
    
}

if (process.argv.length === 3) {
    Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(person => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}