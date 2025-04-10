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



      {
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
      },
      {
        title: "Utilisateurs",
        icon: UsersIcon,
        items: [
          {
            title: "Médecins",
            url: "/medecins",
          },
          {
            title: "Patients",
            url: "/patients",
          },
        ],
      },
      {
        title: "Spécialités",
        icon: ClipboardDocumentListIcon,
        items: [],
      },
      {
        title: "Statistiques",
        icon: ChartBarIcon,
        items: [],
      },
      {
        title: "Paramètres",
        icon: Cog6ToothIcon,
        items: [],
      },
    ],
  },
]; 