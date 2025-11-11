import * as fs from 'fs/promises';
import * as path from 'path';
import { Lobby } from '../../../shared/types';

interface PersistedState {
  lobbies: Record<string, Lobby>;
  savedAt: string;
}

export class PersistenceService {
  private filePath: string;

  constructor(filePath: string = './game-state.json') {
    this.filePath = path.resolve(filePath);
  }

  async saveState(lobbies: Map<string, Lobby>): Promise<void> {
    const state: PersistedState = {
      lobbies: Object.fromEntries(lobbies),
      savedAt: new Date().toISOString(),
    };

    try {
      await fs.writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
      console.log(`State saved to ${this.filePath}`);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }

  async loadState(): Promise<Map<string, Lobby>> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const state: PersistedState = JSON.parse(data);
      
      console.log(`State loaded from ${this.filePath} (saved at ${state.savedAt})`);
      
      return new Map(Object.entries(state.lobbies));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('No saved state found');
        return new Map();
      }
      console.error('Failed to load state:', error);
      throw error;
    }
  }

  async getLobby(lobbyId: string): Promise<Lobby | undefined> {
    try {
      const lobbies = await this.loadState();
      return lobbies.get(lobbyId);
    } catch (error) {
      console.error('Failed to get lobby from persisted state:', error);
      return undefined;
    }
  }

  async removeLobby(lobbyId: string): Promise<void> {
    try {
      const lobbies = await this.loadState();
      lobbies.delete(lobbyId);
      await this.saveState(lobbies);
      console.log(`Lobby ${lobbyId} removed from persistence`);
    } catch (error) {
      console.error('Failed to remove lobby from persisted state:', error);
      throw error;
    }
  }
}
