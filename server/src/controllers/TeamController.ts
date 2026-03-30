import { Request, Response } from "express";
import User from "../models/Auth";
import Project from "../models/Project";

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("_id name email");
    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }
    res.json(user);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;
    const user = await User.findById(id).select("id");
    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }
    if (
      req.project.team.some(
        (member) => member?.toString() === user._id.toString(),
      )
    ) {
      const error = new Error("El usuario ya existe en el proyecto");
      return res.status(409).json({ error: error.message });
    }
    req.project.team.push(user._id);
    await req.project.save();
    res.send("Usuario agregado correctamente");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const isMember = req.project.team.some(
      (member) => member?.toString() === userId,
    );
    if (!isMember) {
      const error = new Error("El usuario no existe en el proyecto");
      return res.status(404).json({ error: error.message });
    }

    req.project.team = req.project.team.filter(
      (member) => member?.toString() !== userId,
    );
    await req.project.save();
    res.send("Usuario eliminado correctamente");
  };
  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project._id).populate({
      path: "team",
      select: "_id name email",
    });
    res.json(project!.team);
  };
}
