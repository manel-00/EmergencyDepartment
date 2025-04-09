// ✅ MODIFIED VERSION to load user info into the form with controlled fields

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function PersonalInfoForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/user/session", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });

        if (response.data.status === "SUCCESS") {
          const user = response.data.user;
          if (user.role !== "admin") {
            alert("⛔ Accès refusé.");
            router.push("http://localhost:3001");
            return;
          }

          setFirstName(user.name || "");
          setLastName(user.lastname || "");
          setEmail(user.email || "");
          setUserId(user._id); // ✅ C’est la vraie clé Mongo
          console.log("🧠 Données utilisateur :", user);

        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("❌ Erreur session:", error);
        router.push("/signin");
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await axios.put(
        `http://localhost:3000/user/update/${userId}`,
        {
          name: firstName,
          lastname: lastName,
        },
        {
          withCredentials: true,
        }
      );
      alert("✅ Informations mises à jour !");
    } catch (err) {
      console.error("❌ Erreur update :", err);
      alert("❌ Échec de la mise à jour.");
    }
  };

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <InputGroup
              className="w-full"
              type="text"
              name="firstName"
              label="First Name"
              placeholder="First Name"
              value={firstName}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              onInput={(e) => setFirstName((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <InputGroup
              className="w-full"
              type="text"
              name="lastName"
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              onInput={(e) => setLastName((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div className="mb-5.5">
          <InputGroup
            className="w-full"
            type="email"
            name="email"
            label="Email"
            placeholder="Email"
            value={email}
            icon={<EmailIcon />}
            iconPosition="left"
            height="sm"
            disabled
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}