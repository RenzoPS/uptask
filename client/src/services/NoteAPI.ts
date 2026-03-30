import { isAxiosError } from "axios";
import type { Note, NoteFormData, Project, Task } from "../types";
import api from "@/lib/axios";

type NoteApiType = {
   formData: NoteFormData;
   projectId: Project["_id"];
   taskId: Task["_id"];
   noteId: Note["_id"];
};

export async function createNote({
   projectId,
   taskId,
   formData,
}: Pick<NoteApiType, "projectId" | "taskId" | "formData">) {
   try {
      const url = `/projects/${projectId}/tasks/${taskId}/notes`;
      const { data } = await api.post<string>(url, formData);
      return data;
   } catch (e) {
      if (isAxiosError(e) && e.response) {
         throw new Error(e.response.data.error);
      }
   }
}

export async function deleteNote({
   projectId,
   taskId,
   noteId,
}: Pick<NoteApiType, "projectId" | "taskId" | "noteId">) {
   try {
      const url = `/projects/${projectId}/tasks/${taskId}/notes/${noteId}`;
      const { data } = await api.delete<string>(url);
      return data;
   } catch (e) {
      if (isAxiosError(e) && e.response) {
         throw new Error(e.response.data.error);
      }
   }
}
