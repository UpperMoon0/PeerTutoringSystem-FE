import { z } from "zod";

// --- Login Schema ---
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
export type LoginFormValues = z.infer<typeof loginSchema>;


// --- Student Register Schema ---
export const studentRegisterSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  birthdate: z.date({ required_error: "Birthdate is required" }),
  gender: z.string().min(1, "Gender is required"),
  hometown: z.string().min(1, "Hometown is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type StudentRegisterFormValues = z.infer<typeof studentRegisterSchema>;