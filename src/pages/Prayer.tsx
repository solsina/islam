import Header from '../components/Header';

export default function Prayer() {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header title="Prières" />
      <div className="px-4 pt-2 pb-6">
        <p className="text-slate-400 text-center">Les horaires de prière sont intégrés à l'accueil.</p>
      </div>
    </div>
  );
}
