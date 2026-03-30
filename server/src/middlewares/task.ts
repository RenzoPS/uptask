import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
   namespace Express {
      interface Request {
         task: ITask;
      }
   }
}

export const taskExists = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   try {
      const { taskId } = req.params;
      const task = await Task.findById(taskId);
      if (!task) {
         return res.status(404).json({ error: "Tarea no encontrada" });
      }
      req.task = task;
      next();
   } catch (e) {
      res.status(500).json({ error: "Error al buscar la tarea" });
   }
};

export const taskBelongsToProject = (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   try {
      if (!req.task.project.equals(req.project._id)) {
         const error = new Error("La tarea no pertenece a este proyecto");
         return res.status(403).json({ error: error.message });
      }
      next();
   } catch (e) {
      res.status(500).json({ error: "Error al verificar la tarea" });
   }
};

export const hasAuthorization = (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   try {
      if (
         req.project.manager &&
         req.user._id.toString() !== req.project.manager.toString()
      ) {
         const error = new Error("Accion no valida");
         return res.status(400).json({ error: error.message });
      }
      next();
   } catch (e) {
      res.status(500).json({ error: "Error al verificar la tarea" });
   }
};
