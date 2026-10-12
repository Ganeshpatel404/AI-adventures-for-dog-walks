import { useState } from 'react';
import type { FC } from 'react';
import { Compass } from 'lucide-react';
import type { Quest } from '../types';
import { QuestCard } from './QuestCard';

interface QuestListProps {
  sampleQuests: Quest[];
  customQuests: Quest[];
  onStartWalk: (quest: Quest) => void;
  activeWalkQuestId?: string;
}

export const QuestList: FC<QuestListProps> = ({
  sampleQuests,
  customQuests,
  onStartWalk,
  activeWalkQuestId,
}) => {
  const [filterTheme, setFilterTheme] = useState<string>('all');

  const allQuests = [...customQuests, ...sampleQuests];

  const filteredQuests = allQuests.filter((q) => {
    if (filterTheme === 'all') return true;
    return q.theme === filterTheme;
  });

  return (
    <section className="quests-section" id="sample-quests-section">
      <div className="container">
        <div className="section-header text-center">
          <div className="badge-pill badge-forest">
            <Compass size={14} />
            <span>Curated Expeditions</span>
          </div>
          <h2 className="section-title">Ready-to-Explore Quest Cards</h2>
          <p className="section-subtitle">
            Three handcrafted sample quests designed to maximize sensory enrichment, plus any AI quests
            you create in the planner. Choose a path and tap Start Walk Mode!
          </p>

          {/* Theme Filters */}
          <div className="quest-filter-bar">
            <button
              className={`filter-btn ${filterTheme === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTheme('all')}
            >
              All Quests ({allQuests.length})
            </button>
            <button
              className={`filter-btn ${filterTheme === 'detective' ? 'active' : ''}`}
              onClick={() => setFilterTheme('detective')}
            >
              🐿️ Detective Mysteries
            </button>
            <button
              className={`filter-btn ${filterTheme === 'nature' ? 'active' : ''}`}
              onClick={() => setFilterTheme('nature')}
            >
              🌲 Forest & Nature
            </button>
            <button
              className={`filter-btn ${filterTheme === 'urban' ? 'active' : ''}`}
              onClick={() => setFilterTheme('urban')}
            >
              🏙️ Urban City Safaris
            </button>
          </div>
        </div>

        {/* Quests Grid */}
        <div className="quests-grid">
          {filteredQuests.map((quest) => {
            // Find if this is one of the initial 3 samples
            const sampleIndex = sampleQuests.findIndex((sq) => sq.id === quest.id);
            const isCustom = customQuests.some((cq) => cq.id === quest.id);
            const label = isCustom
              ? '✨ AI Custom Adventure'
              : sampleIndex !== -1
                ? `Sample Quest ${sampleIndex + 1}`
                : 'Featured Quest';

            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                indexLabel={label}
                onStartWalk={onStartWalk}
                isActiveWalkQuest={activeWalkQuestId === quest.id}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
