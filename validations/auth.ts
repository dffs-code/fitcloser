import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(1, { message: "Informe sua senha." })
});

const strongPassword = z
  .string()
  .min(8, { message: "Mínimo de 8 caracteres." })
  .regex(/[A-Z]/, { message: "Pelo menos uma letra maiúscula." })
  .regex(/[a-z]/, { message: "Pelo menos uma letra minúscula." })
  .regex(/[0-9]/, { message: "Pelo menos um número." })
  .regex(/[^A-Za-z0-9]/, { message: "Pelo menos um caractere especial." });

export const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: "Informe seu nome completo." }),
    email: z.string().email({ message: "Informe um e-mail válido." }),
    password: strongPassword,
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"]
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." })
});
