import * as Icons from "../icons";
export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
     
      
      {
        title: "Patients",
        url: "/patients",
        icon: Icons.User,
        items: [],
      },
      {       
         title: "Rooms",
        url: "/rooms",
        icon: Icons.User,
        items: [],
      },  
      {
        title: "Rooms",
        url: "/rooms",
        icon: Icons.HomeIcon,
        items: [],
      },

      {
        title: "Hospital Beds",
        url: "/beds",
        icon: Icons.FourCircle,
        items: [],
      },
      
      {
        title: "New room",
        url: "/newroom",
        icon: Icons.User,
        items: [],
      },
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
     
    ],
  }
  
  
];
