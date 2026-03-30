import Tabs from "@/components/profile/Tabs";
import React from "react";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
   return (
      <>
         <Tabs />
         <Outlet />
      </>
   );
}
