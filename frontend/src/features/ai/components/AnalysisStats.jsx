/**
 * AnalysisStats.jsx
 *
 * Renders the 4-card statistics grid displaying totals for Functional Requirements,
 * Non-Functional Requirements, User Actors, and Domain Entities.
 */

const StatCard = ({ label, value }) => (
  <div
    className="p-4 rounded-xl flex flex-col justify-center min-w-0"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <p className="text-xs text-slate-400 mb-1 truncate">{label}</p>
    <p className="text-xl sm:text-2xl font-bold text-slate-100 truncate">{value}</p>
  </div>
);

const AnalysisStats = ({
  functionalCount = 0,
  nonFunctionalCount = 0,
  actorsCount = 0,
  entitiesCount = 0,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
      <StatCard label="Functional" value={functionalCount} />
      <StatCard label="Non-Functional" value={nonFunctionalCount} />
      <StatCard label="User Actors" value={actorsCount} />
      <StatCard label="Domain Entities" value={entitiesCount} />
    </div>
  );
};

export default AnalysisStats;
