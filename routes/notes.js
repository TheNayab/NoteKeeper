const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');
const react = require('react');


//Rout 1 ................... get all the notes
router.get('/fetchallnotes', fetchuser, async(req, res) => {
        try {
            const notes = await Notes.find({ user: req.user.id })
            res.json(notes)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occur");
        }
    })
    //Route 2 .................................  add all notes
router.post('/addallnotes', fetchuser, [
        body('title', "Enter a valid title").isLength({ min: 5 }),
        body('description', "Enter  a valid description").isLength({ min: 5 }),
    ], async(req, res) => {
        try {



            const { title, description, tag } = req.body;

            //give error if any and also gave status 400 to user
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Notes({
                title,
                description,
                tag,
                user: req.user.id
            })
            const saveNote = await note.save()
            res.json(saveNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occur");
        }
    })
    // Rote 3 .......................update notes
router.put('/updatenotes/:id', fetchuser, async(req, res) => {
    const { title, description, tag } = req.body;
    try{
    //    create a newNote object 
    const newNote = {};
    if (title) { newNote.title = title }
    if (description) { newNote.description = description }
    if (tag) { newNote.tag = tag }

    // find to be updated and update it
    let note = await Notes.findById(req.params.id)
    if (!note) { return res.status(404).send("Not Found") }
                       
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.json({ note })
} catch (error) {
    console.error(error.message);
    res.status(500).send("some error occur");
}

})


    // Rote 4 ...................... delete notes
router.delete('/deletenotes/:id', fetchuser, async(req, res) => {
try {
    // find to be updated and update it
    let note = await Notes.findById(req.params.id)
    if (!note) { return res.status(404).send("Not Found") }
    // Allow to delete only if user has its own note
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({ "success ":"Note has been deleted" })
 } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occur");
    }
})


module.exports = router;