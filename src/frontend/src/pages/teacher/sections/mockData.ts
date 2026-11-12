import type { UserProfile } from "../../../types";
import { UserRole } from "../../../types";

export const MOCK_STUDENTS: UserProfile[] = [
  {
    id: "mock-s1",
    name: "Arjun Sharma",
    email: "arjun.sharma@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
  {
    id: "mock-s2",
    name: "Priya Patel",
    email: "priya.patel@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
  {
    id: "mock-s3",
    name: "Rahul Kumar",
    email: "rahul.kumar@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
  {
    id: "mock-s4",
    name: "Sneha Iyer",
    email: "sneha.iyer@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
  {
    id: "mock-s5",
    name: "Dev Mehta",
    email: "dev.mehta@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
  {
    id: "mock-s6",
    name: "Anjali Singh",
    email: "anjali.singh@edu.ac.in",
    role: UserRole.student,
    createdAt: BigInt(0),
  },
];
