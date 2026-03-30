import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middlewares/project";
import {
   hasAuthorization,
   taskBelongsToProject,
   taskExists,
} from "../middlewares/task";
import { authenticate } from "../middlewares/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router: Router = Router();

router.param("id", projectExists);
router.use(authenticate);

router.post(
   "/",
   body("name").notEmpty().withMessage("El nombre del projecto es obligatorio"),
   body("clientName")
      .notEmpty()
      .withMessage("El nombre del cliente es obligatorio"),
   body("description")
      .notEmpty()
      .withMessage("La descripcion del projecto es obligatoria"),
   handleInputErrors,
   ProjectController.createProject,
);

router.get("/", ProjectController.getAllProjects);
router.get(
   "/:id",
   param("id").isMongoId().withMessage("Id no valido"),
   handleInputErrors,
   ProjectController.getProjectById,
);

router.param("projectId", projectExists);

router.put(
   "/:projectId",
   param("projectId").isMongoId().withMessage("Id no valido"),
   body("name").notEmpty().withMessage("El nombre del projecto es obligatorio"),
   body("clientName")
      .notEmpty()
      .withMessage("El nombre del cliente es obligatorio"),
   body("description")
      .notEmpty()
      .withMessage("La descripcion del projecto es obligatoria"),
   handleInputErrors,
   hasAuthorization,
   ProjectController.updateProject,
);

router.delete(
   "/:projectId",
   param("projectId").isMongoId().withMessage("Id no valido"),
   handleInputErrors,
   hasAuthorization,
   ProjectController.deleteProject,
);

// --- ROUTES FOR TASKS --
router.param("taskId", taskExists);
router.param("taskId", taskBelongsToProject);

router.post(
   "/:projectId/tasks",
   hasAuthorization,
   body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
   body("description").notEmpty().withMessage("La descripcion es obligatoria"),
   handleInputErrors,
   TaskController.createTask,
);

router.get("/:projectId/tasks", TaskController.getProjectTasks);

router.get(
   "/:projectId/tasks/:taskId",
   param("taskId").isMongoId().withMessage("ID no valido"),
   handleInputErrors,
   TaskController.getTaskById,
);

router.put(
   "/:projectId/tasks/:taskId",
   hasAuthorization,
   param("taskId").isMongoId().withMessage("ID no valido"),
   body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
   body("description").notEmpty().withMessage("La descripcion es obligatoria"),
   handleInputErrors,
   TaskController.updateTask,
);

router.delete(
   "/:projectId/tasks/:taskId",
   hasAuthorization,
   param("taskId").isMongoId().withMessage("ID no valido"),
   handleInputErrors,
   TaskController.deleteTask,
);

router.post(
   "/:projectId/tasks/:taskId/status",
   param("taskId").isMongoId().withMessage("ID no valido"),
   body("status").notEmpty().withMessage("El estado no es valido"),
   handleInputErrors,
   TaskController.updateStatus,
);

// Routes for Teams
router.post(
   "/:projectId/team/find",
   body("email").isEmail().toLowerCase().withMessage("Email no valido"),
   handleInputErrors,
   TeamMemberController.findMemberByEmail,
);

router.get("/:projectId/team", TeamMemberController.getProjectTeam);

router.post(
   "/:projectId/team",
   body("id").isMongoId().withMessage("Id no valido"),
   handleInputErrors,
   TeamMemberController.addMemberById,
);

router.delete(
   "/:projectId/team/:userId",
   param("userId").isMongoId().withMessage("ID no valido"),
   handleInputErrors,
   TeamMemberController.removeMemberById,
);

// Routes for Note
router.post(
   "/:projectId/tasks/:taskId/notes",
   body("content").notEmpty().withMessage("El contenido es obligatorio"),
   handleInputErrors,
   NoteController.createNote,
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);
router.delete(
   "/:projectId/tasks/:taskId/notes/:noteId",
   param("noteId").isMongoId().withMessage("El id no es valido"),
   NoteController.deleteNote,
);
export default router;
