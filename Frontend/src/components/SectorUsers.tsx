import { useState, useEffect } from 'react';
import sectorService from '../services/Sector/api';
import type { SectorUser } from '../services/core-api';

interface SectorUsersProps {
  sectorId: number;
}

const SectorUsers = ({ sectorId }: SectorUsersProps) => {
  const [users, setUsers] = useState<SectorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorId) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sectorService.getSectorUsers(sectorId);
        setUsers(response.data.data);
      } catch (err) {
        console.error("Falha ao buscar usuários do setor:", err);
        setError("Não foi possível carregar os usuários.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [sectorId]); 

  if (isLoading) {
    return <p>Carregando usuários...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (users.length === 0) {
    return <p>Nenhum usuário encontrado neste setor.</p>;
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Usuário</th>
            <th style={{ padding: '8px' }}>Email</th>
            <th style={{ padding: '8px' }}>Função</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px' }}>{user.user_name}</td>
              <td style={{ padding: '8px' }}>{user.user_email}</td>
              <td style={{ padding: '8px' }}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectorUsers;