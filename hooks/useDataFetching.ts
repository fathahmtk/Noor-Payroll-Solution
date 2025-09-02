import { useState, useEffect, useCallback } from 'react';

interface FetchResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * A custom hook to fetch data from an async API function.
 * Handles loading, error, and data states.
 * @param apiCall The async function that fetches data.
 * @returns An object with data, loading state, error state, and a refresh function.
 */
export function useDataFetching<T>(apiCall: () => Promise<T>): FetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData, apiCall]);

    return { data, loading, error, refresh: fetchData, setData };
}
