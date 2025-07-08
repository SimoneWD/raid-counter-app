import React, { useState, useEffect } from 'react'; // Assicurati di avere useEffect qui
import { Plus, Trash2, Edit, Save, X, Calendar, Users, Gem } from 'lucide-react';

const ShardTracker = () => {
  // Stato per la gestione dei giocatori, delle loro schegge e della modalità di modifica
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editName, setEditName] = useState('');
  const [playerToDelete, setPlayerToDelete] = useState(null);

  // Stato per la gestione dei campioni leggendari
  const [legendaryChampions, setLegendaryChampions] = useState([]);
  const [showLegendaryForm, setShowLegendaryForm] = useState(false);
  const [newLegendary, setNewLegendary] = useState({
    name: '',
    type: 'normal',
    shardType: 'ancient',
    date: new Date().toISOString().split('T')[0],
    player: ''
  });
  const [legendaryToDelete, setLegendaryToDelete] = useState(null);

  // Carica i dati dal database all'avvio dell'applicazione
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersResponse = await fetch('/.netlify/functions/getPlayers');
        const playersData = await playersResponse.json();
        setPlayers(playersData);

        const championsResponse = await fetch('/.netlify/functions/getLegendaryChampions');
        const championsData = await championsResponse.json();
        setLegendaryChampions(championsData);

      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        // Implementa qui una gestione dell'errore visibile all'utente
      }
    };

    fetchData();
  }, []); // Esegue solo al montaggio del componente

  // Definisce i tipi di schegge disponibili con le loro proprietà
  const shardTypes = [
    { id: 'ancient', name: 'ANCIENT', color: 'bg-blue-500' },
    { id: 'void', name: 'VOID', color: 'bg-purple-500' },
    { id: 'primal', name: 'PRIMAL', color: 'bg-red-500' },
    { id: 'sacred', name: 'SACRED', color: 'bg-yellow-500' },
    { id: 'prism', name: 'PRISM', color: 'bg-teal-500' }
  ];

  // Funzione per aggiungere un nuovo giocatore
  const addPlayer = async () => {
    if (newPlayerName.trim()) {
      const playerToSend = {
        name: newPlayerName.trim(),
        shards: { ancient: 0, void: 0, primal: 0, sacred: 0, prism: 0 }
      };

      try {
        const response = await fetch('/.netlify/functions/createPlayer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerToSend),
        });
        if (!response.ok) throw new Error('Errore nella creazione del giocatore');
        const createdPlayer = await response.json();
        setPlayers([...players, createdPlayer]);
        setNewPlayerName('');
      } catch (error) {
        console.error("Errore nell'aggiunta del giocatore:", error);
      }
    }
  };

  // Funzione per avviare la conferma di eliminazione del giocatore
  const deletePlayer = (playerId) => {
    setPlayerToDelete(playerId);
  };

  // Funzione per confermare ed eseguire l'eliminazione del giocatore
  const confirmDeletePlayer = async () => {
    if (playerToDelete) {
      try {
        const response = await fetch('/.netlify/functions/deletePlayer', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: playerToDelete }),
        });
        if (!response.ok) throw new Error('Errore nell\'eliminazione del giocatore');

        setPlayers(players.filter(p => p.id !== playerToDelete));
        // Rimuove anche i campioni leggendari associati (la FK in DB con ON DELETE CASCADE lo farà, ma aggiorniamo anche lo stato locale)
        setLegendaryChampions(legendaryChampions.filter(c => c.player !== playerToDelete));
        setPlayerToDelete(null);
      } catch (error) {
        console.error("Errore nell'eliminazione del giocatore:", error);
      }
    }
  };

  // Funzione per annullare l'eliminazione del giocatore
  const cancelDeletePlayer = () => {
    setPlayerToDelete(null);
  };

  // Funzione per iniziare la modifica del nome di un giocatore
  const startEdit = (player) => {
    setEditingPlayer(player.id);
    setEditName(player.name);
  };

  // Funzione per salvare il nome del giocatore modificato
  const saveEdit = async () => {
    if (editingPlayer && editName.trim()) {
      try {
        const response = await fetch('/.netlify/functions/updatePlayerName', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: editingPlayer, newName: editName.trim() }),
        });
        if (!response.ok) throw new Error('Errore nell\'aggiornamento del nome del giocatore');
        const updatedPlayer = await response.json();

        setPlayers(players.map(p =>
          p.id === editingPlayer ? updatedPlayer : p
        ));
        setEditingPlayer(null);
        setEditName('');
      } catch (error) {
        console.error("Errore nel salvataggio del nome:", error);
      }
    }
  };

  // Funzione per annullare la modifica del nome del giocatore
  const cancelEdit = () => {
    setEditingPlayer(null);
    setEditName('');
  };

  // Funzione per incrementare o decrementare il conteggio delle schegge per un giocatore
  const updateShardCount = async (playerId, shardType, increment) => {
    try {
      const response = await fetch('/.netlify/functions/updatePlayerShards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, shardType, increment }),
      });
      if (!response.ok) throw new Error('Errore nell\'aggiornamento delle schegge');
      const updatedPlayer = await response.json(); // Ricevi il giocatore con le schegge aggiornate

      setPlayers(players.map(p =>
        p.id === playerId ? updatedPlayer : p
      ));
    } catch (error) {
      console.error("Errore nell'aggiornamento delle schegge:", error);
    }
  };

  // Funzione per aggiungere un nuovo campione leggendario
  const addLegendaryChampion = async () => {
    if (newLegendary.name.trim() && newLegendary.player) {
      const championToSend = {
        name: newLegendary.name.trim(),
        type: newLegendary.type,
        shardType: newLegendary.shardType,
        date: newLegendary.date,
        player: parseInt(newLegendary.player) // Assicurati che l'ID del giocatore sia un intero
      };

      try {
        const response = await fetch('/.netlify/functions/createLegendaryChampion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(championToSend),
        });
        if (!response.ok) throw new Error('Errore nella creazione del campione');
        const createdChampion = await response.json();
        setLegendaryChampions([...legendaryChampions, createdChampion]);
        setNewLegendary({
          name: '',
          type: 'normal',
          shardType: 'ancient',
          date: new Date().toISOString().split('T')[0],
          player: ''
        });
        setShowLegendaryForm(false);
      } catch (error) {
        console.error("Errore nell'aggiunta del campione leggendario:", error);
      }
    }
  };

  // Funzione per avviare la conferma di eliminazione del campione leggendario
  const deleteLegendaryChampion = (championId) => {
    setLegendaryToDelete(championId);
  };

  // Funzione per confermare ed eseguire l'eliminazione del campione leggendario
  const confirmDeleteLegendaryChampion = async () => {
    if (legendaryToDelete) {
      try {
        const response = await fetch('/.netlify/functions/deleteLegendaryChampion', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ championId: legendaryToDelete }),
        });
        if (!response.ok) throw new Error('Errore nell\'eliminazione del campione');

        setLegendaryChampions(legendaryChampions.filter(c => c.id !== legendaryToDelete));
        setLegendaryToDelete(null);
      } catch (error) {
        console.error("Errore nell'eliminazione del campione:", error);
      }
    }
  };

  // Funzione per annullare l'eliminazione del campione leggendario
  const cancelDeleteLegendaryChampion = () => {
    setLegendaryToDelete(null);
  };

  // Funzione di supporto per ottenere il nome del giocatore tramite ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Sconosciuto';
  };

  // Funzione di supporto per ottenere il colore della scheggia tramite ID
  const getShardTypeColor = (shardType) => {
    const shard = shardTypes.find(s => s.id === shardType);
    return shard ? shard.color : 'bg-gray-500';
  };

  // Funzione di supporto per ottenere il nome del tipo di scheggia tramite ID
  const getShardTypeName = (shardType) => {
    const shard = shardTypes.find(s => s.id === shardType);
    return shard ? shard.name : 'UNKNOWN';
  };

  // Funzione per calcolare il totale delle schegge di tutti i giocatori
  const getTotalShards = () => {
    return players.reduce((total, player) => {
      return total + Object.values(player.shards || {}).reduce((sum, count) => sum + count, 0);
    }, 0);
  };

  // Funzione per ottenere la data corrente in formato italiano
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('it-IT');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-inter">
      {/* Stili globali per il font e la scrollbar */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Scrollbar personalizzata per una migliore estetica */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #2d3748; /* gray-800 */
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #4a5568; /* gray-700 */
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #6b7280; /* gray-600 */
          }
          .hover\\:bg-gray-750:hover {
            background-color: #3f495a; /* Grigio leggermente più chiaro per l'hover */
          }
           /* Animazioni per i modali */
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-up {
            from { transform: scale(0.95); }
            to { transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          .animate-scale-up {
            animation: scale-up 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto">
        {/* Sezione Intestazione */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Gem className="text-yellow-400" />
            Raid Shadow Legends - Tracciatore Schegge
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Data: {getCurrentDate()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Giocatori: {players.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4" />
              <span>Schegge totali: {getTotalShards()}</span>
            </div>
          </div>
        </div>

        {/* Sezione Aggiungi Giocatore */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Aggiungi Giocatore</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nome giocatore"
              className="flex-1 px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button
              onClick={addPlayer}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          </div>
        </div>

        {/* Sezione Tabella Giocatori */}
        {players.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Schegge per Giocatore</h2>
            <table className="w-full min-w-[600px] table-auto">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-2 font-semibold">Giocatore</th>
                  {shardTypes.map(shard => (
                    <th key={shard.id} className="text-center py-2 px-2 font-semibold">
                      <div className={`${shard.color} text-white px-2 py-1 rounded-md text-sm shadow-sm`}>
                        {shard.name}
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-2 px-2 font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors duration-200">
                    <td className="py-2 px-2 font-medium">
                      {editingPlayer === player.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm w-full"
                          />
                          <button
                            onClick={saveEdit}
                            className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-gray-600 transition-colors"
                            title="Salva modifiche"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-600 transition-colors"
                            title="Annulla modifiche"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">{player.name}</span>
                          <button
                            onClick={() => startEdit(player)}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                            title="Modifica nome giocatore"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    {shardTypes.map(shard => (
                      <td key={shard.id} className="text-center py-2 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateShardCount(player.id, shard.id, -1)}
                            className="w-6 h-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                            title={`Diminuisci ${shard.name}`}
                          >
                            -
                          </button>
                          <span className="font-bold text-lg min-w-[2rem] text-center">
                            {player.shards[shard.id]}
                          </span>
                          <button
                            onClick={() => updateShardCount(player.id, shard.id, 1)}
                            className="w-6 h-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                            title={`Aumenta ${shard.name}`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    ))}
                    <td className="text-center py-2 px-2">
                      <button
                        onClick={() => deletePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700 transition-colors"
                        title="Elimina giocatore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sezione Campioni Leggendari */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-yellow-400">LEGGENDARI OTTENUTI</h2>
            <button
              onClick={() => setShowLegendaryForm(!showLegendaryForm)}
              className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Leggendario
            </button>
          </div>

          {/* Modulo Aggiungi Leggendario */}
          {showLegendaryForm && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  value={newLegendary.name}
                  onChange={(e) => setNewLegendary({...newLegendary, name: e.target.value})}
                  placeholder="Nome campione"
                  className="px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />
                <select
                  value={newLegendary.type}
                  onChange={(e) => setNewLegendary({...newLegendary, type: e.target.value})}
                  className="px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="normal">Normale</option>
                  <option value="void">Void</option>
                </select>
                <select
                  value={newLegendary.shardType}
                  onChange={(e) => setNewLegendary({...newLegendary, shardType: e.target.value})}
                  className="px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleziona tipo scheggia</option>
                  {shardTypes.map(shard => (
                    <option key={shard.id} value={shard.id}>{shard.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newLegendary.date}
                  onChange={(e) => setNewLegendary({...newLegendary, date: e.target.value})}
                  className="px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={newLegendary.player}
                  onChange={(e) => setNewLegendary({...newLegendary, player: e.target.value})}
                  className="px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleziona giocatore</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={addLegendaryChampion}
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800 px-4 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => setShowLegendaryForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 px-4 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {/* Elenco Campioni Leggendari */}
          {legendaryChampions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legendaryChampions.map(champion => (
                <div key={champion.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-yellow-400">{champion.name}</h3>
                    <button
                      onClick={() => deleteLegendaryChampion(champion.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-600 transition-colors"
                      title="Elimina campione"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Tipo: <span className={champion.type === 'void' ? 'text-purple-400 font-medium' : 'text-blue-400 font-medium'}>
                      {champion.type === 'void' ? 'Void' : 'Normale'}
                    </span></p>
                    <p>Scheggia: <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getShardTypeColor(champion.shardType)} text-white`}>
                      {getShardTypeName(champion.shardType)}
                    </span></p>
                    <p>Data: <span className="font-medium">{new Date(champion.date).toLocaleDateString('it-IT')}</span></p>
                    <p>Giocatore: <span className="text-green-400 font-medium">{getPlayerName(champion.player)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 italic">
              Nessun campione leggendario ancora ottenuto. Aggiungine uno!
            </div>
          )}
        </div>

        {/* Modale di Conferma per l'Eliminazione del Giocatore */}
        {playerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-up">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Conferma Eliminazione Giocatore
              </h3>
              <p className="text-gray-300 mb-6">
                Sei sicuro di voler eliminare il giocatore <span className="font-bold text-green-400">
                  {getPlayerName(playerToDelete)}
                </span>?
                <br />
                <span className="text-sm text-yellow-400 mt-2 block">
                  Verranno eliminati anche tutti i suoi campioni leggendari associati. Questa azione è irreversibile.
                </span>
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelDeletePlayer}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 rounded-md transition-colors duration-200 shadow-md"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeletePlayer}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-md transition-colors duration-200 shadow-md"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale di Conferma per l'Eliminazione del Campione Leggendario */}
        {legendaryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-up">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Conferma Eliminazione Campione
              </h3>
              <p className="text-gray-300 mb-6">
                Sei sicuro di voler eliminare il campione leggendario <span className="font-bold text-yellow-400">
                  {legendaryChampions.find(c => c.id === legendaryToDelete)?.name || 'Sconosciuto'}
                </span>?
                <br />
                <span className="text-sm text-yellow-400 mt-2 block">
                  Questa azione è irreversibile.
                </span>
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelDeleteLegendaryChampion}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 rounded-md transition-colors duration-200 shadow-md"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeleteLegendaryChampion}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-md transition-colors duration-200 shadow-md"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShardTracker;