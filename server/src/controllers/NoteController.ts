import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
   noteId: Types.ObjectId;
};

export class NoteController {
   static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
      const { content } = req.body;
      const note = new Note();
      note.content = content;
      note.createdBy = req.user._id;
      note.task = req.task._id;
      req.task.notes.push(note._id);
      try {
         await Promise.allSettled([req.task.save(), note.save()]);
         return res.send("Nota creada correctamente");
      } catch (e) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };
   static getTaskNotes = async (req: Request, res: Response) => {
      try {
         const notes = await Note.find({ task: req.task._id });
         res.json(notes);
      } catch (e) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };
   static deleteNote = async (req: Request<NoteParams>, res: Response) => {
      const { noteId } = req.params;
      try {
         const note = await Note.findById(noteId);
         if (!note) {
            const error = new Error("Nota no encontrada");
            return res.status(404).json({ error: error.message });
         }
         if (note.createdBy.toString() !== req.user._id.toString()) {
            const error = new Error("Accion no valida");
            return res.status(401).json({ error: error.message });
         }

         req.task.notes = req.task.notes.filter(
            (note) => note.toString() !== noteId.toString(),
         );

         await Promise.allSettled([req.task.save(), note.deleteOne()]);
         res.send("Nota eliminada");
      } catch (e) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };
}
