import { useParams } from 'react-router-dom';

export default function InvestigationPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Investigation</h1>
      <p className="text-muted-foreground">Token: {token}</p>
      <p className="text-muted-foreground mt-4">Coming soon...</p>
    </div>
  );
}