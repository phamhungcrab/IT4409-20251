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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('nav.results')}</h1>
      <ResultTable results={results} />
    </div>
  );
};

export default ResultsPage;