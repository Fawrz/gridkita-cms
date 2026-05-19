import type { User } from "@/types";

export const users: User[] = [
  {
    id: "u_admin",
    email: "admin@gridkita.id",
    name: "Firta Aulia",
    role: "ADMIN",
    phone: "081200000001",
    avatarUrl: "https://i.pravatar.cc/120?img=47",
    isActive: true,
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "u_designer1",
    email: "wahyu@gridkita.id",
    name: "Wahyu Pratama",
    role: "DESIGNER",
    phone: "081200000002",
    bankAccount: "BCA 1234567890 a.n. Wahyu Pratama",
    avatarUrl: "https://i.pravatar.cc/120?img=12",
    isActive: true,
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "u_designer2",
    email: "raffi@gridkita.id",
    name: "Raffi Hidayat",
    role: "DESIGNER",
    phone: "081200000003",
    bankAccount: "Mandiri 9876543210 a.n. Raffi Hidayat",
    avatarUrl: "https://i.pravatar.cc/120?img=33",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "u_designer3",
    email: "nabil@gridkita.id",
    name: "Nabil Akbar",
    role: "DESIGNER",
    phone: "081200000004",
    bankAccount: "BNI 5556667778 a.n. Nabil Akbar",
    avatarUrl: "https://i.pravatar.cc/120?img=14",
    isActive: false,
    createdAt: "2026-01-12T08:00:00Z",
  },
  {
    id: "u_client1",
    email: "rifat@example.com",
    name: "Rifat Setiawan",
    role: "CLIENT",
    phone: "081299999991",
    avatarUrl: "https://i.pravatar.cc/120?img=68",
    isActive: true,
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "u_client2",
    email: "amelia@example.com",
    name: "Amelia Putri",
    role: "CLIENT",
    phone: "081299999992",
    avatarUrl: "https://i.pravatar.cc/120?img=45",
    isActive: true,
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "u_client3",
    email: "budi@example.com",
    name: "Budi Santoso",
    role: "CLIENT",
    phone: "081299999993",
    avatarUrl: "https://i.pravatar.cc/120?img=52",
    isActive: true,
    createdAt: "2026-03-01T09:00:00Z",
  },
];

export function userById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function designers(): User[] {
  return users.filter((u) => u.role === "DESIGNER");
}

export function activeDesigners(): User[] {
  return designers().filter((u) => u.isActive);
}
