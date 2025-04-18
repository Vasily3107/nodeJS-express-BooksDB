const mongoose = require('mongoose');
const express = require('express');

const bookSchema = new mongoose.Schema({
        title: String,
       author: String,
    available: {type:Boolean, default:true}
});
const Book = mongoose.model('Book', bookSchema);

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://admin:admin@cluster0.5ivypqw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).send(books);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book)
            return res.status(404).send('book not found');
        res.status(200).send(book);
    }
    catch (err) {
        if (err instanceof mongoose.Error.CastError)
            res.status(400).send('invalid ID format');
        else
            res.status(500).send(err.message);
    }
});

app.post('/books', async (req, res) => {
    try {
        const { title, author, available } = req.body;

        if (!title)
            return res.status(400).send('Required parameter "title" was omitted');
        if (!author)
            return res.status(400).send('Required parameter "author" was omitted');

        const book = new Book({ title, author, available: available == undefined ? true : available });
        await book.save();
        res.status(201).json(book);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/books/:id', async (req, res) => {
    try {
        const { title, author, available } = req.body;
        const updateData = {};

        if (    title)              updateData.title     = title;
        if (   author)              updateData.author    = author;
        if (available != undefined) updateData.available = available;

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!book)
            return res.status(404).send('Book not found');
        res.status(200).send(book);
    }
    catch (err) {
        if (err instanceof mongoose.Error.CastError)
            res.status(400).send('invalid ID format');
        else
            res.status(500).send(err.message);
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book)
            return res.status(404).send('book not found');
        res.status(204).send();
    }
    catch (err) {
        if (err instanceof mongoose.Error.CastError)
            res.status(400).send('invalid ID format');
        else
            res.status(500).send(err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// http://127.0.0.1:3000/
