import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter ao menos 6 caracteres." })
});

export const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Informe seu nome completo." }),
  email: z.string().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter ao menos 6 caracteres." })
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." })
});
