import type { Client } from "@/models/Client";

export interface UserProfileProps {
  client: Client;
}

export function UserProfile({ client }: UserProfileProps) {
  return (
    <div className="user-profile p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-3">Perfil de Usuario</h2>
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Nombre:</span> {client.name}</p>
        <p><span className="font-semibold">Cédula:</span> {client.IdClient}</p>
      </div>
    </div>
  );
}