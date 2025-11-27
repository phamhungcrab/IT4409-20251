import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resultService, ResultItem } from '../services/resultService';
import useAuth from '../hooks/useAuth';
import ResultTable from '../components/ResultTable';

const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      try {
        const data = await resultService.getResultsByStudent(user.id);
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div>
        <p className="text-sm text-slate-300">{t('nav.results')}</p>
        <h1 className="text-3xl font-semibold text-white">Scoreboard</h1>
      </div>
      <ResultTable results={results} />
    </div>
  );
};

export default ResultsPage;
