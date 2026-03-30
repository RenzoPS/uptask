import type { Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    project.manager = req.user._id;

    try {
      await project.save();
      res.send("Projecto creado correctamente");
    } catch (e) {
      console.log(e);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: [req.user._id] } },
          { team: { $in: [req.user._id] } },
        ],
      });
      res.json(projects);
    } catch (e) {
      console.log(e);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    try {
      await req.project.populate({
        path: "tasks",
        select: "_id name description status",
      });
      await req.project.populate({ path: "team", select: "_id" });

      const isAllowed = await Project.exists({
        _id: req.project._id,
        $or: [{ manager: req.user._id }, { team: req.user._id }],
      });

      if (!isAllowed) {
        const error = new Error("Accion no valida");
        return res.status(401).json({ error: error.message });
      }
      res.json(req.project);
    } catch (e) {
      console.log(e);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.name = req.body.name;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;
      await req.project.save();
      res.json(req.project);
    } catch (e) {
      console.log(e);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.status(200).send("Projecto eliminado");
    } catch (e) {
      console.log(e);
    }
  };
}
