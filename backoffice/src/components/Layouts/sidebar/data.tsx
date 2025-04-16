import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  CreditCardIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Pencil,Trash2,CheckCircle, AlertCircle  } from "lucide-react";
import { FourCircle } from "./icons";

import * as Icons from "./icons";


export const NAV_DATA = [
  {
    label: "Menu Principal",
    items: [
      {
        title: "Tableau de bord",
        icon: HomeIcon,
        items: [],
      },



      


      {
        title: "Rooms",
        url: "/rooms",
        icon: HomeIcon,
        items: [],
      },

      {
        title: "Hospital Beds",
        url: "/beds",
        icon: FourCircle,
        items: [],
      },



    /*  {
        title: "Téléconsultation",
        icon: VideoCameraIcon,
        items: [
          {
            title: "Consultations",
            url: "/teleconsultation",
          },
          {
            title: "Rendez-vous",
            url: "/rendez-vous",
          },
          {
            title: "Paiements",
            url: "/paiements",
          },
        ],
      },*/


     
    
     


      {
        title: "doctors",
        icon: Icons.User,
        items: [
          {
            title: "List doctors",
            url: "/doctors",
          },
          {
            title: "add doctor",
            url: "/add-doctor",
          },
        ],
      },

      {
        title: "Specialities",
        icon: Icons.Table,
        items: [
          {
            title: "list specialities",
            url: "/specialities",
          },
          {
            title: "add speciality",
            url: "/add-speciality",
          },
        ],
      },


      {
        title: "Patients",
        url: "/patients",
        icon: Icons.User,
        items: [],
      },






    ],
  },
]; 