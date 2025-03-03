"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  twoFactorAuth: z.boolean(),
  maxLoginAttempts: z.string().regex(/^\d+$/).transform(Number),
  passwordExpiration: z.string().regex(/^\d+$/).transform(Number),
  requireStrongPassword: z.boolean(),
});

export function SecuritySettings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      twoFactorAuth: false,
      maxLoginAttempts: 3,
      passwordExpiration: 90,
      requireStrongPassword: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="twoFactorAuth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Authentification à deux facteurs
                </FormLabel>
                <FormDescription>
                  Activer l&apos;authentification 2FA pour plus de sécurité
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxLoginAttempts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tentatives de connexion maximum</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requireStrongPassword"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Mots de passe forts requis
                </FormLabel>
                <FormDescription>
                  Exiger des mots de passe complexes
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Enregistrer les paramètres de sécurité</Button>
      </form>
    </Form>
  );
}
