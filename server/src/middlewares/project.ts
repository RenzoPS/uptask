import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

declare global {
   namespace Express {
      interface Request {
         project: IProject;
      }
   }
}

export const projectExists = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   try {
      const projectId = req.params.id ?? req.params.projectId;
      const project = await Project.findById(projectId);
      if (!project) {
         const error = new Error("Projecto no encontrado");
         return res.status(404).json({ error: error.message });
      }
      req.project = project;
      next();
   } catch (e) {
      res.status(500).json({ e: "Hubo un error" });
   }
};
