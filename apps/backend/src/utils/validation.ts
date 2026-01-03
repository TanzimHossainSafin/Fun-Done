import {z} from 'zod';
export const registerSchema=z.object({
    username:z.string()
     .min(3,"Username must be at least 3 characters")
     .max(20,"Username must be at most 20 characters")
     .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email:z.string()
     .email({ message: "Invalid email format" }),
    password:z.string()
     .min(6,"Minimum length of pasword is at least 6 lenght")
     .regex(/^[a-zA-Z0-9_]+$/, "Password can only contain letters, numbers, and underscores")
});