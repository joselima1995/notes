require("dotenv").config();
const express = require('express')
// const cors = require('cors')
const app = express()
// app.use(cors())

app.use(express.json())
app.use(express.static('dist'))



 
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

 
const mongoose = require("mongoose");
 
mongoose.connect(process.env.MONGO_CLIENT).then(()=>{
  console.log("connection with mongo established"); 
}).catch(error => {
  console.log('error connecting to MongoDB:', error.message)
});
 
const Note = require('./models/note')

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', async (request, response, next) => {
  try {
    const notes = await Note.find({});
    if(notes)
      response.json(notes)
    else throw new Error("no notes found");
  } catch (error) {
    next(error);
  }
   
})

app.get('/api/notes/:id', async (request, response, next) => {
  const id = request.params.id;
  try {
    const note = await Note.findById(id);
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(next(error))
    // response.status(400).send({ error: 'malformatted id' })
  }
  
})

app.put('/api/notes/:id', async (request, response, next) => {
  const id = request.params.id
  console.log("id: " + id);
  try {
    const note = await Note.findByIdAndUpdate(id, request.body, { new: true });
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    } 
  } catch (error) {
    next(error)
  }
  
})

app.post('/api/notes', async (request, response, next) => {
  const body = request.body

  // if (!body.content) { //added to global checking
  //   return response.status(400).json({ 
  //     error: 'content missing' 
  //   })
  // }

  const note = new Note({
    content: body.content,
    important: body.important || false
  })
  try {
    const savedNote = await note.save();
    if(savedNote)
      response.json(note)
    else throw new Error("Error saving new note");
  } catch (error) {
    next(error)
  }
  
})
 

app.delete('/api/notes/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const deletedNote = await Note.findByIdAndDelete(id); 
    response.status(204).end()
  } catch (error) {
    next(error);
  }
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


// let notes = [
//   {
//     id: "1",
//     content: "HTML is easy",
//     important: true
//   },
//   {
//     id: "2",
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: "3",
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true
//   }
// ]