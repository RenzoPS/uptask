import { isAxiosError } from "axios";
import type { UpdateCurrentUserPasswordForm, UserProfileForm } from "../types";
import api from "@/lib/axios";

export async function updateProfile(formData: UserProfileForm) {
   try {
      const { data } = await api.put<string>("/auth/profile", formData);
      return data;
   } catch (e) {
      if (isAxiosError(e) && e.response) {
         throw new Error(e.response.data.error);
      }
   }
}

export async function changePassword(formData: UpdateCurrentUserPasswordForm) {
   try {
      const { data } = await api.post<string>(
         "/auth/update-password",
         formData,
      );
      return data;
   } catch (e) {
      if (isAxiosError(e) && e.response) {
         throw new Error(e.response.data.error);
      }
   }
}
