import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';

const cache = new Map<string, any>();

interface FetchResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    // FIX: Use Dispatch and SetStateAction types from React.
    setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * A custom hook to fetch data from an async API function with caching.
 * Navigating to a view with cached data will be instant, with no loading spinner.
 * @param key A unique key for caching. If null, fetching is disabled.
 * @param apiCall The async function that fetches data.
 * @returns An object with data, loading state, error state, and a refresh function.
 */
export function useDataFetching<T>(key: string | null, apiCall: () => Promise<T>): FetchResult<T> {
    const [data, setData] = useState<T | null>(() => (key ? cache.get(key) || null : null));
    const [loading, setLoading] = useState<boolean>(() => (key ? !cache.has(key) : false));
    const [error, setError] = useState<Error | null>(null);
    
    // Store apiCall in a ref to avoid it being a dependency of useEffect,
    // which would cause re-fetches on every render.
    const savedApiCall = useRef(apiCall);
    useEffect(() => {
        savedApiCall.current = apiCall;
    }, [apiCall]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!key) return;

        if (isRefresh) {
            cache.delete(key);
        }
        
        // Show loader only if there's no data or it's a forced refresh
        if (!cache.has(key) || isRefresh) {
            setLoading(true);
            setError(null);
            try {
                const result = await savedApiCall.current();
                cache.set(key, result);
                setData(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }
    }, [key]);

    useEffect(() => {
        fetchData();
    }, [key]);

    const refresh = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    return { data, loading, error, refresh, setData };
}